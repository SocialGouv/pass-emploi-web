import { ReactNode } from 'react'

import PageLayout from 'app/(connected)/(with-sidebar)/PageLayout'

export default async function LayoutWithoutChatFullScreen({
  children,
}: {
  children: ReactNode
}) {
  return <PageLayout fullWidth={true}>{children}</PageLayout>
}
