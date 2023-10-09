'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { signOut } from 'next-auth/react'
import { useEffect } from 'react'

import { signOut as chatSignOut } from 'services/messages.service'

function LogoutPage() {
  useEffect(() => {
    chatSignOut().then(() => {
      signOut({ redirect: true, callbackUrl: '/login' })
    })
  }, [])

  return null
}

export default withTransaction(LogoutPage.name, 'page')(LogoutPage)
