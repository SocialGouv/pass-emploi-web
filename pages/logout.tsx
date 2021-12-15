import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { signOutChat } from '../utils/firebase'

function Logout() {
  const router = useRouter()

  useEffect(() => {
    try {
      signOut({ redirect: false }).then(async () => {
        await signOutChat()
        router.push('/login')
      })
    } catch (error) {
      console.error(error)
    }
  }, [router])

  return <div>LOGOUT</div>
}

export default Logout
