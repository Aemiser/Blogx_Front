// Simple test to verify our chat utility imports correctly
import { chatWS } from '@/utils/index'

describe('Chat WebSocket Utility', () => {
  it('should export a chatWS instance', () => {
    expect(chatWS).toBeDefined()
    expect(typeof chatWS.connect).toBe('function')
    expect(typeof chatWS.disconnect).toBe('function')
    expect(typeof chatWS.sendText).toBe('function')
    expect(typeof chatWS.onMessage).toBe('function')
  })
})