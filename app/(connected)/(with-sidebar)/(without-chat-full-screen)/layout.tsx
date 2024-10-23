import { ReactNode } from 'react'

import PageLayout from 'app/(connected)/(with-sidebar)/PageLayout'
import Sidebar from 'components/Sidebar'

export default async function LayoutWithoutChatFullScreen({
  children,
}: {
  children: ReactNode
}) {
  return <PageLayout fullWidth={true}>{children}</PageLayout>
}
