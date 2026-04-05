<template>
  <div class="comment-item" :class="{ 'comment-item--reply': isReply }">
    <BAvatar :src="comment.userAvatar" :size="isReply ? 28 : 36" :alt="comment.nickName" />
    <div class="comment-item__body">
      <div class="comment-item__header">
        <span class="comment-item__name">{{ comment.nickName }}</span>
        <span class="comment-item__time">{{ formatRelativeTime(comment.createdAt) }}</span>
      </div>
      <p class="comment-item__text">
        <span v-if="replyTo" class="comment-item__reply-to">回复 {{ replyTo }}：</span>
        {{ comment.content }}
      </p>
      <div class="comment-item__actions">
        <button
          class="comment-action"
          :class="{ active: comment.isDigg }"
          @click="handleDigg"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
          <span>{{ comment.diggCount || '点赞' }}</span>
        </button>
        <button class="comment-action" @click="toggleReplyForm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
          <span>回复</span>
        </button>
        <button 
          v-if="comment.subComments?.length"
          class="comment-action comment-action--expand"
          @click="toggleExpand"
        >
          <svg 
            class="expand-icon"
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
            :class="{ expanded: isExpanded }"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          <span>{{ comment.subComments.length }} 条回复</span>
        </button>
      </div>

      <!-- 回复表单 -->
      <Transition name="slide">
        <div v-if="showReplyForm" class="reply-form">
          <div class="reply-form__input-wrapper">
            <textarea
              v-model="replyContent"
              class="reply-form__input"
              :placeholder="`回复 ${comment.nickName}...`"
              rows="2"
              @keydown.ctrl.enter="submitReply"
            ></textarea>
            <EPicker @select="handleEmojiSelect" />
          </div>
          <div class="reply-form__footer">
            <span class="reply-form__hint">Ctrl + Enter 发送</span>
            <div class="reply-form__btns">
              <button class="reply-form__btn reply-form__btn--cancel" @click="cancelReply">取消</button>
              <button
                class="reply-form__btn reply-form__btn--submit"
                :disabled="!replyContent.trim() || submitting"
                @click="submitReply"
              >
                {{ submitting ? '发送中...' : '回复' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 子评论列表 -->
      <Transition name="collapse">
        <div v-if="comment.subComments?.length && isExpanded" class="comment-children">
          <CommentItem
            v-for="subComment in comment.subComments"
            :key="subComment.id"
            :comment="subComment"
            :is-reply="true"
            :reply-to="comment.nickName"
            :article-id="articleId"
            :root-parent-id="rootParentId || comment.id"
            @reply-submitted="$emit('replySubmitted')"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { CommentTreeNode } from '@/types'
import { createComment, diggComment } from '@/api/modules/comment'
import { formatRelativeTime } from '@/utils'
import { useUserStore } from '@/stores/user'
import BAvatar from '@/components/base/BAvatar/index.vue'
import EPicker from '@/components/base/EPicker/index.vue'

const props = defineProps<{
  comment: CommentTreeNode
  isReply?: boolean
  replyTo?: string
  articleId: number
  rootParentId?: number
}>()

const emit = defineEmits<{
  replySubmitted: []
}>()

const router = useRouter()
const userStore = useUserStore()

const showReplyForm = ref(false)
const replyContent = ref('')
const submitting = ref(false)
// 根评论默认展开，子评论默认收缩
const isExpanded = ref(!props.isReply)

function handleEmojiSelect(emoji: string) {
  replyContent.value += emoji
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function toggleReplyForm() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  showReplyForm.value = !showReplyForm.value
  if (!showReplyForm.value) {
    replyContent.value = ''
  }
}

function cancelReply() {
  showReplyForm.value = false
  replyContent.value = ''
}

async function submitReply() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  if (!replyContent.value.trim()) {
    return
  }

  submitting.value = true
  try {
    await createComment({
      content: replyContent.value,
      articleID: props.articleId,
      parentID: props.comment.id,
      rootParentID: props.rootParentId || props.comment.id
    })
    replyContent.value = ''
    showReplyForm.value = false
    emit('replySubmitted')
  } catch (error) {
    console.error('Failed to submit reply:', error)
  } finally {
    submitting.value = false
  }
}

async function handleDigg() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  try {
    await diggComment(props.comment.id)
    props.comment.isDigg = !props.comment.isDigg
    props.comment.diggCount += props.comment.isDigg ? 1 : -1
  } catch (error) {
    console.error('Failed to digg comment:', error)
  }
}
</script>

<style scoped lang="scss">
.comment-item {
  display: flex;
  gap: $space-3;
  padding: $space-4 0;

  &--reply {
    padding: $space-3 0;
    border-top: 1px solid $border-light;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $space-2;
    margin-bottom: $space-1;
  }

  &__name {
    font-weight: $font-weight-medium;
    color: $text-primary;
    font-size: $text-sm;
  }

  &__time {
    font-size: $text-xs;
    color: $text-tertiary;
  }

  &__text {
    font-size: $text-sm;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: $space-2;
    word-break: break-word;
  }

  &__reply-to {
    color: $primary;
    font-weight: $font-weight-medium;
  }

  &__actions {
    display: flex;
    gap: $space-3;
    margin-bottom: $space-2;
  }
}

.comment-action {
  display: flex;
  align-items: center;
  gap: $space-1;
  padding: $space-1 $space-2;
  border: none;
  background: none;
  color: $text-tertiary;
  font-size: $text-xs;
  cursor: pointer;
  border-radius: $radius-sm;
  transition: all $duration-fast;

  &:hover {
    color: $primary;
    background: rgba($primary, 0.1);
  }

  &.active {
    color: $primary;
  }

  &--expand {
    .expand-icon {
      transition: transform 0.2s ease;
      
      &.expanded {
        transform: rotate(180deg);
      }
    }
  }
}

.reply-form {
  margin-bottom: $space-3;
  background: $bg-secondary;
  border-radius: $radius-md;
  padding: $space-3;

  &__input-wrapper {
    position: relative;
    
    .reply-form__input {
      width: 100%;
      padding-right: 44px;
    }
    
    :deep(.emoji-picker) {
      position: absolute;
      bottom: 8px;
      right: 8px;
    }
  }
  
  &__input {
    width: 100%;
    padding: $space-2 $space-3;
    border: 1px solid $border;
    border-radius: $radius-md;
    font-size: $text-sm;
    resize: none;
    font-family: inherit;
    background: $bg-primary;
    color: $text-primary;

    &:focus {
      outline: none;
      border-color: $primary;
    }

    &::placeholder {
      color: $text-tertiary;
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: $space-2;
  }

  &__hint {
    font-size: $text-xs;
    color: $text-tertiary;
  }

  &__btns {
    display: flex;
    gap: $space-2;
  }

  &__btn {
    padding: $space-1 $space-3;
    border: none;
    border-radius: $radius-sm;
    font-size: $text-xs;
    cursor: pointer;
    transition: all $duration-fast;

    &--cancel {
      background: none;
      color: $text-secondary;

      &:hover {
        color: $text-primary;
      }
    }

    &--submit {
      background: $primary;
      color: white;

      &:hover:not(:disabled) {
        background: darken($primary, 8%);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}

.comment-children {
  margin-left: $space-2;
  padding-left: $space-4;
  border-left: 2px solid $border-light;
}

// 展开/收起动画
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 1000px;
}

// 回复表单动画
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

[data-theme="dark"] {
  .comment-item {
    &--reply {
      border-color: $dark-border;
    }
  }

  .comment-item__name {
    color: $dark-text-primary;
  }

  .comment-item__text {
    color: $dark-text-secondary;
  }

  .reply-form {
    background: $dark-bg-secondary;

    &__input {
      background: $dark-bg-primary;
      border-color: $dark-border;
      color: $dark-text-primary;

      &:focus {
        border-color: $primary;
      }
    }
  }

  .comment-children {
    border-color: $dark-border;
  }
}
</style>
