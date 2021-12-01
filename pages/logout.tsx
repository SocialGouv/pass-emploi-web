import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import React from 'react'

const Logout = () => {
  const router = useRouter()
  try {
    signOut({ redirect: false }).then(() => {
      router.push('/login')
    })
  } catch (error) {
    console.error(error)
  }

  return <div>LOGOUT</div>
}

export default Logout
