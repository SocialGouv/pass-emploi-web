import { withTransaction } from '@elastic/apm-rum-react'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/react'
import React, { useEffect } from 'react'

import { signOut as chatSignOut } from 'services/messages.service'

function Logout() {
  const router = useRouter()

  useEffect(() => {
    async function logout() {
      try {
        await Promise.all([
          chatSignOut(),
          signOut({ redirect: false, callbackUrl: '/login' }),
        ])
      } finally {
        router.push('/login')
      }
    }

    logout()
  }, [router])

  return null
}

export default withTransaction(Logout.name, 'page')(Logout)
