import { render, RenderResult } from '@testing-library/react'
import { UserStructure } from 'interfaces/conseiller'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

export default function renderWithSession(
  children: JSX.Element,
  customSession?: Partial<Session>
): RenderResult {
  const defaultSession: Session = {
    user: {
      id: '1',
      name: 'Nils Tavernier',
      email: 'fake@email.com',
      structure: UserStructure.MILO,
      estConseiller: true,
      estSuperviseur: false,
    },
    accessToken: 'accessToken',
    firebaseToken: 'firebaseToken',
    expires: new Date(Date.now() + 300000).toISOString(),
  }

  const session = { ...defaultSession, ...customSession }

  return render(<SessionProvider session={session}>{children}</SessionProvider>)
}
