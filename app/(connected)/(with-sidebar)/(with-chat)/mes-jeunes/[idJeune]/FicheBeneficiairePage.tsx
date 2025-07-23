'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import React, { ReactElement, useEffect, useState } from 'react'

import {
  estFicheMilo,
  FicheBeneficiaireProps,
  Onglet,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiaireProps'
import DetailsBeneficiaire from 'components/jeune/DetailsBeneficiaire'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import SuccessAlert from 'components/ui/Notifications/SuccessAlert'
import { IndicateursSemaine } from 'interfaces/beneficiaire'
import { estConseillerReferent } from 'interfaces/conseiller'
import { AlerteParam } from 'referentiel/alerteParam'
import { getIndicateursBeneficiaire } from 'services/beneficiaires.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useChats } from 'utils/chat/chatsContext'
import { useCurrentConversation } from 'utils/chat/currentConversationContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

const OngletsBeneficiaireMilo = dynamic(
  () => import('components/jeune/OngletsBeneficiaireMilo')
)
const OngletsBeneficiairePasMilo = dynamic(
  () => import('components/jeune/OngletsBeneficiairePasMilo')
)
const DeleteBeneficiaireModal = dynamic(
  () => import('components/jeune/DeleteBeneficiaireModal')
)

function FicheBeneficiairePage(props: FicheBeneficiaireProps) {
  const [conseiller] = useConseiller()
  const { beneficiaire, historiqueConseillers } = props
  const lectureSeule = !estConseillerReferent(conseiller, beneficiaire)
  const estBeneficiaireMilo = estFicheMilo(props)

  const router = useRouter()
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  const [portefeuille] = usePortefeuille()
  const chats = useChats()
  const [chatIsLoaded, setChatIsLoaded] = useState<boolean>(Boolean(chats))
  const [_, setCurrentConversation] = useCurrentConversation()
  const [alerte] = useAlerte()

  const [indicateursSemaine, setIndicateursSemaine] = useState<
    IndicateursSemaine | undefined
  >()

  const [showModaleDeleteBeneficiaire, setShowModaleDeleteBeneficiaire] =
    useState<boolean>(false)
  const [
    showSuppressionCompteBeneficiaireError,
    setShowSuppressionCompteBeneficiaireError,
  ] = useState<boolean>(false)

  const aujourdHui = DateTime.now()
  let pageTracking: string = beneficiaire.lastActivity
    ? 'Détail jeune'
    : 'Détail jeune - Non Activé'
  if (lectureSeule) pageTracking += ' - hors portefeuille'
  let initialTracking = pageTracking
  if (alerte?.key === AlerteParam.creationRDV)
    initialTracking += ' - Creation rdv succès'
  if (alerte?.key === AlerteParam.modificationRDV)
    initialTracking += ' - Modification rdv succès'
  if (alerte?.key === AlerteParam.suppressionRDV)
    initialTracking += ' - Suppression rdv succès'
  if (alerte?.key === AlerteParam.creationAnimationCollective)
    initialTracking += ' - Creation animation collective succès'
  if (alerte?.key === AlerteParam.modificationAnimationCollective)
    initialTracking += ' - Modification animation collective succès'
  if (alerte?.key === AlerteParam.suppressionAnimationCollective)
    initialTracking += ' - Suppression animation collective succès'
  if (alerte?.key === AlerteParam.envoiMessage)
    initialTracking += ' - Succès envoi message'

  const [trackingLabel, setTrackingLabel] = useState<string>(initialTracking)

  function updateTabInUrl(newTab: Onglet, debutSemaine?: DateTime) {
    setTrackingLabel(getOngletTrackingLabel(newTab))

    let newUrl = `${pathPrefix}/${beneficiaire.id}?onglet=${newTab}`
    if (debutSemaine) newUrl += `&debut=${debutSemaine.toISODate()}`
    router.replace(newUrl, { scroll: false })
  }

  function updateSemaineInUrl(currentTab: Onglet, nouveauDebut: DateTime) {
    router.replace(
      `${pathPrefix}/${beneficiaire.id}?onglet=${currentTab}&debut=${nouveauDebut.toISODate()}`,
      { scroll: false }
    )
  }

  function trackChangementSemaine(tab: Onglet, append?: string) {
    const ongletTrackingLabel = getOngletTrackingLabel(tab)
    setTrackingLabel(ongletTrackingLabel + (append ? ` - ${append}` : ''))
  }

  function getOngletTrackingLabel(tab: string) {
    return `${pageTracking} - Consultation ${capitalizeFirstLetter(tab)}`
  }

  useMatomo(trackingLabel, portefeuille.length > 0)

  useEffect(() => {
    getIndicateursBeneficiaire(
      conseiller.id,
      beneficiaire.id,
      aujourdHui.startOf('week'),
      aujourdHui.endOf('week')
    ).then(setIndicateursSemaine)
  }, [])

  useEffect(() => {
    if (!chatIsLoaded && chats) setChatIsLoaded(true)
  }, [chats])

  useEffect(() => {
    if (chatIsLoaded && !lectureSeule) {
      const conversation = chats!.find(({ id }) => id === beneficiaire.id)
      setCurrentConversation(conversation)
    }
  }, [chatIsLoaded])

  return (
    <>
      {showSuppressionCompteBeneficiaireError && (
        <FailureAlert
          label='Suite à un problème inconnu la suppression a échoué. Vous pouvez réessayer.'
          onAcknowledge={() => setShowSuppressionCompteBeneficiaireError(false)}
        />
      )}

      <Messages {...props} />

      <DetailsBeneficiaire
        beneficiaire={beneficiaire}
        historiqueConseillers={historiqueConseillers}
        demarches={estBeneficiaireMilo ? undefined : props.demarches}
        indicateursSemaine={indicateursSemaine}
        withCreations={!lectureSeule && estBeneficiaireMilo}
        onSupprimerBeneficiaire={
          !lectureSeule
            ? () => setShowModaleDeleteBeneficiaire(true)
            : undefined
        }
        className='mb-8'
      />

      {estBeneficiaireMilo && (
        <OngletsBeneficiaireMilo
          onSwitchTab={updateTabInUrl}
          onLienExterne={setTrackingLabel}
          onChangementSemaine={updateSemaineInUrl}
          trackChangementSemaine={trackChangementSemaine}
          {...props}
        />
      )}

      {!estBeneficiaireMilo && (
        <OngletsBeneficiairePasMilo
          onChangementSemaine={updateSemaineInUrl}
          onSwitchTab={updateTabInUrl}
          trackChangementSemaine={trackChangementSemaine}
          {...props}
        />
      )}

      {showModaleDeleteBeneficiaire && (
        <DeleteBeneficiaireModal
          beneficiaire={beneficiaire}
          onSuccess={() => router.push('/mes-jeunes')}
          onClose={() => setShowModaleDeleteBeneficiaire(false)}
          onError={() => {
            setShowSuppressionCompteBeneficiaireError(true)
            setTrackingLabel(`${pageTracking} - Erreur suppr. compte`)
          }}
          labelSuccess='Revenir à mon portefeuille'
        />
      )}
    </>
  )
}

function Messages(props: FicheBeneficiaireProps): ReactElement {
  const [conseiller] = useConseiller()
  const { beneficiaire } = props
  const lectureSeule = !estConseillerReferent(conseiller, beneficiaire)
  const estBeneficiaireMilo = estFicheMilo(props)

  const alerteRenvoiEmailActivationRef = React.useRef<HTMLUListElement>(null)

  const [isRenvoiEmailActivationLoading, setIsRenvoiEmailActivationLoading] =
    useState<boolean>(false)
  const [erreurRenvoiEmailActivation, setErreurRenvoiEmailActivation] =
    useState<boolean>(false)
  const [succesRenvoiEmailActivation, setSuccesRenvoiEmailActivation] =
    useState<boolean | undefined>()

  async function handleRenvoyerEmailActivation() {
    try {
      setIsRenvoiEmailActivationLoading(true)
      const { renvoyerEmailActivation: _renvoyerEmailActivation } =
        await import('services/beneficiaires.service')
      await _renvoyerEmailActivation(conseiller.id, beneficiaire.id)
      setSuccesRenvoiEmailActivation(true)
    } catch (e) {
      console.error(e)
      setErreurRenvoiEmailActivation(true)
    } finally {
      setIsRenvoiEmailActivationLoading(false)
    }
  }

  return (
    <>
      {beneficiaire.estAArchiver && (
        <FailureAlert label='La récupération des informations de ce bénéficiaire depuis i-milo a échoué.'>
          <p className='pl-8'>
            Veuillez vérifier si ce compte doit être archivé.
          </p>
        </FailureAlert>
      )}

      {!beneficiaire.estAArchiver && !beneficiaire.lastActivity && (
        <>
          {!estBeneficiaireMilo && (
            <FailureAlert label='Ce bénéficiaire ne s’est pas encore connecté à l’application.'>
              <p className='pl-8'>
                <strong>
                  Il ne pourra pas échanger de messages avec vous.
                </strong>
              </p>
            </FailureAlert>
          )}

          {estBeneficiaireMilo && (
            <>
              {succesRenvoiEmailActivation && (
                <SuccessAlert
                  label='L’email d’activation a été envoyé à l’adresse du bénéficiaire.'
                  onAcknowledge={() => {
                    setSuccesRenvoiEmailActivation(undefined)
                    alerteRenvoiEmailActivationRef.current!.focus()
                  }}
                />
              )}

              <FailureAlert label='Ce bénéficiaire ne s’est pas encore connecté à l’application et ne pourra pas échanger de messages avec vous.'>
                <ul
                  className='list-disc pl-[48px]'
                  ref={alerteRenvoiEmailActivationRef}
                >
                  <li>
                    <strong>
                      Le lien d’activation que le bénéficiaire a reçu n’est
                      valable que 24h.
                    </strong>
                  </li>
                  <li>
                    Si le délai est dépassé ou si votre bénéficiaire n’a pas
                    reçu l’email d’activation, vous pouvez lui renvoyer.
                  </li>
                </ul>
                <Button
                  onClick={handleRenvoyerEmailActivation}
                  style={ButtonStyle.WARNING}
                  className='w-fit mt-4'
                  isLoading={isRenvoiEmailActivationLoading}
                >
                  <IconComponent
                    name={IconName.Send}
                    aria-hidden={true}
                    focusable={false}
                    className='w-4 h-4 mr-2'
                  />
                  Renvoyer l’email d’activation
                </Button>

                {erreurRenvoiEmailActivation && (
                  <p className='text-warning mt-2 text-s-regular'>
                    Une erreur est survenue lors du renvoi d’email d’activation.
                    Veuillez réessayer ultérieurement.
                  </p>
                )}
              </FailureAlert>
            </>
          )}
        </>
      )}

      {beneficiaire.isReaffectationTemporaire && (
        <div className='mb-6'>
          <InformationMessage
            iconName={IconName.Schedule}
            label='Ce bénéficiaire a été ajouté temporairement à votre portefeuille en attendant le retour de son conseiller initial.'
          />
        </div>
      )}

      {beneficiaire.structureMilo?.id !== conseiller.structureMilo?.id && (
        <div className='mb-6'>
          <FailureAlert label='Ce bénéficiaire est rattaché à une Mission Locale différente de la vôtre. Il ne pourra ni visualiser les événements partagés ni y être inscrit.' />
        </div>
      )}

      {lectureSeule && (
        <div className='mb-6'>
          <InformationMessage label='Vous êtes en lecture seule'>
            Vous pouvez uniquement lire la fiche de ce bénéficiaire car il ne
            fait pas partie de votre portefeuille.
          </InformationMessage>
        </div>
      )}

      {!estBeneficiaireMilo && props.demarches === null && (
        <div className='mb-6'>
          <FailureAlert label='La récupération des démarches de ce bénéficiaire a échoué.'>
            <p className='pl-8'>
              Vous pouvez lui demander de se reconnecter à son application puis
              rafraîchir votre page.
            </p>
          </FailureAlert>
        </div>
      )}

      {!estBeneficiaireMilo && props.demarches?.isStale && (
        <div className='mb-6'>
          <InformationMessage label='Les démarches récupérées pour ce bénéficiaire ne sont peut-être pas à jour.'>
            <p className='pl-8'>
              Vous pouvez lui demander de se reconnecter à son application puis
              rafraîchir votre page.
            </p>
          </InformationMessage>
        </div>
      )}
    </>
  )
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default withTransaction(
  FicheBeneficiairePage.name,
  'page'
)(FicheBeneficiairePage)
