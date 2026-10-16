const tokenKey = 'retain.token'

// The token is the only thing kept in the browser; the user is always loaded
// from the server so a role change or deleted account is never out of date.
export const tokenStorage = {
  clear(): void {
    localStorage.removeItem(tokenKey)
  },
  get(): string | null {
    return localStorage.getItem(tokenKey)
  },
  set(token: string): void {
    localStorage.setItem(tokenKey, token)
  },
}
