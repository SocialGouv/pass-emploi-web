import { render, RenderResult } from '@testing-library/react'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

export default function renderWithSession(children: JSX.Element): RenderResult {
  const session: Session = {
    user: {
      id: '1',
      name: 'Nils Tavernier',
    },
    accessToken: 'accessToken',
    expires: new Date(Date.now() + 300000).toISOString(),
  }

  return render(<SessionProvider session={session}>{children}</SessionProvider>)
}
