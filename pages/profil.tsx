import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { ChangeEvent, useState } from 'react'

import QrcodeAppStore from '../assets/images/qrcode_app_store.svg'
import QrcodePlayStore from '../assets/images/qrcode_play_store.svg'

import ConfirmationDeleteConseillerModal from 'components/ConfirmationDeleteConseillerModal'
import ConfirmationSuppressionCompteConseillerModal from 'components/ConfirmationSuppressionCompteConseillerModal'
import LeavePageConfirmationModal from 'components/LeavePageConfirmationModal'
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
import { AlerteParam } from 'referentiel/alerteParam'
import { ConseillerService } from 'services/conseiller.service'
import { JeunesService } from 'services/jeunes.service'
import { ReferentielService } from 'services/referentiel.service'
import { useAlerte } from 'utils/alerteContext'
import { trackEvent } from 'utils/analytics/matomo'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

type ProfilProps = PageProps & {
  referentielAgences: Agence[]
}

function Profil({ referentielAgences }: ProfilProps) {
  const conseillerService =
    useDependance<ConseillerService>('conseillerService')
  const jeunesService = useDependance<JeunesService>('jeunesService')

  const router = useRouter()
  const [_, setAlerte] = useAlerte()
  const [conseiller, setConseiller] = useConseiller()

  const conseillerEstMilo = estMilo(conseiller)
  const [showModaleSuppressionCompte, setShowModaleSuppressionCompte] =
    useState(false)
  const [
    showModaleConfirmationSuppression,
    setShowModaleConfirmationSuppression,
  ] = useState(false)
  const [portefeuilleAvecBeneficiaires, setPortefeuilleAvecBeneficiaires] =
    useState<Boolean>(false)

  const labelAgence = conseillerEstMilo ? 'Mission Locale' : 'agence'
  const [trackingLabel, setTrackingLabel] = useState<string>('Profil')

  async function toggleNotificationsSonores(e: ChangeEvent<HTMLInputElement>) {
    const conseillerMisAJour = {
      ...conseiller,
      notificationsSonores: e.target.checked,
    }
    await conseillerService.modifierNotificationsSonores(
      conseiller.id,
      conseillerMisAJour.notificationsSonores
    )
    setConseiller(conseillerMisAJour)
  }

  async function selectAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    await conseillerService.modifierAgence(agence)
    setConseiller({ ...conseiller, agence })
    setTrackingLabel('Profil - Succès ajout agence')
  }

  function openDeleteConseillerModal(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault()
    e.stopPropagation()
    setShowModaleSuppressionCompte(true)
    if (conseiller) {
      jeunesService.getJeunesDuConseillerClientSide().then((beneficiaires) => {
        Boolean(beneficiaires.length > 0)
          ? setPortefeuilleAvecBeneficiaires(true)
          : setPortefeuilleAvecBeneficiaires(false)
      })
    }
  }

  async function supprimerCompteConseiller(): Promise<void> {
    try {
      // await conseillerService.supprimerConseiller(conseiller.id)
      setShowModaleSuppressionCompte(false)
      alert('bien spprimé....')
      // setShowModaleConfirmationSuppression(true)
      await router.push('/api/auth/federated-logout')
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
    })
  }

  useMatomo(trackingLabel)

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

        {!conseillerEstMilo && (
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
            portefeuille={portefeuilleAvecBeneficiaires}
          />
        )}

        {/*{showModaleConfirmationSuppression && (*/}
        {/*  <ConfirmationSuppressionCompteConseillerModal />*/}
        {/*)}*/}

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
            <strong> appuyer 3 fois sur le logo </strong>“Pass emploi” visible
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
            <QrcodeAppStore
              focusable='false'
              aria-label='QR code pour l’App Store'
            />
            <p className='text-s-bold'>App Store</p>
          </div>
          <div className='flex flex-col items-center'>
            <QrcodePlayStore
              focusable='false'
              aria-label='QR code pour Google Play'
            />
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
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect

  let referentielAgences: Agence[] = []

  if (user.structure === StructureConseiller.MILO) {
    const conseillerService =
      withDependance<ConseillerService>('conseillerService')
    const conseiller = await conseillerService.getConseillerServerSide(
      user,
      accessToken
    )
    if (!conseiller) {
      throw new Error(`Conseiller ${user.id} inexistant`)
    }

    if (!conseiller.agence) {
      const agenceService =
        withDependance<ReferentielService>('referentielService')
      referentielAgences = await agenceService.getAgencesServerSide(
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
