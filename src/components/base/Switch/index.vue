<template>
  <button
    type="button"
    class="switch"
    :class="{ 'switch--checked': modelValue, 'switch--disabled': disabled }"
    :disabled="disabled"
    role="switch"
    :aria-checked="modelValue"
    @click="toggle"
  >
    <span class="switch-thumb" />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function toggle() {
  emit('update:modelValue', !arguments[0])
}
</script>

<script lang="ts">
export default {
  methods: {
    toggle(this: { disabled?: boolean }) {
      if (this.disabled) return
      this.$emit('update:modelValue', !this.$props.modelValue)
    }
  }
}
</script>

<style scoped lang="scss">
.switch {
  position: relative;
  display: inline-flex;
  height: 24px;
  width: 44px;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 9999px;
  border: 2px solid transparent;
  background-color: #e2e8f0;
  transition: background-color 0.2s ease;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #fff, 0 0 0 4px #3b82f6;
  }
  
  &:hover:not(:disabled) {
    background-color: #cbd5e1;
  }
  
  &--checked {
    background-color: #3b82f6;
    
    &:hover:not(:disabled) {
      background-color: #2563eb;
    }
  }
  
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  height: 18px;
  width: 18px;
  border-radius: 9999px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  pointer-events: none;
}

.switch--checked .switch-thumb {
  transform: translateX(20px);
}
</style>
