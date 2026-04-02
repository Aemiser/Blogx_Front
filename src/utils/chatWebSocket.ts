import { useUserStore } from '@/stores/user'
import { storage } from '@/utils'
import type { WSChatMessage, WSReceiveMessage } from '@/types'

type MessageHandler = (msg: WSReceiveMessage) => void

class ChatWebSocket {
  private ws: WebSocket | null = null
  private url: string = ''
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectInterval: number = 3000
  private messageHandlers: Set<MessageHandler> = new Set()
  private isManualClose: boolean = false
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private pendingMessages: WSChatMessage[] = []
  private isConnecting: boolean = false

  connect() {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    const userStore = useUserStore()
    if (!userStore.userInfo?.userID) {
      console.warn('[ChatWS] User not logged in, skip connect')
      return
    }

    const token = storage.getToken()
    if (!token) {
      console.warn('[ChatWS] No token, skip connect')
      return
    }

    this.isManualClose = false
    this.isConnecting = true
    const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
    const wsBaseUrl = baseUrl.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://')
    const wsUrl = `${wsBaseUrl}/api/chat/ws?token=${encodeURIComponent(token)}`
    this.url = wsUrl

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('[ChatWS] Connected')
        this.isConnecting = false
        this.startHeartbeat()
        this.flushPendingMessages()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.msgType === 9) {
            return
          }
          
          this.messageHandlers.forEach(handler => handler(data))
        } catch (e) {
          console.error('[ChatWS] Parse message error:', e)
        }
      }

      this.ws.onerror = (error) => {
        console.error('[ChatWS] Error:', error)
        this.isConnecting = false
      }

      this.ws.onclose = () => {
        console.log('[ChatWS] Disconnected')
        this.isConnecting = false
        this.stopHeartbeat()
        if (!this.isManualClose) {
          this.scheduleReconnect()
        }
      }
    } catch (e) {
      console.error('[ChatWS] Connect error:', e)
      this.isConnecting = false
      this.scheduleReconnect()
    }
  }

  disconnect() {
    this.isManualClose = true
    this.stopHeartbeat()
    this.clearReconnect()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  private flushPendingMessages() {
    if (this.pendingMessages.length === 0) return
    
    const messages = [...this.pendingMessages]
    this.pendingMessages = []
    
    messages.forEach(msg => {
      this.send(msg)
    })
  }

  send(message: WSChatMessage): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
      return true
    }
    
    this.pendingMessages.push(message)
    return false
  }

  sendText(revUserID: number, content: string) {
    return this.send({
      revUserID,
      msgType: 1,
      msg: {
        contentMsg: { content }
      }
    })
  }

  sendImage(revUserID: number, src: string) {
    return this.send({
      revUserID,
      msgType: 2,
      msg: {
        imagetMsg: { src }
      }
    })
  }

  sendMarkdown(revUserID: number, content: string) {
    return this.send({
      revUserID,
      msgType: 3,
      msg: {
        markdownMsg: { content }
      }
    })
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler)
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private scheduleReconnect() {
    this.clearReconnect()
    this.reconnectTimer = setTimeout(() => {
      console.log('[ChatWS] Reconnecting...')
      this.connect()
    }, this.reconnectInterval)
  }

  private clearReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

export const chatWS = new ChatWebSocket()