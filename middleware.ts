import { withAuth } from 'next-auth/middleware'

// export { default } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/',
  },
})

export const config = { matcher: ['/account/:path*'] }
