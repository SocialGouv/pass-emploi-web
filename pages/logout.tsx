import { withTransaction } from '@elastic/apm-rum-react'
import { signOut } from 'next-auth/react'
import React, { useEffect } from 'react'

import { signOut as chatSignOut } from 'services/messages.service'

function Logout() {
  useEffect(() => {
    chatSignOut().then(() => {
      signOut({ redirect: true, callbackUrl: '/login' })
    })
  }, [])

  return null
}

export default withTransaction(Logout.name, 'page')(Logout)
