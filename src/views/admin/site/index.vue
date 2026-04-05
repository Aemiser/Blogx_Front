<template>
  <div class="admin-site">
    <div class="page-header">
      <h1 class="page-title">站点管理</h1>
    </div>
    
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.value"
        class="tab-btn" 
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div v-if="activeTab === 'site'" class="settings-content">
      <div class="settings-card">
        <div class="card-header">
          <h3 class="card-title">站点信息</h3>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">站点标题</label>
              <input v-model="siteForm.siteInfo.title" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Logo</label>
              <input v-model="siteForm.siteInfo.logo" type="text" class="form-input" placeholder="图片URL" />
            </div>
            <div class="form-group">
              <label class="form-label">备案号</label>
              <input v-model="siteForm.siteInfo.beian" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">模式</label>
              <select v-model="siteForm.siteInfo.mode" class="form-select">
                <option :value="0">公开</option>
                <option :value="1">私有</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div class="settings-card">
        <div class="card-header">
          <h3 class="card-title">项目信息</h3>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">项目标题</label>
              <input v-model="siteForm.project.title" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">图标</label>
              <input v-model="siteForm.project.icon" type="text" class="form-input" placeholder="图片URL" />
            </div>
            <div class="form-group">
              <label class="form-label">路径</label>
              <input v-model="siteForm.project.webPath" type="text" class="form-input" />
            </div>
          </div>
        </div>
      </div>
      
      <div class="settings-card">
        <div class="card-header">
          <h3 class="card-title">SEO</h3>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">关键词</label>
              <input v-model="siteForm.seo.keywords" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">描述</label>
              <input v-model="siteForm.seo.description" type="text" class="form-input" />
            </div>
          </div>
        </div>
      </div>
      
      <div class="settings-card">
        <div class="card-header">
          <h3 class="card-title">关于</h3>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">建站日期</label>
              <input v-model="siteForm.about.siteDate" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">QQ</label>
              <input v-model="siteForm.about.qq" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">微信</label>
              <input v-model="siteForm.about.wechat" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Gitee</label>
              <input v-model="siteForm.about.gitee" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">GitHub</label>
              <input v-model="siteForm.about.github" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">B站</label>
              <input v-model="siteForm.about.bilibili" type="text" class="form-input" />
            </div>
          </div>
        </div>
      </div>
      
      <div class="settings-card">
        <div class="card-header">
          <h3 class="card-title">登录设置</h3>
        </div>
        <div class="card-body">
          <div class="switch-grid">
            <div class="switch-item">
              <div class="switch-info">
                <span class="switch-label">QQ登录</span>
                <span class="switch-desc">允许用户使用QQ账号登录</span>
              </div>
              <Switch v-model="siteForm.login.qqLogin" />
            </div>
            <div class="switch-item">
              <div class="switch-info">
                <span class="switch-label">用户名密码登录</span>
                <span class="switch-desc">允许用户使用用户名和密码登录</span>
              </div>
              <Switch v-model="siteForm.login.usernamePwdLogin" />
            </div>
            <div class="switch-item">
              <div class="switch-info">
                <span class="switch-label">邮箱登录</span>
                <span class="switch-desc">允许用户使用邮箱和密码登录</span>
              </div>
              <Switch v-model="siteForm.login.emailLogin" />
            </div>
            <div class="switch-item">
              <div class="switch-info">
                <span class="switch-label">验证码</span>
                <span class="switch-desc">登录时需要输入验证码</span>
              </div>
              <Switch v-model="siteForm.login.captcha" />
            </div>
          </div>
        </div>
      </div>
      
      <div class="settings-card">
        <div class="card-header">
          <h3 class="card-title">文章设置</h3>
        </div>
        <div class="card-body">
          <div class="switch-grid">
            <div class="switch-item">
              <div class="switch-info">
                <span class="switch-label">无需审核发布</span>
                <span class="switch-desc">用户发布文章无需管理员审核</span>
              </div>
              <Switch v-model="siteForm.article.noExamine" />
            </div>
          </div>
          <div class="form-row single">
            <div class="form-group">
              <label class="form-label">评论层级</label>
              <select v-model="siteForm.article.commentline" class="form-select">
                <option :value="1">1级</option>
                <option :value="2">2级</option>
                <option :value="3">3级</option>
                <option :value="4">4级</option>
                <option :value="5">5级</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="btn btn-primary" @click="saveSiteInfo">保存设置</button>
      </div>
    </div>
    
    <div v-else-if="activeTab === 'image'" class="settings-content">
      <div class="settings-card">
        <div class="card-header">
          <h3 class="card-title">图片配置</h3>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">文件大小限制</label>
              <div class="input-with-unit">
                <input v-model.number="imageForm.size" type="number" class="form-input" />
                <select v-model="imageForm.type" class="form-select unit-select">
                  <option value="kb">KB</option>
                  <option value="mb">MB</option>
                  <option value="gb">GB</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">存储目录</label>
              <input v-model="imageForm.imageDir" type="text" class="form-input" placeholder="如: images" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">允许上传的类型</label>
              <div class="tag-list">
                <div class="tag-item" v-for="ext in imageForm.writeList" :key="ext">
                  <span>{{ ext }}</span>
                  <button type="button" class="tag-delete" @click="removeWriteList(ext)">×</button>
                </div>
                <div class="tag-add">
                  <input 
                    v-model="newExtension" 
                    type="text" 
                    class="tag-input" 
                    placeholder="输入扩展名"
                    @keyup.enter="addWriteList"
                  />
                  <button type="button" class="add-btn" @click="addWriteList">添加</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="btn btn-primary" @click="saveImageConfig">保存设置</button>
      </div>
    </div>
    
    <div v-else-if="activeTab === 'email'" class="settings-content">
      <div class="settings-card">
        <div class="card-header">
          <h3 class="card-title">邮箱配置</h3>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">端口</label>
              <input v-model="emailForm.port" type="number" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">发送邮箱</label>
              <input v-model="emailForm.sendEmail" type="email" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">授权码</label>
              <input v-model="emailForm.AuthCode" type="password" class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">发送昵称</label>
              <input v-model="emailForm.sendNickname" type="text" class="form-input" />
            </div>
          </div>
          <div class="switch-grid">
            <div class="switch-item">
              <div class="switch-info">
                <span class="switch-label">SSL</span>
              </div>
              <Switch v-model="emailForm.SSL" />
            </div>
            <div class="switch-item">
              <div class="switch-info">
                <span class="switch-label">TLS</span>
              </div>
              <Switch v-model="emailForm.TLS" />
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="btn btn-primary" @click="saveEmailConfig">保存设置</button>
      </div>
    </div>
    
    <div v-else-if="activeTab === 'qq'" class="settings-content">
      <div class="settings-card">
        <div class="card-header">
          <h3 class="card-title">QQ登录配置</h3>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">AppID</label>
              <input v-model="qqForm.appID" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">AppKey</label>
              <input v-model="qqForm.appKey" type="password" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">回调地址</label>
              <input v-model="qqForm.redirect" type="text" class="form-input" />
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="btn btn-primary" @click="saveQQConfig">保存设置</button>
      </div>
    </div>
    
    <div v-else-if="activeTab === 'qiniu'" class="settings-content">
      <div class="settings-card">
        <div class="card-header">
          <h3 class="card-title">七牛云存储配置</h3>
        </div>
        <div class="card-body">
          <div class="switch-grid">
            <div class="switch-item">
              <div class="switch-info">
                <span class="switch-label">启用七牛云</span>
                <span class="switch-desc">启用后将使用七牛云存储图片文件</span>
              </div>
              <Switch v-model="qiniuForm.enable" />
            </div>
          </div>
          <div class="form-row" :class="{ 'is-disabled': !qiniuForm.enable }">
            <div class="form-group">
              <label class="form-label">AccessKey</label>
              <input v-model="qiniuForm.accessKey" type="text" class="form-input" :disabled="!qiniuForm.enable" />
            </div>
            <div class="form-group">
              <label class="form-label">SecretKey</label>
              <input v-model="qiniuForm.secretKey" type="password" class="form-input" :disabled="!qiniuForm.enable" />
            </div>
            <div class="form-group">
              <label class="form-label">Bucket</label>
              <input v-model="qiniuForm.bucket" type="text" class="form-input" :disabled="!qiniuForm.enable" />
            </div>
            <div class="form-group">
              <label class="form-label">域名</label>
              <input v-model="qiniuForm.uri" type="text" class="form-input" :disabled="!qiniuForm.enable" />
            </div>
            <div class="form-group">
              <label class="form-label">区域</label>
              <input v-model="qiniuForm.region" type="text" class="form-input" :disabled="!qiniuForm.enable" />
            </div>
            <div class="form-group">
              <label class="form-label">前缀</label>
              <input v-model="qiniuForm.prefix" type="text" class="form-input" :disabled="!qiniuForm.enable" />
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="btn btn-primary" @click="saveQiniuConfig">保存设置</button>
      </div>
    </div>
    
    <div v-else-if="activeTab === 'ai'" class="settings-content">
      <div class="settings-card">
        <div class="card-header">
          <h3 class="card-title">AI配置</h3>
        </div>
        <div class="card-body">
          <div class="switch-grid">
            <div class="switch-item">
              <div class="switch-info">
                <span class="switch-label">启用AI助手</span>
                <span class="switch-desc">启用AI助手功能，提供智能对话服务</span>
              </div>
              <Switch v-model="aiForm.enable" />
            </div>
          </div>
          <div class="form-row" :class="{ 'is-disabled': !aiForm.enable }">
            <div class="form-group">
              <label class="form-label">SecretKey</label>
              <input v-model="aiForm.secretKey" type="password" class="form-input" :disabled="!aiForm.enable" />
            </div>
            <div class="form-group">
              <label class="form-label">昵称</label>
              <input v-model="aiForm.nickname" type="text" class="form-input" :disabled="!aiForm.enable" />
            </div>
            <div class="form-group">
              <label class="form-label">头像</label>
              <input v-model="aiForm.avatar" type="text" class="form-input" placeholder="图片URL" :disabled="!aiForm.enable" />
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="btn btn-primary" @click="saveAIConfig">保存设置</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { 
  getSiteInfo, 
  updateSiteInfo,
  getEmailConfig,
  updateEmailConfig,
  getQQConfig,
  updateQQConfig,
  getQiniuConfig,
  updateQiniuConfig,
  getAIConfig,
  updateAIConfig,
  getImageConfig,
  updateImageConfig
} from '@/api/modules/site'
import Switch from '@/components/base/Switch/index.vue'

const tabs = [
  { label: '站点', value: 'site' },
  { label: '图片', value: 'image' },
  { label: '邮箱', value: 'email' },
  { label: 'QQ登录', value: 'qq' },
  { label: '七牛云', value: 'qiniu' },
  { label: 'AI', value: 'ai' }
]

const activeTab = ref('site')

const siteForm = ref({
  siteInfo: { title: '', logo: '', beian: '', mode: 0 },
  project: { title: '', icon: '', webPath: '' },
  seo: { keywords: '', description: '' },
  about: { siteDate: '', qq: '', wechat: '', gitee: '', github: '', bilibili: '' },
  login: { qqLogin: false, usernamePwdLogin: false, emailLogin: false, captcha: false },
  article: { noExamine: false, commentline: 3 }
})

const emailForm = ref({
  domain: '',
  port: 587,
  sendEmail: '',
  AuthCode: '',
  sendNickname: '',
  SSL: false,
  TLS: false
})

const qqForm = ref({
  appID: '',
  appKey: '',
  redirect: ''
})

const qiniuForm = ref({
  enable: false,
  accessKey: '',
  secretKey: '',
  bucket: '',
  uri: '',
  region: '',
  prefix: ''
})

const aiForm = ref({
  enable: false,
  secretKey: '',
  nickname: '',
  avatar: ''
})

const imageForm = ref({
  size: 3,
  type: 'mb' as 'kb' | 'mb' | 'gb',
  writeList: [] as string[],
  imageDir: ''
})

const newExtension = ref('')

function addWriteList() {
  const ext = newExtension.value.trim().toLowerCase()
  if (ext && !imageForm.value.writeList.includes(ext)) {
    imageForm.value.writeList.push(ext)
  }
  newExtension.value = ''
}

function removeWriteList(ext: string) {
  const index = imageForm.value.writeList.indexOf(ext)
  if (index > -1) {
    imageForm.value.writeList.splice(index, 1)
  }
}

async function fetchSiteInfo() {
  try {
    const res = await getSiteInfo()
    const data = res.data
    if (data.article && data.article.commentline === undefined) {
      data.article.commentline = 3
    }
    siteForm.value = data as any
  } catch (error) {
    console.error('Failed to fetch site info:', error)
  }
}

async function saveSiteInfo() {
  try {
    await updateSiteInfo(siteForm.value)
    alert('保存成功')
  } catch (error) {
    console.error('Save failed:', error)
  }
}

async function fetchEmailConfig() {
  try {
    const res = await getEmailConfig()
    emailForm.value = res.data
  } catch (error) {
    console.error('Failed to fetch email config:', error)
  }
}

async function saveEmailConfig() {
  try {
    await updateEmailConfig(emailForm.value)
    alert('保存成功')
  } catch (error) {
    console.error('Save failed:', error)
  }
}

async function fetchQQConfig() {
  try {
    const res = await getQQConfig()
    qqForm.value = res.data
  } catch (error) {
    console.error('Failed to fetch QQ config:', error)
  }
}

async function saveQQConfig() {
  try {
    await updateQQConfig(qqForm.value)
    alert('保存成功')
  } catch (error) {
    console.error('Save failed:', error)
  }
}

async function fetchQiniuConfig() {
  try {
    const res = await getQiniuConfig()
    qiniuForm.value = res.data
  } catch (error) {
    console.error('Failed to fetch Qiniu config:', error)
  }
}

async function saveQiniuConfig() {
  try {
    await updateQiniuConfig(qiniuForm.value)
    alert('保存成功')
  } catch (error) {
    console.error('Save failed:', error)
  }
}

async function fetchAIConfig() {
  try {
    const res = await getAIConfig()
    aiForm.value = res.data
  } catch (error) {
    console.error('Failed to fetch AI config:', error)
  }
}

async function saveAIConfig() {
  try {
    await updateAIConfig(aiForm.value)
    alert('保存成功')
  } catch (error) {
    console.error('Save failed:', error)
  }
}

watch(() => activeTab.value, (newTab) => {
  if (newTab === 'email') {
    fetchEmailConfig()
  } else if (newTab === 'qq') {
    fetchQQConfig()
  } else if (newTab === 'qiniu') {
    fetchQiniuConfig()
  } else if (newTab === 'ai') {
    fetchAIConfig()
  } else if (newTab === 'image') {
    fetchImageConfig()
  }
})

async function fetchImageConfig() {
  try {
    const res = await getImageConfig()
    const data = res.data
    imageForm.value = {
      size: data.Size ?? 3,
      type: (data.Type as 'kb' | 'mb' | 'gb') ?? 'mb',
      writeList: data.WriteList ?? [],
      imageDir: data.ImageDir ?? ''
    }
  } catch (error) {
    console.error('Failed to fetch image config:', error)
  }
}

async function saveImageConfig() {
  try {
    await updateImageConfig(imageForm.value)
    alert('保存成功')
  } catch (error) {
    console.error('Save failed:', error)
  }
}

onMounted(() => {
  fetchSiteInfo()
  fetchImageConfig()
})
</script>

<style scoped lang="scss">
.admin-site {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
}

.tabs {
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  width: fit-content;
}

.tab-btn {
  padding: 10px 20px;
  font-size: 14px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #1e293b;
    background: rgba(255, 255, 255, 0.5);
  }
  
  &.active {
    background: #fff;
    color: #1e293b;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    font-weight: 500;
  }
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.card-body {
  padding: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  
  &.single {
    grid-template-columns: repeat(1, 1fr);
    margin-top: 16px;
  }
  
  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input, .form-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
    color: #9ca3af;
  }
}

.switch-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.switch-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.switch-label {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.switch-desc {
  font-size: 13px;
  color: #6b7280;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

.btn {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  
  &-primary {
    background: #3b82f6;
    color: #fff;
    
    &:hover {
      background: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .form-input {
    flex: 1;
  }
  
  .unit-select {
    width: 80px;
    padding: 10px 8px;
    font-size: 14px;
  }
  
  .unit {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }
}

.checkbox-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #e0f2fe;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #0369a1;
}

.tag-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  background: rgba(3, 105, 161, 0.2);
  color: #0369a1;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(3, 105, 161, 0.4);
  }
}

.tag-add {
  display: flex;
  gap: 8px;
}

.tag-input {
  width: 120px;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
}

.add-btn {
  padding: 6px 14px;
  border: none;
  background: #3b82f6;
  color: #fff;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
  }
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 12px;
  background: #f8fafc;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f5f9;
  }
  
  input {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  
  span {
    font-size: 13px;
    color: #475569;
    font-weight: 500;
  }
}
</style>
