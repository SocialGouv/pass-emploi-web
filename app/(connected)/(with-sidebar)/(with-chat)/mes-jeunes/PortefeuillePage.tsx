'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import IllustrationCurvyArrow from 'assets/images/illustration-curvy-arrow.svg'
import RechercheBeneficiaire from 'components/jeune/RechercheBeneficiaire'
import TableauBeneficiaires from 'components/jeune/TableauBeneficiaires'
import PageActionsPortal from 'components/PageActionsPortal'
import Button from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import SpinningLoader from 'components/ui/SpinningLoader'
import {
  BeneficiaireAvecCompteursActionsRdvs,
  BeneficiaireAvecInfosComplementaires,
} from 'interfaces/beneficiaire'
import { utiliseChat } from 'interfaces/conseiller'
import { estFTConnect, estMilo, labelStructure } from 'interfaces/structure'
import { AlerteParam } from 'referentiel/alerteParam'
import { countMessagesNotRead } from 'services/messages.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'

const TutorielAjoutBeneficiaireMilo = dynamic(
  () => import('components/mes-jeunes/TutorielAjoutBeneficiaireMilo')
)

const TutorielAjoutBeneficiaireFranceTravail = dynamic(
  () => import('components/mes-jeunes/TutorielAjoutBeneficiaireFranceTravail')
)

type PortefeuilleProps = {
  conseillerJeunes: BeneficiaireAvecCompteursActionsRdvs[]
  isFromEmail: boolean
  page: number
}

function PortefeuillePage({
  conseillerJeunes,
  isFromEmail,
  page,
}: PortefeuilleProps) {
  const chatCredentials = useChatCredentials()
  const [alerte, setAlerte] = useAlerte()
  const router = useRouter()

  const [conseiller, setConseiller] = useConseiller()
  const [jeunes, setJeunes] = useState<BeneficiaireAvecInfosComplementaires[]>()
  const [jeunesFiltres, setJeunesFiltres] =
    useState<BeneficiaireAvecInfosComplementaires[]>()

  const [
    isRecuperationBeneficiairesLoading,
    setIsRecuperationBeneficiairesLoading,
  ] = useState<boolean>(false)

  const refTableau = useRef<HTMLTableElement>(null)

  let initialTracking = 'Mes jeunes'
  if (conseillerJeunes.length === 0) initialTracking += ' - Aucun jeune'
  if (isFromEmail) initialTracking += ' - Origine email'
  if (alerte?.key === AlerteParam.creationBeneficiaire)
    initialTracking += ' - Succès creation compte'
  if (alerte?.key === AlerteParam.recuperationBeneficiaires)
    initialTracking += ' - Succès récupération'
  if (alerte?.key === AlerteParam.envoiMessage)
    initialTracking += ' - Succès envoi message'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  async function recupererBeneficiaires(): Promise<void> {
    setIsRecuperationBeneficiairesLoading(true)
    try {
      const { recupererBeneficiaires: _recupererBeneficiaires } = await import(
        'services/conseiller.service'
      )
      await _recupererBeneficiaires()
      setAlerte(AlerteParam.recuperationBeneficiaires)
      setConseiller({ ...conseiller, aDesBeneficiairesARecuperer: false })
      router.refresh()
    } finally {
      setIsRecuperationBeneficiairesLoading(false)
    }
  }

  function chercherBeneficiaire(query: string) {
    const querySplit = query.toLowerCase().split(/-|\s/)
    if (query) {
      const jeunesFiltresResult = jeunes!.filter((jeune) => {
        const jeuneLastName = jeune.nom.replace(/’/i, "'").toLocaleLowerCase()
        const jeuneFirstName = jeune.prenom
          .replace(/’/i, "'")
          .toLocaleLowerCase()
        for (const item of querySplit) {
          if (jeuneLastName.includes(item) || jeuneFirstName.includes(item)) {
            return true
          }
        }
        return false
      })
      setJeunesFiltres(jeunesFiltresResult)
      if (jeunesFiltresResult.length > 0) {
        setTrackingTitle('Clic sur Rechercher - Recherche avec résultats')
      } else {
        setTrackingTitle('Clic sur Rechercher - Recherche sans résultats')
      }
    } else {
      setJeunesFiltres(jeunes)
      setTrackingTitle(initialTracking)
    }

    refTableau.current?.focus()
  }

  useEffect(() => {
    if (!conseillerJeunes.length) return
    const mapSansMessage = conseillerJeunes.reduce(
      (mappedCounts, jeune) => ({ ...mappedCounts, [jeune.id]: 0 }),
      {} as { [idJeune: string]: number }
    )

    let promiseMessagesNotRead: Promise<{ [idJeune: string]: number }>
    if (!chatCredentials || !utiliseChat(conseiller)) {
      promiseMessagesNotRead = Promise.resolve(mapSansMessage)
    } else {
      promiseMessagesNotRead = countMessagesNotRead(
        conseillerJeunes.map((j) => j.id)
      ).catch(() => mapSansMessage)
    }

    promiseMessagesNotRead
      .then((mappedCounts: { [idJeune: string]: number }) =>
        conseillerJeunes.map((jeune) => ({
          ...jeune,
          messagesNonLus: mappedCounts[jeune.id] ?? 0,
        }))
      )
      .then((jeunesAvecMessagesNonLus) => {
        setJeunes(jeunesAvecMessagesNonLus)
        setJeunesFiltres(jeunesAvecMessagesNonLus)
      })
  }, [chatCredentials, conseillerJeunes])

  useMatomo(trackingTitle, conseillerJeunes.length > 0)

  return (
    <>
      <PageActionsPortal>
        <ButtonLink href='/mes-jeunes/creation-jeune'>
          <IconComponent
            name={IconName.Add}
            focusable={false}
            aria-hidden={true}
            className='mr-2 w-4 h-4'
          />
          Ajouter un bénéficiaire
        </ButtonLink>
      </PageActionsPortal>

      {conseiller.aDesBeneficiairesARecuperer && (
        <div className='bg-primary-lighten rounded-base p-6 mb-6 text-center'>
          <p className='text-base-bold text-primary'>
            {conseillerJeunes.length > 0 &&
              'Certains de vos bénéficiaires ont été transférés temporairement.'}
            {conseillerJeunes.length === 0 &&
              'Vos bénéficiaires ont été transférés temporairement vers un autre conseiller.'}
          </p>
          <Button
            onClick={recupererBeneficiaires}
            className='m-auto mt-4'
            isLoading={isRecuperationBeneficiairesLoading}
          >
            {conseillerJeunes.length > 0 && 'Récupérer ces bénéficiaires'}
            {conseillerJeunes.length === 0 && 'Récupérer les bénéficiaires'}
          </Button>
        </div>
      )}

      {conseillerJeunes.length === 0 &&
        !conseiller.aDesBeneficiairesARecuperer && (
          <div className='w-2/3 m-auto relative'>
            <h2 className='text-m-bold text-content-color text-center mb-8'>
              Vous n’avez pas encore de bénéficiaire rattaché à votre
              portefeuille
              {estFTConnect(conseiller.structure)
                ? ` ${labelStructure(conseiller.structure)}`
                : ''}
              .
            </h2>
            <IllustrationCurvyArrow
              className='absolute top-0 -right-16 fill-primary w-[100px]'
              aria-hidden={true}
              focusable={false}
            />

            {estMilo(conseiller.structure) && <TutorielAjoutBeneficiaireMilo />}
            {!estMilo(conseiller.structure) && (
              <TutorielAjoutBeneficiaireFranceTravail
                structure={conseiller.structure}
              />
            )}
          </div>
        )}

      {conseillerJeunes.length > 0 && (
        <>
          <div className='mb-12'>
            <RechercheBeneficiaire onSearchFilterBy={chercherBeneficiaire} />
          </div>

          {!jeunesFiltres && <SpinningLoader />}
          {jeunesFiltres && (
            <TableauBeneficiaires
              ref={refTableau}
              beneficiaires={jeunesFiltres}
              total={conseillerJeunes.length}
              pageInitiale={page}
            />
          )}
        </>
      )}
    </>
  )
}

export default withTransaction(PortefeuillePage.name, 'page')(PortefeuillePage)
