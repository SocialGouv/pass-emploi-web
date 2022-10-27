import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { FormEvent, useMemo, useState } from 'react'

import JeunesMultiselectAutocomplete from 'components/jeune/JeunesMultiselectAutocomplete'
import ImmersionCard from 'components/offres/ImmersionCard'
import OffreEmploiCard from 'components/offres/OffreEmploiCard'
import ServiceCiviqueCard from 'components/offres/ServiceCiviqueCard'
import { RequiredValue } from 'components/RequiredValue'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { Etape } from 'components/ui/Form/Etape'
import Label from 'components/ui/Form/Label'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { BaseJeune } from 'interfaces/jeune'
import { DetailOffre, TypeOffre } from 'interfaces/offre'
import { PageProps } from 'interfaces/pageProps'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { ImmersionsService } from 'services/immersions.service'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import { OffresEmploiService } from 'services/offres-emploi.service'
import { ServicesCiviquesService } from 'services/services-civiques.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

type PartageOffresProps = PageProps & {
  offre: DetailOffre
  jeunes: BaseJeune[]
  withoutChat: true
  returnTo: string
}

function PartageOffre({ offre, jeunes, returnTo }: PartageOffresProps) {
  const messagesService = useDependance<MessagesService>('messagesService')
  const [chatCredentials] = useChatCredentials()
  const router = useRouter()

  const [idsDestinataires, setIdsDestinataires] = useState<
    RequiredValue<string[]>
  >({ value: [] })
  const [message, setMessage] = useState<string | undefined>()
  const [isPartageEnCours, setIsPartageEnCours] = useState<boolean>(false)

  const formIsValid = useMemo(
    () => idsDestinataires.value.length > 0,
    [idsDestinataires]
  )

  function updateIdsDestinataires(selectedIds: string[]) {
    setIdsDestinataires({
      value: selectedIds,
      error: !selectedIds.length
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
      await messagesService.partagerOffre({
        offre,
        idsDestinataires: idsDestinataires.value,
        cleChiffrement: chatCredentials!.cleChiffrement,
        message: message || messageDefault,
      })
      await router.push({
        pathname: returnTo,
        query: { [QueryParam.partageOffre]: QueryValue.succes },
      })
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

  useMatomo('Partage offre')

  return (
    <>
      {getCardOffre()}

      <form onSubmit={partager} className='mt-8'>
        <Etape numero={1} titre='Bénéficiaires'>
          <JeunesMultiselectAutocomplete
            jeunes={jeunes}
            typeSelection='Bénéficiaires'
            onUpdate={updateIdsDestinataires}
            error={idsDestinataires.error}
          />
        </Etape>

        <Etape numero={2} titre='Écrivez votre message'>
          <Label htmlFor='message' withBulleMessageSensible={true}>
            Message
          </Label>
          <Textarea
            id='message'
            rows={10}
            onChange={(e) => {
              setMessage(e.target.value)
            }}
          />
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
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const { user, accessToken } = sessionOrRedirect.session
  const offresEmploiService = withDependance<OffresEmploiService>(
    'offresEmploiService'
  )
  const servicesCiviquesService = withDependance<ServicesCiviquesService>(
    'servicesCiviquesService'
  )
  const immersionsService =
    withDependance<ImmersionsService>('immersionsService')
  const jeunesService = withDependance<JeunesService>('jeunesService')
  const typeOffre = context.query.offre_type as string

  let offre: DetailOffre | undefined
  switch (typeOffre) {
    case 'emploi':
      offre = await offresEmploiService.getOffreEmploiServerSide(
        context.query.offre_id as string,
        accessToken
      )
      break
    case 'service-civique':
      offre = await servicesCiviquesService.getServiceCiviqueServerSide(
        context.query.offre_id as string,
        accessToken
      )
      break
    case 'immersion':
      offre = await immersionsService.getImmersionServerSide(
        context.query.offre_id as string,
        accessToken
      )
      break
  }
  if (!offre) return { notFound: true }

  const jeunes = await jeunesService.getJeunesDuConseillerServerSide(
    user.id,
    accessToken
  )
  return {
    props: {
      offre,
      jeunes,
      pageTitle: 'Partager une offre',
      withoutChat: true,
      returnTo: '/recherche-offres',
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
