import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useDIContext } from 'utils/injectionDependances'

function Logout() {
  const router = useRouter()
  const { messagesService } = useDIContext()

  useEffect(() => {
    async function logout() {
      await messagesService.signOut()
      await signOut({ redirect: false, callbackUrl: '/login' })
      router.push('/login')
    }

    logout()
  }, [messagesService, router])

  return <div>LOGOUT</div>
}

export default Logout
