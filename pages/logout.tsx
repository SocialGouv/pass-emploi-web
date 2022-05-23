import { withTransaction } from '@elastic/apm-rum-react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

import { MessagesService } from 'services/messages.service'
import { useDependance } from 'utils/injectionDependances'

function Logout() {
  const router = useRouter()
  const messagesService = useDependance<MessagesService>('messagesService')

  useEffect(() => {
    async function logout() {
      try {
        await Promise.all([
          messagesService.signOut(),
          signOut({ redirect: false, callbackUrl: '/login' }),
        ])
      } finally {
        router.push('/login')
      }
    }

    logout()
  }, [messagesService, router])

  return <></>
}

export default withTransaction(Logout.name, 'page')(Logout)
