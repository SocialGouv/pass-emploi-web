import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import MessageriePage from 'app/(connected)/messagerie/MessageriePage'
import { estUserMilo, utiliseChat } from 'interfaces/conseiller'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = { title: 'Messagerie' }

export default async function Messagerie() {
  const { user } = await getMandatorySessionServerSide()
  if (estUserMilo(user) || !utiliseChat(user)) notFound()

  return <MessageriePage />
}
