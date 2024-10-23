import { ReactNode } from 'react'

import PageLayout from 'app/(connected)/(with-sidebar)/PageLayout'

export default async function LayoutWithoutChat({
  children,
}: {
  children: ReactNode
}) {
  return <PageLayout fullWidth={false}>{children}</PageLayout>
}
