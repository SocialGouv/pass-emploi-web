'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import React, { ChangeEvent, useState } from 'react'

import QrcodeAppStore from 'assets/images/qrcode_app_store.svg'
import QrcodeAppStoreBRSA from 'assets/images/qrcode_brsa_app_store.svg'
import QrcodePlayStoreBRSA from 'assets/images/qrcode_brsa_play_store.svg'
import QrcodePlayStore from 'assets/images/qrcode_play_store.svg'
import {
  FormContainer,
  RenseignementAgenceMissionLocaleForm,
} from 'components/RenseignementAgenceMissionLocaleForm'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { Switch } from 'components/ui/Form/Switch'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import {
  estMilo,
  estPoleEmploiBRSA,
  StructureConseiller,
} from 'interfaces/conseiller'
import { Agence } from 'interfaces/referentiel'
import { textesBRSA, textesCEJ } from 'lang/textes'
import {
  trackEvent,
  trackPage,
  userStructureDimensionString,
} from 'utils/analytics/matomo'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

const ConfirmationDeleteConseillerModal = dynamic(
  () => import('components/ConfirmationDeleteConseillerModal'),
  { ssr: false }
)
const ConfirmationSuppressionCompteConseillerModal = dynamic(
  () => import('components/ConfirmationSuppressionCompteConseillerModal'),
  { ssr: false }
)

type ProfilProps = {
  referentielAgences: Agence[]
}

function ProfilPage({ referentielAgences }: ProfilProps) {
  const router = useRouter()
  const [conseiller, setConseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()

  const conseillerEstMilo = estMilo(conseiller)
  const [showModaleSuppressionCompte, setShowModaleSuppressionCompte] =
    useState(false)
  const [
    showModaleConfirmationSuppression,
    setShowModaleConfirmationSuppression,
  ] = useState(false)
  const [portefeuilleAvecBeneficiaires, setPortefeuilleAvecBeneficiaires] =
    useState<boolean>(false)

  const [showInformationEmailManquant, setShowInformationEmailManquant] =
    useState<boolean>(Boolean(conseillerEstMilo && !conseiller.email))

  const labelAgence = conseillerEstMilo ? 'Mission Locale' : 'agence'
  const [trackingLabel, setTrackingLabel] = useState<string>('Profil')
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  async function toggleNotificationsSonores(e: ChangeEvent<HTMLInputElement>) {
    const conseillerMisAJour = {
      ...conseiller,
      notificationsSonores: e.target.checked,
    }

    const { modifierNotificationsSonores } = await import(
      'services/conseiller.service'
    )
    await modifierNotificationsSonores(
      conseiller.id,
      conseillerMisAJour.notificationsSonores
    )
    setConseiller(conseillerMisAJour)
  }

  async function selectAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    const { modifierAgence } = await import('services/conseiller.service')
    await modifierAgence(agence)
    setConseiller({ ...conseiller, agence })
    setTrackingLabel('Profil - Succès ajout agence')
  }

  async function openDeleteConseillerModal(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault()
    e.stopPropagation()
    setShowModaleSuppressionCompte(true)
    if (conseiller) {
      const { getJeunesDuConseillerClientSide } = await import(
        'services/jeunes.service'
      )
      const beneficiaires = await getJeunesDuConseillerClientSide()
      setPortefeuilleAvecBeneficiaires(beneficiaires.length > 0)
    }
  }

  async function supprimerCompteConseiller(): Promise<void> {
    try {
      const { supprimerConseiller } = await import(
        'services/conseiller.service'
      )
      await supprimerConseiller(conseiller.id)
      setShowModaleSuppressionCompte(false)
      setTimeout(async () => setShowModaleConfirmationSuppression(true), 10)
      setTimeout(async () => router.push('/api/auth/federated-logout'), 3000)
    } catch (e) {
      console.error(e)
    }
  }

  function trackContacterSupportClick() {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Contact Support',
      action: 'Profil',
      nom: '',
      avecBeneficiaires: aDesBeneficiaires,
    })
  }

  function trackAccederAIMilo() {
    trackPage({
      structure: userStructureDimensionString(StructureConseiller.MILO),
      customTitle: 'Accès i-milo',
    })
  }

  useMatomo(trackingLabel, aDesBeneficiaires)

  return (
    <>
      {showInformationEmailManquant && (
        <div className='mb-6'>
          <InformationMessage
            label='Votre adresse mail n’est pas renseignée'
            onAcknowledge={() => setShowInformationEmailManquant(false)}
          >
            <div className='flex flex-col'>
              Renseignez votre adresse e-mail dans l’encart ”Contacts
              personnels” de votre profil i-milo.
              <ExternalLink
                href={process.env.NEXT_PUBLIC_IMILO_COORDONNEES_URL as string}
                label='Accéder à i-milo'
                onClick={trackAccederAIMilo}
              />
            </div>
          </InformationMessage>
        </div>
      )}

      <section className='border border-solid rounded-base w-full p-4 border-grey_100 mb-8'>
        <h2 className='text-m-bold text-grey_800 mb-4'>Informations</h2>
        <h3 className='text-base-bold'>
          {conseiller.firstName} {conseiller.lastName}
        </h3>
        <dl className='mt-3'>
          {conseiller.email && (
            <div>
              <dt className='mt-2 inline text-base-regular'>Votre e-mail :</dt>
              <dd className='ml-2 inline'>
                <Email email={conseiller.email} />
              </dd>
            </div>
          )}

          {conseiller.agence && (
            <div>
              <dt className='mt-2 inline text-base-regular'>
                Votre {labelAgence} :
              </dt>
              <dd className='ml-2 inline text-base-bold'>
                {conseiller.agence.nom}
              </dd>
            </div>
          )}
        </dl>

        {process.env.NEXT_PUBLIC_ENABLE_PE_BRSA_SSO && !conseillerEstMilo && (
          <Button
            className='mt-4'
            onClick={openDeleteConseillerModal}
            style={ButtonStyle.TERTIARY}
          >
            <IconComponent
              name={IconName.Delete}
              focusable={false}
              aria-hidden={true}
              className='mr-2 w-4 h-4'
            />
            Supprimer mon compte
          </Button>
        )}

        {showModaleSuppressionCompte && (
          <ConfirmationDeleteConseillerModal
            conseiller={conseiller}
            onConfirmation={supprimerCompteConseiller}
            onCancel={() => setShowModaleSuppressionCompte(false)}
            portefeuilleAvecBeneficiaires={portefeuilleAvecBeneficiaires}
          />
        )}

        {showModaleConfirmationSuppression && (
          <ConfirmationSuppressionCompteConseillerModal />
        )}

        {conseillerEstMilo && (
          <>
            {conseiller.agence && (
              <div className='mt-4'>
                <p>
                  Vous avez besoin de modifier votre Mission Locale de référence
                  ?
                </p>

                <p className='flex'>
                  Pour ce faire merci de&nbsp;
                  <span className={'text-primary_darken hover:text-primary'}>
                    <ExternalLink
                      href={'mailto:' + process.env.NEXT_PUBLIC_SUPPORT_MAIL}
                      label={'contacter le support'}
                      iconName={IconName.OutgoingMail}
                      onClick={trackContacterSupportClick}
                    />
                  </span>
                </p>
              </div>
            )}

            {!conseiller.agence && (
              <RenseignementAgenceMissionLocaleForm
                referentielAgences={referentielAgences}
                onAgenceChoisie={selectAgence}
                onContacterSupport={trackContacterSupportClick}
                container={FormContainer.PAGE}
              />
            )}
          </>
        )}
      </section>

      <section className='border border-solid rounded-base w-full p-4 border-grey_100 mb-8'>
        <h2 className='text-m-bold text-grey_800 mb-4'>Notifications</h2>
        <div className='flex items-center flex-wrap layout_m:flex-nowrap'>
          <label htmlFor='notificationSonore' className='mr-4'>
            Recevoir des notifications sonores pour la réception de nouveaux
            messages
          </label>
          <Switch
            id='notificationSonore'
            checkedLabel='Activé'
            uncheckedLabel='Désactivé'
            checked={conseiller.notificationsSonores}
            onChange={toggleNotificationsSonores}
          />
        </div>
      </section>

      <section className='border border-solid rounded-base w-full p-4 border-grey_100 mb-8'>
        <h2 className='text-m-bold text-grey_800 mb-4'>
          {estPoleEmploiBRSA(conseiller) && textesBRSA.profilTitreSection3}
          {!estPoleEmploiBRSA(conseiller) && textesCEJ.profilTitreSection3}
        </h2>
        {estPoleEmploiBRSA(conseiller) && (
          <p className='mb-4'>{textesBRSA.introModeDemoTexte}</p>
        )}
        {!estPoleEmploiBRSA(conseiller) && (
          <p className='mb-4'>{textesCEJ.introModeDemoTexte}</p>
        )}
        {estPoleEmploiBRSA(conseiller) && (
          <p className='mb-4'>
            Pour accéder au mode démo, vous devez télécharger l’application sur
            le store de votre choix, l’ouvrir puis
            <strong> appuyer 3 fois sur le logo </strong>“pass emploi” visible
            sur la page de connexion.
          </p>
        )}
        {!estPoleEmploiBRSA(conseiller) && (
          <p className='mb-4'>
            Pour accéder au mode démo, vous devez télécharger l’application sur
            le store de votre choix, l’ouvrir puis
            <strong> appuyer 3 fois sur le logo </strong>“Contrat d’Engagement
            Jeune” visible sur la page de connexion.
          </p>
        )}
        <p>
          L’application est disponible sur Google Play Store et sur l’App Store.
        </p>
        <div className='flex justify-evenly mt-8'>
          <div className='flex flex-col items-center'>
            {estPoleEmploiBRSA(conseiller) && (
              <QrcodeAppStoreBRSA
                focusable={false}
                aria-label='QR code à scanner pour télécharger l’application sur Google Play'
                role='img'
              />
            )}
            {!estPoleEmploiBRSA(conseiller) && (
              <QrcodeAppStore
                focusable={false}
                aria-label='QR code à scanner pour télécharger l’application sur l’App Store'
                role='img'
              />
            )}
            <p className='text-s-bold'>App Store</p>
          </div>
          <div className='flex flex-col items-center'>
            {estPoleEmploiBRSA(conseiller) && (
              <QrcodePlayStoreBRSA
                focusable={false}
                aria-label='QR code à scanner pour télécharger l’application sur l’App Store'
                role='img'
              />
            )}
            {!estPoleEmploiBRSA(conseiller) && (
              <QrcodePlayStore
                focusable={false}
                aria-label='QR code à scanner pour télécharger l’application sur Google Play'
                role='img'
              />
            )}
            <p className='text-s-bold'>Google Play</p>
          </div>
        </div>
      </section>
    </>
  )
}

function Email(props: { email: string }) {
  return (
    <span className='text-primary'>
      <IconComponent
        name={IconName.OutgoingMail}
        aria-hidden={true}
        focusable={false}
        className='inline w-4 h-4 mr-2 fill-primary'
      />
      {props.email}
    </span>
  )
}

export default withTransaction(ProfilPage.name, 'page')(ProfilPage)
