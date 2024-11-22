'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { useRouter } from 'next/navigation'
import React, { FormEvent, ReactNode, useState } from 'react'

import BeneficiairesMultiselectAutocomplete, {
  OptionBeneficiaire,
} from 'components/jeune/BeneficiairesMultiselectAutocomplete'
import ImmersionCard from 'components/offres/ImmersionCard'
import OffreEmploiCard from 'components/offres/OffreEmploiCard'
import ServiceCiviqueCard from 'components/offres/ServiceCiviqueCard'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Etape from 'components/ui/Form/Etape'
import Label from 'components/ui/Form/Label'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { ValueWithError } from 'components/ValueWithError'
import { getNomBeneficiaireComplet } from 'interfaces/beneficiaire'
import { DetailOffre, TypeOffre } from 'interfaces/offre'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

type PartageOffrePageProps = {
  offre: DetailOffre
  returnTo: string
}

function PartageOffrePage({ offre, returnTo }: PartageOffrePageProps) {
  const chatCredentials = useChatCredentials()
  const router = useRouter()
  const [_, setAlerte] = useAlerte()

  const [portefeuille] = usePortefeuille()
  const [idsDestinataires, setIdsDestinataires] = useState<
    ValueWithError<string[]>
  >({ value: [] })
  const [message, setMessage] = useState<string | undefined>()
  const [isPartageEnCours, setIsPartageEnCours] = useState<boolean>(false)

  function formIsValid(): boolean {
    const idsDestinatairesEstValide = Boolean(idsDestinataires.value.length > 0)
    if (!idsDestinatairesEstValide)
      setIdsDestinataires({
        ...idsDestinataires,
        error:
          'Le champ ”Destinataires” est vide. Sélectionnez au moins un destinataire.',
      })
    return idsDestinatairesEstValide
  }

  function buildOptionsJeunes(): OptionBeneficiaire[] {
    return portefeuille.map((jeune) => ({
      id: jeune.id,
      value: getNomBeneficiaireComplet(jeune),
    }))
  }

  function updateIdsDestinataires(selectedIds: {
    beneficiaires?: string[]
    listesDeDiffusion?: string[]
  }) {
    setIdsDestinataires({
      value: selectedIds.beneficiaires!,
      error: !selectedIds.beneficiaires!.length
        ? 'Le champ ”Destinataires” est vide. Sélectionnez au moins un destinataire.'
        : undefined,
    })
  }

  async function partager(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!formIsValid()) return

    setIsPartageEnCours(true)

    const messageDefault = getDefaultMessage(offre.type)

    try {
      const { partagerOffre } = await import('services/messages.service')
      await partagerOffre({
        offre,
        idsDestinataires: idsDestinataires.value,
        cleChiffrement: chatCredentials!.cleChiffrement,
        message: message || messageDefault,
      })
      setAlerte(AlerteParam.partageOffre)
      router.push(returnTo)
    } finally {
      setIsPartageEnCours(false)
    }
  }

  const pouet: ReactNode = (
    <>
      <h3>Coucou</h3>
      <p>Pouet</p>
    </>
  )

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

  useMatomo('Partage offre', portefeuille.length > 0)

  return (
    <>
      {getCardOffre()}

      <form onSubmit={partager} noValidate={true} className='mt-8'>
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
            isLoading={isPartageEnCours}
          >
            <IconComponent
              name={IconName.Send}
              aria-hidden={true}
              focusable={false}
              className='mr-2 h-4 w-4 fill-white'
            />
            Envoyer
          </Button>
        </div>
      </form>
    </>
  )
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

export default withTransaction(PartageOffrePage.name, 'page')(PartageOffrePage)
