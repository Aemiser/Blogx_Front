import request from '../index'
import type {
  Banner,
  CreateBannerParams,
  UpdateBannerParams,
  ImageInfo,
  QiniuUploadToken,
  PaginatedData
} from '@/types'

/**
 * Banner 列表
 */
export function getBannerList(params?: { page?: string; limit?: string; show?: boolean }) {
  return request<PaginatedData<Banner>>({
    url: '/api/banner',
    method: 'GET',
    params
  })
}

/**
 * 创建 Banner
 */
export function createBanner(data: CreateBannerParams) {
  return request<any>({
    url: '/api/banner',
    method: 'POST',
    data
  })
}

/**
 * 修改 Banner
 */
export function updateBanner(id: number, data: UpdateBannerParams) {
  return request<any>({
    url: `/api/banner/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除 Banner
 */
export function deleteBanner(IDList: number[]) {
  return request<any>({
    url: '/api/banner',
    method: 'DELETE',
    data: { IDList }
  })
}

/**
 * 上传图片
 */
export function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<ImageInfo>({
    url: '/api/images',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 图片列表
 */
export function getImageList(params?: { page?: string; limit?: string }) {
  return request<PaginatedData<ImageInfo>>({
    url: '/api/images',
    method: 'GET',
    params
  })
}

/**
 * 删除图片
 */
export function deleteImages(IDList: number[]) {
  return request<any>({
    url: '/api/images',
    method: 'DELETE',
    data: { IDList }
  })
}

/**
 * 七牛上传 Token
 */
export function getQiniuToken(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<QiniuUploadToken>({
    url: '/api/images/qiniu',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 图片转存
 */
export function transferImage(url: string) {
  return request<string>({
    url: '/api/images/transfer',
    method: 'POST',
    data: { url }
  })
}
