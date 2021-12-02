import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

/** @param {import("next/server").NextRequest} req */
export async function middleware(req) {
  const fileWithExtension = /\.(.*)$/
  const pathname = req.nextUrl.pathname

  if (
    !pathname.includes('/login') &&
    !pathname.includes('/api') &&
    !fileWithExtension.test(pathname)
  ) {
    const session = await getToken({ req, secret: process.env.AUTH_SECRET })
    if (!session) {
      const redirectQueryParam =
        pathname !== '/'
          ? `?${new URLSearchParams({ redirectUrl: pathname })}`
          : ''
      return NextResponse.redirect(`/login${redirectQueryParam}`)
    }
  }

  if (pathname.includes('/login')) {
    const session = await getToken({ req, secret: process.env.AUTH_SECRET })
    if (session) {
      return NextResponse.redirect('/')
    }
  }
}
