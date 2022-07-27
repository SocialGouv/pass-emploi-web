import { apm } from '@elastic/apm-rum'
import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import RenseignementAgenceModal from 'components/RenseignementAgenceModal'
import { Agence, Conseiller, StructureConseiller } from 'interfaces/conseiller'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { AgencesService } from 'services/agences.service'
import { ConseillerService } from 'services/conseiller.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

interface HomePageProps {
  redirectUrl: string
  tutu: Conseiller
  referentielAgences: Agence[]
}

function Home({ redirectUrl, tutu, referentielAgences }: HomePageProps) {
  const router = useRouter()
  const [_, setConseiller] = useConseiller()
  const conseillerService =
    useDependance<ConseillerService>('conseillerService')

  const [trackingLabel, setTrackingLabel] = useState<string>(
    'Pop-in sélection agence'
  )

  const doitChoisirAgence =
    !tutu.agence && tutu.structure !== StructureConseiller.PASS_EMPLOI

  async function selectAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    await conseillerService.modifierAgence(agence)
    setConseiller({ ...tutu!, agence: agence.nom })
    setTrackingLabel('Succès ajout agence')
    await router.replace(
      `${redirectUrl}?${QueryParam.choixAgence}=${QueryValue.succes}`
    )
  }

  async function redirectToUrl() {
    await router.replace(redirectUrl)
  }

  useEffect(() => {
    setConseiller(tutu)
    const userAPM = {
      id: tutu.id,
      username: `${tutu.firstName} ${tutu.lastName}`,
      email: tutu.email ?? '',
    }
    apm.setUserContext(userAPM)

    if (!doitChoisirAgence) {
      redirectToUrl()
    }
  }, [])

  useMatomo(trackingLabel)

  return doitChoisirAgence ? (
    <>
      <RenseignementAgenceModal
        structureConseiller={tutu.structure}
        referentielAgences={referentielAgences}
        onAgenceChoisie={selectAgence}
        onClose={redirectToUrl}
      />
    </>
  ) : null
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
  const conseiller = await conseillerService.getConseiller(user, accessToken)
  if (!conseiller) {
    throw new Error(`Conseiller ${user.id} inexistant`)
  }

  const redirectUrl =
    (context.query.redirectUrl as string) ?? '/mes-jeunes' + sourceQueryParam

  const agenceService = withDependance<AgencesService>('agencesService')
  const referentielAgences = await agenceService.getAgences(
    user.structure,
    accessToken
  )
  return {
    props: {
      redirectUrl,
      tutu: conseiller,
      referentielAgences,
    },
  }
}

export default withTransaction(Home.name, 'page')(Home)
