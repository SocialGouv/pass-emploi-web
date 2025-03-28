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
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/rendez-vous-passes/FicheBeneficiaireProps'
import DetailsBeneficiaire from 'components/jeune/DetailsBeneficiaire'
import { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
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
  const debutSemaine = aujourdHui.startOf('week')
  const finSemaine = aujourdHui.endOf('week')

  let pageTracking: string = beneficiaire.isActivated
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

  function switchTab(tab: Onglet) {
    setTrackingLabel(
      `${pageTracking} - Consultation ${capitalizeFirstLetter(tab)}`
    )

    router.replace(`${pathPrefix}/${beneficiaire.id}?onglet=${tab}`)
  }

  useMatomo(trackingLabel, portefeuille.length > 0)

  useEffect(() => {
    if (estBeneficiaireMilo) {
      getIndicateursBeneficiaire(
        conseiller.id,
        beneficiaire.id,
        debutSemaine,
        finSemaine
      ).then(setIndicateursSemaine)
    }
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
        className='mb-6'
      />

      {estBeneficiaireMilo && (
        <OngletsBeneficiaireMilo
          onSwitchTab={switchTab}
          onLienExterne={setTrackingLabel}
          {...props}
        />
      )}

      {!estBeneficiaireMilo && (
        <OngletsBeneficiairePasMilo onSwitchTab={switchTab} {...props} />
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

  return (
    <>
      {beneficiaire.estAArchiver && (
        <FailureAlert label='La récupération des informations de ce bénéficiaire depuis i-milo a échoué.'>
          <p className='pl-8'>
            Veuillez vérifier si ce compte doit être archivé.
          </p>
        </FailureAlert>
      )}

      {!beneficiaire.estAArchiver && !beneficiaire.isActivated && (
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
            <FailureAlert label='Ce bénéficiaire ne s’est pas encore connecté à l’application.'>
              <ul className='list-disc pl-[48px]'>
                <li>
                  <strong>
                    Il ne pourra pas échanger de messages avec vous.
                  </strong>
                </li>
                <li>
                  <strong>
                    Le lien d’activation envoyé par i-milo à l’adresse e-mail du
                    bénéficiaire n’est valable que 24h.
                  </strong>
                </li>
                <li>
                  Si le délai est dépassé, veuillez orienter ce bénéficiaire
                  vers l’option : mot de passe oublié.
                </li>
              </ul>
            </FailureAlert>
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
