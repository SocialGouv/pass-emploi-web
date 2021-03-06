import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'

import RenseignementAgenceModal from 'components/RenseignementAgenceModal'
import { Agence, UserStructure } from 'interfaces/conseiller'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { AgencesService } from 'services/agences.service'
import { ConseillerService } from 'services/conseiller.service'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

interface HomePageProps {
  redirectUrl: string
  structureConseiller: string
  referentielAgences: Agence[]
}

function Home({
  redirectUrl,
  structureConseiller,
  referentielAgences,
}: HomePageProps) {
  const router = useRouter()
  const { data: session } = useSession<true>({ required: true })
  const [conseiller, setConseiller] = useConseiller()
  const conseillerService =
    useDependance<ConseillerService>('conseillerService')

  const [trackingLabel, setTrackingLabel] = useState<string>(
    'Pop-in sélection agence'
  )

  async function selectAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    await conseillerService.modifierAgence(
      session!.user.id,
      agence,
      session!.accessToken
    )
    setConseiller({ ...conseiller!, agence: agence.nom })
    setTrackingLabel('Succès ajout agence')
    await router.replace(
      `${redirectUrl}?${QueryParam.choixAgence}=${QueryValue.succes}`
    )
  }

  async function redirectToUrl() {
    await router.replace(redirectUrl)
  }

  useMatomo(trackingLabel)

  return (
    <>
      <RenseignementAgenceModal
        structureConseiller={structureConseiller}
        referentielAgences={referentielAgences}
        onAgenceChoisie={selectAgence}
        onClose={redirectToUrl}
      />
    </>
  )
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (
  context
): Promise<GetServerSidePropsResult<HomePageProps>> => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect

  const sourceQueryParam = context.query.source
    ? `?source=${context.query.source}`
    : ''

  const conseillerService =
    withDependance<ConseillerService>('conseillerService')
  const conseiller = await conseillerService.getConseiller(user.id, accessToken)
  if (!conseiller) {
    throw new Error(`Conseiller ${user.id} inexistant`)
  }

  const redirectUrl =
    (context.query.redirectUrl as string) ?? '/mes-jeunes' + sourceQueryParam
  if (
    Boolean(conseiller.agence) ||
    user.structure === UserStructure.PASS_EMPLOI
  ) {
    return {
      redirect: {
        destination: `${redirectUrl}`,
        permanent: false,
      },
    }
  }

  const agenceService = withDependance<AgencesService>('agencesService')
  const referentielAgences = await agenceService.getAgences(
    user.structure,
    accessToken
  )
  return {
    props: {
      redirectUrl,
      structureConseiller: user.structure,
      referentielAgences,
    },
  }
}

export default withTransaction(Home.name, 'page')(Home)
