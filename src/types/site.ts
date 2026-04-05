/**
 * 站点信息
 */
export interface SiteInfo {
  siteInfo: {
    title: string
    logo: string
    beian: string
    mode: number
  }
  project: {
    title: string
    icon: string
    webPath: string
  }
  seo: {
    keywords: string
    description: string
  }
  about: {
    siteDate: string
    qq: string
    wechat: string
    gitee: string
    github: string
    bilibili: string
  }
  login: {
    qqLogin: boolean
    usernamePwdLogin: boolean
    emailLogin: boolean
    captcha: boolean
  }
  indexRight: {
    list: any[] | null
  }
  article: {
    noExamine: boolean
    commentline?: number
  }
}

/**
 * 更新站点信息参数
 */
export interface UpdateSiteInfoParams {
  siteInfo?: {
    title?: string
    logo?: string
    beian?: string
    mode?: number
  }
  project?: {
    title?: string
    icon?: string
    webPath?: string
  }
  seo?: {
    keywords?: string
    description?: string
  }
  about?: {
    siteDate?: string
    qq?: string
    version?: string
    wechat?: string
    gitee?: string
    github?: string
    bilibili?: string
  }
  login?: {
    qqLogin?: boolean
    usernamePwdLogin?: boolean
    emailLogin?: boolean
    captcha?: boolean
  }
  indexRight?: {
    list?: any[]
  }
  article?: {
    noExamine?: boolean
    commentline?: number
  }
}

/**
 * 邮箱配置
 */
export interface EmailConfig {
  domain: string
  port: number
  sendEmail: string
  AuthCode: string
  sendNickname: string
  SSL: boolean
  TLS: boolean
}

/**
 * QQ 登录配置
 */
export interface QQConfig {
  appID: string
  appKey: string
  redirect: string
}

/**
 * 七牛云配置
 */
export interface QiniuConfig {
  enable: boolean
  accessKey: string
  secretKey: string
  bucket: string
  uri: string
  region: string
  prefix: string
  size: number
  expired: number
}

/**
 * AI 配置
 */
export interface AIConfig {
  enable: boolean
  secretKey: string
  nickname: string
  avatar: string
}

/**
 * 图片配置
 */
export interface ImageConfig {
  size: number
  type: string
  writeList: string[]
  imageDir: string
}

/**
 * 验证码
 */
export interface Captcha {
  captchaID: string
  captcha: string
}

/**
 * Banner
 */
export interface Banner {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  cover: string
  href: string
  show: boolean
}

/**
 * 创建 Banner 参数
 */
export interface CreateBannerParams {
  cover: string
  href: string
  show: boolean
}

/**
 * 更新 Banner 参数
 */
export interface UpdateBannerParams extends CreateBannerParams {}

/**
 * 图片信息
 */
export interface ImageInfo {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  filename: string
  path: string
  size: number
  hash: string
  webPath: string
}

/**
 * 七牛上传 Token
 */
export interface QiniuUploadToken {
  token: string
  key: string
  region: string
  url: string
  size: number
}

/**
 * 日志信息
 */
export interface LogInfo {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  logType: number
  title: string
  content: string
  level: number
  userID: number
  ip: string
  addr: string
  isRead: boolean
  loginStatus: boolean
  username: string
  pwd: string
  loginType: number
  serviceName: string
  userNickName: string
  userAvatar: string
}
