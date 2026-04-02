let token: string | null = null

export const globalToken = {
  get(): string | null {
    return token
  },
  
  set(value: string | null): void {
    token = value
  },
  
  clear(): void {
    token = null
  }
}