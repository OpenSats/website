import { withAuth } from 'next-auth/middleware'
import { refreshToken } from './server/utils/auth'

export default withAuth({
  pages: {
    signIn: '/',
  },
  callbacks: {
    async authorized({ token }) {
      if (!token) return false

      if (Date.now() < token.accessTokenExpiresAt && !token.error) {
        return true
      }

      const newToken = await refreshToken(token)

      if (Date.now() < newToken.accessTokenExpiresAt && !newToken.error) {
        return true
      }

      return false
    },
  },
})

export const config = { matcher: ['/:path/account/:path*'] }
