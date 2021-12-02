import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

function Logout() {
  const router = useRouter()

  useEffect(() => {
    try {
      // router.push('/login')
      signOut({ redirect: false }).then(() => {
        router.push('/login')
      })
    } catch (error) {
      console.error(error)
    }
  }, [router])

  return <div>LOGOUT</div>
}

export default Logout
