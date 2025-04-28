'use client'
import { useEffect, useState } from 'react'

export default function ClientOnlyContainer({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null // Ou un fallback

  return <>{children}</>
}
