import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { ChangeEvent, useState } from 'react'

import QrcodeAppStore from 'assets/images/qrcode_app_store.svg'
import QrcodeAppStoreBRSA from 'assets/images/qrcode_app_store_brsa.svg'
import QrcodePlayStore from 'assets/images/qrcode_play_store.svg'
import QrcodePlayStoreBRSA from 'assets/images/qrcode_play_store_brsa.svg'
import {
  FormContainer,
  RenseignementAgenceMissionLocaleForm,
} from 'components/RenseignementAgenceMissionLocaleForm'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { Switch } from 'components/ui/Form/Switch'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import {
  estMilo,
  estPoleEmploiBRSA,
  StructureConseiller,
} from 'interfaces/conseiller'
import { PageProps } from 'interfaces/pageProps'
import { Agence } from 'interfaces/referentiel'
import { textesBRSA, textesCEJ } from 'lang/textes'
import {
  modifierAgence,
  modifierNotificationsSonores,
  supprimerConseiller,
} from 'services/conseiller.service'
import { getJeunesDuConseillerClientSide } from 'services/jeunes.service'
import { trackEvent } from 'utils/analytics/matomo'
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

type ProfilProps = PageProps & {
  referentielAgences: Agence[]
}

function Profil({ referentielAgences }: ProfilProps) {
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

  const labelAgence = conseillerEstMilo ? 'Mission Locale' : 'agence'
  const [trackingLabel, setTrackingLabel] = useState<string>('Profil')
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  async function toggleNotificationsSonores(e: ChangeEvent<HTMLInputElement>) {
    const conseillerMisAJour = {
      ...conseiller,
      notificationsSonores: e.target.checked,
    }
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
    await modifierAgence(agence)
    setConseiller({ ...conseiller, agence })
    setTrackingLabel('Profil - Succès ajout agence')
  }

  function openDeleteConseillerModal(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault()
    e.stopPropagation()
    setShowModaleSuppressionCompte(true)
    if (conseiller) {
      getJeunesDuConseillerClientSide().then((beneficiaires) => {
        Boolean(beneficiaires.length > 0)
          ? setPortefeuilleAvecBeneficiaires(true)
          : setPortefeuilleAvecBeneficiaires(false)
      })
    }
  }

  async function supprimerCompteConseiller(): Promise<void> {
    try {
      await supprimerConseiller(conseiller.id)
      setShowModaleSuppressionCompte(false)
      setTimeout(async () => {
        setShowModaleConfirmationSuppression(true)
      }, 10)
      setTimeout(async () => {
        await router.push('/api/auth/federated-logout')
      }, 3000)
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

  useMatomo(trackingLabel, aDesBeneficiaires)

  return (
    <>
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

        {process.env.ENABLE_PE_BRSA_SSO && !conseillerEstMilo && (
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
                      href={'mailto:' + process.env.SUPPORT_MAIL}
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
                focusable='false'
                aria-label='QR code pour l’App Store'
              />
            )}
            {!estPoleEmploiBRSA(conseiller) && (
              <QrcodeAppStore
                focusable='false'
                aria-label='QR code pour l’App Store'
              />
            )}
            <p className='text-s-bold'>App Store</p>
          </div>
          <div className='flex flex-col items-center'>
            {estPoleEmploiBRSA(conseiller) && (
              <QrcodePlayStoreBRSA
                focusable='false'
                aria-label='QR code pour l’App Store'
              />
            )}
            {!estPoleEmploiBRSA(conseiller) && (
              <QrcodePlayStore
                focusable='false'
                aria-label='QR code pour Google Play'
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

export const getServerSideProps: GetServerSideProps<ProfilProps> = async (
  context
) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect

  let referentielAgences: Agence[] = []

  if (user.structure === StructureConseiller.MILO) {
    const { getConseillerServerSide } = await import(
      'services/conseiller.service'
    )
    const conseiller = await getConseillerServerSide(user, accessToken)
    if (!conseiller) {
      throw new Error(`Conseiller ${user.id} inexistant`)
    }

    const { getAgencesServerSide } = await import(
      'services/referentiel.service'
    )
    if (!conseiller.agence) {
      referentielAgences = await getAgencesServerSide(
        user.structure,
        accessToken
      )
    }
  }

  return {
    props: {
      referentielAgences: referentielAgences,
      pageTitle: 'Mon profil',
      pageHeader: 'Profil',
    },
  }
}

export default withTransaction(Profil.name, 'page')(Profil)
