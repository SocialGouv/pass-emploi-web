import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { signOutChat } from '../utils/firebase'

function Logout() {
  const router = useRouter()

  useEffect(() => {
    async function logout() {
      await signOutChat()
      await signOut({ redirect: false, callbackUrl: '/login' })
      router.push('/login')
    }

    logout()
  }, [router])

  return <div>LOGOUT</div>
}

export default Logout
