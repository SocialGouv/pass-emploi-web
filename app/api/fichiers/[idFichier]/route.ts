import { isRedirectError } from 'next/dist/client/components/redirect'
import { redirect } from 'next/navigation'

import { getMandatorySessionServerSide } from 'utils/auth/auth'

export async function GET(
  _: Request,
  { params }: { params: { idFichier: string } }
) {
  const { accessToken } = await getMandatorySessionServerSide()

  try {
    const fichierId = params.idFichier
    redirect(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/fichiers/${fichierId}?token=${accessToken}`
    )
  } catch (error) {
    if (isRedirectError(error)) throw error

    console.error(error)
    redirect(process.env.NEXTAUTH_URL ?? '')
  }
}
