import { describe, it, expect, beforeEach } from 'vitest'
import { storage } from '@/utils/storage'

describe('Storage Utility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getToken', () => {
    it('should return null when no token is set', () => {
      expect(storage.getToken()).toBeNull()
    })

    it('should return token when set', () => {
      storage.setToken('test-token-123')
      expect(storage.getToken()).toBe('test-token-123')
    })
  })

  describe('setToken', () => {
    it('should store token in localStorage', () => {
      storage.setToken('my-token')
      expect(localStorage.getItem('blogx_token')).toBe('my-token')
    })
  })

  describe('removeToken', () => {
    it('should remove token from localStorage', () => {
      storage.setToken('to-remove')
      storage.removeToken()
      expect(storage.getToken()).toBeNull()
    })
  })

  describe('getUser', () => {
    it('should return null when no user is set', () => {
      expect(storage.getUser()).toBeNull()
    })

    it('should return parsed user object', () => {
      const user = { name: 'John', id: 1 }
      storage.setUser(user)
      expect(storage.getUser()).toEqual(user)
    })
  })

  describe('setUser', () => {
    it('should store serialized user in localStorage', () => {
      const user = { name: 'Jane', id: 2 }
      storage.setUser(user)
      expect(localStorage.getItem('blogx_user')).toBe(JSON.stringify(user))
    })
  })

  describe('removeUser', () => {
    it('should remove user from localStorage', () => {
      storage.setUser({ name: 'Temp' })
      storage.removeUser()
      expect(storage.getUser()).toBeNull()
    })
  })

  describe('getTheme/setTheme', () => {
    it('should return null when no theme is set', () => {
      expect(storage.getTheme()).toBeNull()
    })

    it('should store and retrieve theme', () => {
      storage.setTheme('dark')
      expect(storage.getTheme()).toBe('dark')
    })
  })

  describe('removeTheme', () => {
    it('should remove theme from localStorage', () => {
      storage.setTheme('light')
      storage.removeTheme()
      expect(storage.getTheme()).toBeNull()
    })
  })

  describe('clear', () => {
    it('should remove all blogx items from localStorage', () => {
      storage.setToken('token')
      storage.setUser({ id: 1 })
      storage.setTheme('dark')
      storage.clear()
      expect(storage.getToken()).toBeNull()
      expect(storage.getUser()).toBeNull()
      expect(storage.getTheme()).toBeNull()
    })
  })
})
