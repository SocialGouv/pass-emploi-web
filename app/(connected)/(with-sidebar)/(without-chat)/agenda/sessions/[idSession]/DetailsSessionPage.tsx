'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import React, { FormEvent, useRef, useState } from 'react'

import PageActionsPortal from 'components/PageActionsPortal'
import BeneficiaireItemList from 'components/session-imilo/BeneficiaireItemList'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Etape from 'components/ui/Form/Etape'
import InputError from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import { Switch } from 'components/ui/Form/Switch'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { ValueWithError } from 'components/ValueWithError'
import { BeneficiaireEtablissement } from 'interfaces/beneficiaire'
import {
  estAClore,
  estClose,
  Session,
  StatutBeneficiaire,
} from 'interfaces/session'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import { trackEvent } from 'utils/analytics/matomo'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toFrenchDateTime, toShortDate } from 'utils/date'
import { usePortefeuille } from 'utils/portefeuilleContext'

const DesinscriptionBeneficiaireModal = dynamic(
  () => import('components/session-imilo/DesinscriptionBeneficiaireModal')
)

type DetailSessionProps = {
  beneficiairesStructureMilo: BeneficiaireEtablissement[]
  session: Session
  returnTo: string
}

export type BeneficiaireSelectionneSession = {
  id: string
  value: string
  statut: string
  commentaire?: string
}

export type BaseBeneficiaireASelectionner = {
  id: string
  value: string
}

function DetailsSessionPage({
  beneficiairesStructureMilo,
  session,
  returnTo,
}: DetailSessionProps) {
  const router = useRouter()
  const [_, setAlerte] = useAlerte()
  const [portefeuille] = usePortefeuille()
  const [conseiller] = useConseiller()

  const aDesBeneficiaires = portefeuille.length > 0
  const inputBeneficiaires = useRef<HTMLInputElement>(null)

  const [configurationSession, setConfigurationSession] = useState<{
    estVisible: boolean
    autoinscription: boolean
  }>({
    estVisible: session.session.estVisible,
    autoinscription: session.session.autoinscription,
  })
  const [loadingChangerConfiguration, setLoadingChangerConfiguration] =
    useState<boolean>(false)

  const [nbPlacesDisponibles, setNbPlacesDisponibles] = useState<
    ValueWithError<number | undefined>
  >({
    value: session.session.nbPlacesDisponibles ?? undefined,
  })
  const [beneficiairesSelectionnes, setBeneficiairesSelectionnes] = useState<
    ValueWithError<BeneficiaireSelectionneSession[]>
  >({ value: initBeneficiairesSelectionnes() })
  const [erreurInscriptions, setErreurInscriptions] = useState<boolean>(false)

  const [beneficiaireADesinscrire, setBeneficiaireADesinscire] = useState<
    | {
        value: string
        id: string
      }
    | undefined
  >()

  const dateLimiteInscription = DateTime.fromISO(
    session.session.dateMaxInscription ?? session.session.dateHeureDebut
  ).endOf('day')
  const dateLimiteInscriptionDepassee = DateTime.now() > dateLimiteInscription

  const initialTracking = 'Détail session i-milo'
  const [trackingLabel, setTrackingLabel] = useState<string>(initialTracking)

  function openDesinscriptionBeneficiaireModal(id: string, nom: string) {
    setBeneficiaireADesinscire({ value: nom, id })
  }

  function closeDesinscriptionBeneficiaireModal() {
    setBeneficiaireADesinscire(undefined)
  }

  function initBeneficiairesSelectionnes() {
    return session.inscriptions.map((beneficiaire) => ({
      id: beneficiaire.idJeune,
      value: `${beneficiaire.prenom} ${beneficiaire.nom}`,
      statut: beneficiaire.statut,
    }))
  }

  async function handleChangerVisibiliteSession() {
    setErreurInscriptions(false)
    if (configurationSession.autoinscription) return
    setLoadingChangerConfiguration(true)

    const nouvelleConfiguration = {
      autoinscription: false,
      estVisible: !configurationSession.estVisible,
    }

    const { configurerSession } = await import('services/sessions.service')
    await configurerSession(session.session.id, nouvelleConfiguration)

    setConfigurationSession(nouvelleConfiguration)
    setLoadingChangerConfiguration(false)

    trackEvent({
      structure: conseiller.structure,
      categorie: 'Session i-milo',
      action: 'clic visibilité',
      nom: '',
      aDesBeneficiaires,
    })
  }

  async function handleChangerAutoinscriptionSession() {
    setErreurInscriptions(false)
    setLoadingChangerConfiguration(true)

    const nouvelleAutoinscription = !configurationSession.autoinscription
    const nouvelleConfiguration = {
      autoinscription: nouvelleAutoinscription,
      estVisible: nouvelleAutoinscription || configurationSession.estVisible,
    }

    const { configurerSession } = await import('services/sessions.service')
    await configurerSession(session.session.id, nouvelleConfiguration)

    setConfigurationSession(nouvelleConfiguration)
    setLoadingChangerConfiguration(false)

    trackEvent({
      structure: conseiller.structure,
      categorie: 'Session i-milo',
      action: 'clic autoinscription',
      nom: '',
      aDesBeneficiaires,
    })
  }

  function getBeneficiairesNonSelectionnees(): BaseBeneficiaireASelectionner[] {
    return beneficiairesStructureMilo
      .filter(
        (beneficiaire) =>
          !beneficiairesSelectionnes.value.some((selectedBeneficiaire) => {
            return selectedBeneficiaire.id === beneficiaire.base.id
          })
      )
      .map((beneficiaire) => ({
        id: beneficiaire.base.id,
        value: `${beneficiaire.base.prenom} ${beneficiaire.base.nom}`,
      }))
  }

  function rechercherBeneficiaire(
    inputValue: string | undefined
  ): BaseBeneficiaireASelectionner | undefined {
    if (!inputValue) return
    return getBeneficiairesNonSelectionnees().find(
      ({ value }) =>
        value.localeCompare(inputValue, undefined, {
          sensitivity: 'base',
        }) === 0
    )
  }

  function updateBeneficiairesSelectionnes(
    option: BaseBeneficiaireASelectionner
  ) {
    const updatedBeneficiairesSelectionnes = [
      { ...option, statut: StatutBeneficiaire.INSCRIT },
      ...beneficiairesSelectionnes.value,
    ]

    setBeneficiairesSelectionnes({ value: updatedBeneficiairesSelectionnes })
    inputBeneficiaires.current!.value = ''

    if (nbPlacesDisponibles.value)
      setNbPlacesDisponibles({
        value: nbPlacesDisponibles.value - 1,
      })
  }

  function selectionnerBeneficiaire(inputValue: string) {
    setErreurInscriptions(false)
    const option = rechercherBeneficiaire(inputValue)
    if (option) updateBeneficiairesSelectionnes(option)
  }

  function verifierBeneficiaireValid() {
    if (inputBeneficiaires.current!.value)
      setBeneficiairesSelectionnes({
        value: beneficiairesSelectionnes.value,
        error: 'Aucun bénéficiaire ne correspond à cette recherche.',
      })
  }

  function desinscrireBeneficiaire(idBeneficiaire: string) {
    setErreurInscriptions(false)
    const beneficiaireDejaInscrit = session.inscriptions.find(
      ({ idJeune }) => idJeune === idBeneficiaire
    )
    if (!beneficiaireDejaInscrit) {
      const nouvelleSelection: BeneficiaireSelectionneSession[] =
        beneficiairesSelectionnes.value.filter((b) => b.id !== idBeneficiaire)
      setBeneficiairesSelectionnes({ value: nouvelleSelection })
      if (nbPlacesDisponibles.value !== undefined)
        setNbPlacesDisponibles({ value: nbPlacesDisponibles.value + 1 })
    } else {
      openDesinscriptionBeneficiaireModal(
        beneficiaireDejaInscrit.idJeune,
        `${beneficiaireDejaInscrit.prenom} ${beneficiaireDejaInscrit.nom}`
      )
    }
  }

  function reinscrireBeneficiaire(idBeneficiaire: string) {
    setErreurInscriptions(false)
    const indexBeneficiaireAReinscrire =
      beneficiairesSelectionnes.value.findIndex(
        ({ id }) => id === idBeneficiaire
      )

    setBeneficiairesSelectionnes((state) => {
      const newState = { ...state }

      newState.value[indexBeneficiaireAReinscrire].statut =
        StatutBeneficiaire.INSCRIT
      return newState
    })

    if (nbPlacesDisponibles.value !== undefined)
      setNbPlacesDisponibles({ value: nbPlacesDisponibles.value - 1 })
  }

  function desinscrireBeneficiaireInscrit(
    beneficiaireDesinscrit: BeneficiaireSelectionneSession
  ) {
    const indexBeneficiaireADesinscrire =
      beneficiairesSelectionnes.value.findIndex(
        ({ id }) => id === beneficiaireDesinscrit.id
      )
    setBeneficiairesSelectionnes((state) => {
      state.value[indexBeneficiaireADesinscrire] = beneficiaireDesinscrit
      return state
    })

    if (nbPlacesDisponibles.value !== undefined)
      setNbPlacesDisponibles({ value: nbPlacesDisponibles.value + 1 })
    closeDesinscriptionBeneficiaireModal()
  }

  async function enregistrerInscriptions(e: FormEvent) {
    e.preventDefault()
    setErreurInscriptions(false)

    const { changerInscriptionsSession } = await import(
      'services/sessions.service'
    )

    const inscriptions = beneficiairesSelectionnes.value.map(
      (beneficiaire) => ({
        idJeune: beneficiaire.id,
        statut: beneficiaire.statut,
        commentaire: beneficiaire.commentaire || undefined,
      })
    )

    try {
      await changerInscriptionsSession(session.session.id, inscriptions)
      setAlerte(
        session.offre.type === 'Atelier'
          ? AlerteParam.modificationAtelier
          : AlerteParam.modificationInformationCollective
      )
      setTrackingLabel(initialTracking + ' - Modification succès')
      router.push(returnTo)
      router.refresh()
    } catch {
      setErreurInscriptions(true)
    }
  }

  function trackExport() {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Emargement',
      action: 'Export des inscrits à une session',
      nom: '',
      aDesBeneficiaires,
    })
  }

  useMatomo(trackingLabel, aDesBeneficiaires)

  return (
    <>
      {estAClore(session) && (
        <PageActionsPortal>
          <ButtonLink
            href={`/agenda/sessions/${
              session.session.id
            }/cloture?redirectUrl=${encodeURIComponent(returnTo)}`}
            style={ButtonStyle.PRIMARY}
          >
            <IconComponent
              name={IconName.Description}
              aria-hidden={true}
              focusable={false}
              className='mr-2 w-4 h-4'
            />
            Clore
          </ButtonLink>
        </PageActionsPortal>
      )}

      <InformationMessage label='Pour modifier la session, rendez-vous sur i-milo.' />

      {dateLimiteInscriptionDepassee && (
        <FailureAlert
          label='Les inscriptions ne sont plus possibles car la date limite est atteinte.'
          className='mt-2'
        />
      )}

      {estAClore(session) && (
        <FailureAlert
          label='Cet événement est passé et doit être clos.'
          className='mt-2'
        />
      )}

      {erreurInscriptions && (
        <FailureAlert
          shouldFocus={true}
          label='Une erreur s’est produite, veuillez réessayer ultérieurement.'
          className='mt-2'
        />
      )}

      <section className='border border-solid rounded-base w-full p-4 border-grey-100 mt-6'>
        <h2 className='text-m-bold text-grey-800 mb-4'>Informations offre</h2>
        <dl>
          <div className='mb-3'>
            <dt className='inline text-base-regular'>Titre :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.offre.titre}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Type :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.offre.type}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Thème :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.offre.theme}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Description :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.offre.description ?? (
                <>
                  <span aria-hidden={true}>--</span>
                  <span className='sr-only'>information non disponible</span>
                </>
              )}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Partenaire :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.offre.partenaire ?? (
                <>
                  <span aria-hidden={true}>--</span>
                  <span className='sr-only'>information non disponible</span>
                </>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section className='border border-solid rounded-base w-full p-4 border-grey-100 my-6'>
        <h2 className='text-m-bold text-grey-800 mb-4'>Informations session</h2>
        <dl>
          <div className='mb-3'>
            <dt className='inline text-base-regular'>Nom :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.session.nom}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Début :</dt>
            <dd
              className='ml-2 inline text-base-medium'
              aria-label={toFrenchDateTime(session.session.dateHeureDebut, {
                a11y: true,
              })}
            >
              {toFrenchDateTime(session.session.dateHeureDebut)}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Fin :</dt>
            <dd
              className='ml-2 inline text-base-medium'
              aria-label={toFrenchDateTime(session.session.dateHeureFin, {
                a11y: true,
              })}
            >
              {toFrenchDateTime(session.session.dateHeureFin)}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>
              Date limite d’inscription :
            </dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.session.dateMaxInscription ? (
                toShortDate(session.session.dateMaxInscription)
              ) : (
                <>
                  <span aria-hidden={true}>--</span>
                  <span className='sr-only'>information non disponible</span>
                </>
              )}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Animateur :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.session.animateur ?? (
                <>
                  <span aria-hidden={true}>--</span>
                  <span className='sr-only'>information non disponible</span>
                </>
              )}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Lieu :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.session.lieu}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Commentaire :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.session.commentaire ?? (
                <>
                  <span aria-hidden={true}>--</span>
                  <span className='sr-only'>information non disponible</span>
                </>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <form>
        <Etape numero={1} titre='Configurez la session'>
          <div className='grid grid-cols-[1fr_auto] auto-rows-fr items-center'>
            <Label htmlFor='visibilite-session'>
              Rendre visible la session aux bénéficiaires de la Mission Locale
            </Label>
            <Switch
              id='visibilite-session'
              checked={configurationSession.estVisible}
              onChange={handleChangerVisibiliteSession}
              isLoading={loadingChangerConfiguration}
              disabled={
                configurationSession.autoinscription || estClose(session)
              }
            />

            <Label htmlFor='autoinscription-session'>
              Les bénéficiaires peuvent s’inscrire en autonomie à cette session
              (dans la limite du nombre maximum de participants)
            </Label>
            <Switch
              id='autoinscription-session'
              checked={configurationSession.autoinscription}
              onChange={handleChangerAutoinscriptionSession}
              isLoading={loadingChangerConfiguration}
              disabled={estClose(session)}
            />
          </div>
        </Etape>
      </form>

      <form onSubmit={enregistrerInscriptions}>
        <Etape numero={2} titre='Gérez les inscriptions'>
          <div className='mb-6'>
            <InformationMessage
              iconName={IconName.Info}
              label='Vous ne pouvez inscrire que les bénéficiaires appartenant à votre structure principale.'
            />
          </div>

          <Label htmlFor='select-beneficiaires' inputRequired={true}>
            {{
              main: 'Recherchez et ajoutez un ou plusieurs bénéficiaires',
              helpText: 'Nom et prénom',
            }}
          </Label>

          {beneficiairesSelectionnes.error && (
            <InputError id={'select-beneficiaires--error'} className='my-2'>
              {beneficiairesSelectionnes.error}
            </InputError>
          )}

          <SelectAutocomplete
            id='select-beneficiaires'
            options={getBeneficiairesNonSelectionnees()}
            onChange={selectionnerBeneficiaire}
            onBlur={verifierBeneficiaireValid}
            required={true}
            multiple={true}
            aria-controls='selected-beneficiaires'
            ref={inputBeneficiaires}
            invalid={Boolean(beneficiairesSelectionnes.error)}
            disabled={
              nbPlacesDisponibles.value === 0 || dateLimiteInscriptionDepassee
            }
          />

          <div className='flex mb-4 justify-between items-center'>
            {nbPlacesDisponibles.value !== undefined &&
              !dateLimiteInscriptionDepassee && (
                <span
                  className={`mb-2 ${
                    nbPlacesDisponibles.value === 0 ? 'text-warning' : ''
                  }`}
                >
                  {nbPlacesDisponibles.value}{' '}
                  {nbPlacesDisponibles.value > 1
                    ? 'places restantes'
                    : 'place restante'}
                </span>
              )}

            {beneficiairesSelectionnes.value.length > 0 && (
              <ButtonLink
                style={ButtonStyle.PRIMARY}
                href={`/emargement/${session.session.id}?type=session`}
                externalIcon={IconName.Download}
                label='Exporter la liste des inscrits'
                onClick={trackExport}
              ></ButtonLink>
            )}
          </div>

          {beneficiairesSelectionnes.value.length > 0 && (
            <ul
              aria-label='Bénéficiaires inscrits'
              id='selected-beneficiaires'
              className='bg-grey-100 rounded-base px-2 py-4 max-h-96 overflow-y-auto'
            >
              {beneficiairesSelectionnes.value.map((beneficiaire) => (
                <li
                  key={beneficiaire.id}
                  className='bg-white w-full rounded-large px-8 py-4 mb-2 last:mb-0 flex justify-between items-center break-all overflow-y-auto max-h-56'
                  aria-atomic={true}
                >
                  <BeneficiaireItemList
                    beneficiaire={beneficiaire}
                    actions={
                      !dateLimiteInscriptionDepassee
                        ? {
                            onDesinscrire: desinscrireBeneficiaire,
                            onReinscrire: reinscrireBeneficiaire,
                          }
                        : undefined
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </Etape>

        {!dateLimiteInscriptionDepassee && (
          <div className='flex justify-center gap-4 mx-auto'>
            <ButtonLink href={returnTo} style={ButtonStyle.SECONDARY}>
              Annuler
            </ButtonLink>
            <Button
              style={ButtonStyle.PRIMARY}
              type='submit'
              label='Enregistrer les modifications'
            >
              Enregistrer
            </Button>
          </div>
        )}
      </form>

      {beneficiaireADesinscrire && (
        <DesinscriptionBeneficiaireModal
          onCancel={closeDesinscriptionBeneficiaireModal}
          onConfirmation={desinscrireBeneficiaireInscrit}
          beneficiaireADesinscrire={beneficiaireADesinscrire}
          sessionName={session.session.nom}
        />
      )}
    </>
  )
}

export default withTransaction(
  DetailsSessionPage.name,
  'page'
)(DetailsSessionPage)
