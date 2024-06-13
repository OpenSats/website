import { initTRPC } from '@trpc/server'

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  errorFormatter: ({ error, shape }) => {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      if (shape.data.stack) console.error(error)

      return {
        message: 'Internal server error',
        code: shape.code,
        data: {
          code: shape.data.code,
          httpStatus: shape.data.httpStatus,
          path: shape.data.path,
        },
      }
    }

    return {
      message: shape.message,
      code: shape.code,
      data: {
        code: shape.data.code,
        httpStatus: shape.data.httpStatus,
        path: shape.data.path,
      },
    }
  },
})

// Base router and procedure helpers
export const router = t.router
export const publicProcedure = t.procedure
export const mergeRouters = t.mergeRouters
