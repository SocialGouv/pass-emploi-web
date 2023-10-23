'use client'

import NextTopLoader from 'nextjs-toploader'

export default function ProgressBar() {
  return (
    <NextTopLoader
      color='#274996'
      showSpinner={false}
      height={5}
      crawlSpeed={100}
    />
  )
}
