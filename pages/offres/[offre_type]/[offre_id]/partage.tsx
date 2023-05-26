import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { FormEvent, useState } from 'react'

import BeneficiairesMultiselectAutocomplete, {
  OptionBeneficiaire,
} from 'components/jeune/BeneficiairesMultiselectAutocomplete'
import ImmersionCard from 'components/offres/ImmersionCard'
import OffreEmploiCard from 'components/offres/OffreEmploiCard'
import ServiceCiviqueCard from 'components/offres/ServiceCiviqueCard'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { Etape } from 'components/ui/Form/Etape'
import Label from 'components/ui/Form/Label'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { ValueWithError } from 'components/ValueWithError'
import { getNomJeuneComplet } from 'interfaces/jeune'
import { DetailOffre, TypeOffre } from 'interfaces/offre'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import { getImmersionServerSide } from 'services/immersions.service'
import { partagerOffre } from 'services/messages.service'
import { getOffreEmploiServerSide } from 'services/offres-emploi.service'
import { getServiceCiviqueServerSide } from 'services/services-civiques.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { usePortefeuille } from 'utils/portefeuilleContext'
import redirectedFromHome from 'utils/redirectedFromHome'

type PartageOffresProps = PageProps & {
  offre: DetailOffre
  withoutChat: true
  returnTo: string
}

function PartageOffre({ offre, returnTo }: PartageOffresProps) {
  const [chatCredentials] = useChatCredentials()
  const router = useRouter()
  const [_, setAlerte] = useAlerte()

  const [portefeuille] = usePortefeuille()
  const [idsDestinataires, setIdsDestinataires] = useState<
    ValueWithError<string[]>
  >({ value: [] })
  const [message, setMessage] = useState<string | undefined>()
  const [isPartageEnCours, setIsPartageEnCours] = useState<boolean>(false)

  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  const formIsValid = checkIfFormValid()

  function checkIfFormValid(): boolean {
    return idsDestinataires.value.length > 0
  }

  function buildOptionsJeunes(): OptionBeneficiaire[] {
    return portefeuille.map((jeune) => ({
      id: jeune.id,
      value: getNomJeuneComplet(jeune),
    }))
  }

  function updateIdsDestinataires(selectedIds: {
    beneficiaires?: string[]
    listesDeDiffusion?: string[]
  }) {
    setIdsDestinataires({
      value: selectedIds.beneficiaires!,
      error: !selectedIds.beneficiaires!.length
        ? "Aucun bénéficiaire n'est renseigné. Veuillez sélectionner au moins un bénéficiaire."
        : undefined,
    })
  }

  async function partager(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!formIsValid) return

    setIsPartageEnCours(true)

    const messageDefault = getDefaultMessage(offre.type)

    try {
      await partagerOffre({
        offre,
        idsDestinataires: idsDestinataires.value,
        cleChiffrement: chatCredentials!.cleChiffrement,
        message: message || messageDefault,
      })
      setAlerte(AlerteParam.partageOffre)
      await router.push(returnTo)
    } finally {
      setIsPartageEnCours(false)
    }
  }

  function getCardOffre(): JSX.Element {
    switch (offre.type) {
      case TypeOffre.EMPLOI:
      case TypeOffre.ALTERNANCE:
        return <OffreEmploiCard offre={offre} />
      case TypeOffre.SERVICE_CIVIQUE:
        return <ServiceCiviqueCard offre={offre} />
      case TypeOffre.IMMERSION:
        return <ImmersionCard offre={offre} />
    }
  }

  useMatomo('Partage offre', aDesBeneficiaires)

  return (
    <>
      {getCardOffre()}

      <form onSubmit={partager} className='mt-8'>
        <Etape numero={1} titre='Bénéficiaires'>
          <BeneficiairesMultiselectAutocomplete
            id={'select-beneficiaires'}
            beneficiaires={buildOptionsJeunes()}
            typeSelection='Bénéficiaires'
            onUpdate={updateIdsDestinataires}
            error={idsDestinataires.error}
          />
        </Etape>

        <Etape numero={2} titre='Écrivez votre message'>
          <Label htmlFor='message' withBulleMessageSensible={true}>
            Message
          </Label>
          <Textarea id='message' rows={10} onChange={setMessage} />
        </Etape>

        <div className='flex justify-center'>
          <ButtonLink href={returnTo} style={ButtonStyle.SECONDARY}>
            Annuler
          </ButtonLink>

          <Button
            type='submit'
            className='ml-3 flex items-center'
            disabled={!formIsValid}
            isLoading={isPartageEnCours}
          >
            <IconComponent
              name={IconName.Send}
              aria-hidden={true}
              focusable={false}
              className='mr-2 h-4 w-4 fill-blanc'
            />
            Envoyer
          </Button>
        </div>
      </form>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  PartageOffresProps
> = async (context) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const { accessToken } = sessionOrRedirect.session
  const typeOffre = context.query.offre_type as string

  let offre: DetailOffre | undefined
  switch (typeOffre) {
    case 'emploi':
      offre = await getOffreEmploiServerSide(
        context.query.offre_id as string,
        accessToken
      )
      break
    case 'service-civique':
      offre = await getServiceCiviqueServerSide(
        context.query.offre_id as string,
        accessToken
      )
      break
    case 'immersion':
      offre = await getImmersionServerSide(
        context.query.offre_id as string,
        accessToken
      )
      break
  }
  if (!offre) return { notFound: true }

  const referer = context.req.headers.referer
  const redirectTo =
    referer && !redirectedFromHome(referer) ? referer : '/recherche-offres'
  return {
    props: {
      offre,
      pageTitle: 'Recherche d’offres - Partager offre',
      pageHeader: 'Partager une offre',
      withoutChat: true,
      returnTo: redirectTo,
    },
  }
}

function getDefaultMessage(typeOffre: TypeOffre): string {
  switch (typeOffre) {
    case TypeOffre.EMPLOI:
      return 'Bonjour, je vous partage une offre d’emploi qui pourrait vous intéresser.'
    case TypeOffre.SERVICE_CIVIQUE:
      return 'Bonjour, je vous partage une offre de service civique qui pourrait vous intéresser.'
    case TypeOffre.IMMERSION:
      return "Bonjour, je vous partage une offre d'immersion qui pourrait vous intéresser."
    case TypeOffre.ALTERNANCE:
      return "Bonjour, je vous partage une offre d'alternance qui pourrait vous intéresser."
  }
}

export default withTransaction(PartageOffre.name, 'page')(PartageOffre)
