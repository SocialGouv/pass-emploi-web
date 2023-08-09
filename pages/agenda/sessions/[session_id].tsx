import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import React, { FormEvent, useRef, useState } from 'react'

import BeneficiaireItemList from 'components/session-imilo/BeneficiaireItemList'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { Etape } from 'components/ui/Form/Etape'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import { Switch } from 'components/ui/Form/Switch'
import { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { ValueWithError } from 'components/ValueWithError'
import { estUserPoleEmploi } from 'interfaces/conseiller'
import { BaseJeune } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { Session, StatutBeneficiaire } from 'interfaces/session'
import { DATETIME_LONG, toFrenchFormat } from 'utils/date'
import redirectedFromHome from 'utils/redirectedFromHome'

const DesinscriptionBeneficiaireModal = dynamic(
  import('components/session-imilo/DesinscriptionBeneficiaireModal'),
  { ssr: false }
)

type DetailSessionProps = PageProps & {
  beneficiairesEtablissement: BaseJeune[]
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

function FicheDetailsSession({
  beneficiairesEtablissement,
  session,
  returnTo,
}: DetailSessionProps) {
  const inputBeneficiaires = useRef<HTMLInputElement>(null)
  const dateLimiteDepassee = (): boolean => {
    if (DateTime.fromISO(session.session.dateHeureDebut) < DateTime.now())
      return true
    if (session.session.dateMaxInscription) {
      return (
        DateTime.fromISO(session.session.dateMaxInscription) < DateTime.now()
      )
    }
    return false
  }

  const [visibiliteSession, setVisibiliteSession] = useState<boolean>(
    session.session.estVisible
  )
  const [loadingChangerVisibilite, setLoadingChangerVisibilite] =
    useState<boolean>(false)
  const [nbPlacesDisponibles, setNbPlacesDisponibles] = useState<
    ValueWithError<number | undefined>
  >({
    value: getNbPlacesDisponibles(),
  })
  const [beneficiairesSelectionnes, setBeneficiairesSelectionnes] = useState<
    ValueWithError<BeneficiaireSelectionneSession[]>
  >({ value: initBeneficiairesSelectionnes() })

  const [beneficiaireADesinscrire, setBeneficiaireADesinscire] = useState<
    | {
        value: string
        id: string
      }
    | undefined
  >()

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
    setLoadingChangerVisibilite(true)

    const { changerVisibiliteSession } = await import(
      'services/sessions.service'
    )
    await changerVisibiliteSession(session.session.id, !visibiliteSession)

    setVisibiliteSession(!visibiliteSession)
    setLoadingChangerVisibilite(false)
  }

  function getBeneficiairesNonSelectionnees(): BaseBeneficiaireASelectionner[] {
    return beneficiairesEtablissement
      .filter(
        (beneficiaire) =>
          !beneficiairesSelectionnes.value.some(
            (selectedBeneficiaire) =>
              selectedBeneficiaire.id === beneficiaire.id
          )
      )
      .map((beneficiaire) => ({
        id: beneficiaire.id,
        value: `${beneficiaire.prenom} ${beneficiaire.nom}`,
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

  function getNbPlacesDisponibles() {
    return session.session.nbPlacesDisponibles
      ? session.session.nbPlacesDisponibles -
          session.inscriptions.filter(
            (beneficiaire) => beneficiaire.statut === StatutBeneficiaire.INSCRIT
          ).length
      : undefined
  }

  function resetAll() {
    setBeneficiairesSelectionnes({ value: initBeneficiairesSelectionnes() })
    if (nbPlacesDisponibles.value)
      setNbPlacesDisponibles({
        value: getNbPlacesDisponibles(),
      })
  }

  async function enregistrerInscriptions(e: FormEvent) {
    e.preventDefault()
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

    await changerInscriptionsSession(session.session.id, inscriptions)
  }

  return (
    <>
      <InformationMessage label='Pour modifier la session, rendez-vous sur i-milo.' />

      {dateLimiteDepassee() && (
        <div className='mt-2'>
          <FailureAlert label='Les inscriptions ne sont plus possibles car la date limite est atteinte.' />
        </div>
      )}

      <section className='border border-solid rounded-base w-full p-4 border-grey_100 mt-6'>
        <h2 className='text-m-bold text-grey_800 mb-4'>Informations offre</h2>
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
                  --
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
                  --
                  <span className='sr-only'>information non disponible</span>
                </>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section className='border border-solid rounded-base w-full p-4 border-grey_100 my-6'>
        <h2 className='text-m-bold text-grey_800 mb-4'>Informations session</h2>
        <dl>
          <div className='mb-3'>
            <dt className='inline text-base-regular'>Nom :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.session.nom}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Début :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {toFrenchFormat(
                DateTime.fromISO(session.session.dateHeureDebut),
                DATETIME_LONG
              )}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Fin :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {toFrenchFormat(
                DateTime.fromISO(session.session.dateHeureFin),
                DATETIME_LONG
              )}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>
              Date limite d’inscription :
            </dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.session.dateMaxInscription ? (
                toFrenchFormat(
                  DateTime.fromISO(session.session.dateMaxInscription),
                  DATETIME_LONG
                )
              ) : (
                <>
                  --
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
                  --
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
                  --
                  <span className='sr-only'>information non disponible</span>
                </>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <form>
        <Etape numero={1} titre='Gérez la visibilité'>
          <div className='flex items-center gap-1'>
            <Label htmlFor='visibilite-session'>
              Rendre visible la session aux bénéficiaires de la Mission Locale
            </Label>
            <Switch
              id='visibilite-session'
              checkedLabel='Oui'
              uncheckedLabel='Non'
              checked={visibiliteSession}
              onChange={handleChangerVisibiliteSession}
              disabled={loadingChangerVisibilite}
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
            disabled={nbPlacesDisponibles.value === 0 || dateLimiteDepassee()}
          />

          {nbPlacesDisponibles.value !== undefined && !dateLimiteDepassee() && (
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
            <ul
              aria-label='Bénéficiaires sélectionnés'
              id='selected-beneficiaires'
              role='region'
              className='bg-grey_100 rounded-base px-2 py-4 max-h-96 overflow-y-auto'
              aria-live='polite'
              aria-relevant='additions removals'
            >
              {beneficiairesSelectionnes.value.map((beneficiaire) => (
                <li
                  key={beneficiaire.id}
                  className='bg-blanc w-full rounded-full px-8 py-4 mb-2 last:mb-0 flex justify-between items-center break-all overflow-y-auto max-h-56'
                  aria-atomic={true}
                >
                  <BeneficiaireItemList
                    beneficiaire={beneficiaire}
                    dateLimiteDepassee={dateLimiteDepassee()}
                    onDesinscrire={desinscrireBeneficiaire}
                    onReinscrire={reinscrireBeneficiaire}
                  />
                </li>
              ))}
            </ul>
          )}
        </Etape>

        {!dateLimiteDepassee() && (
          <div className='flex gap-4 mx-auto'>
            <ButtonLink
              href={returnTo}
              style={ButtonStyle.SECONDARY}
              onClick={() => resetAll()}
            >
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

export const getServerSideProps: GetServerSideProps<
  DetailSessionProps
> = async (context) => {
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
  if (estUserPoleEmploi(user)) return { notFound: true }

  const idSession = context.query.session_id as string

  const referer = context.req.headers.referer
  const redirectTo =
    referer && !redirectedFromHome(referer) ? referer : '/mes-jeunes'

  const { getDetailsSession } = await import('services/sessions.service')
  const session = await getDetailsSession(user.id, idSession, accessToken)
  if (!session) return { notFound: true }

  const { getConseillerServerSide } = await import(
    'services/conseiller.service'
  )
  const conseiller = await getConseillerServerSide(user, accessToken)
  if (!conseiller?.agence?.id) return { notFound: true }

  const { getJeunesDeLEtablissementServerSide } = await import(
    'services/jeunes.service'
  )
  const beneficiairesEtablissement = await getJeunesDeLEtablissementServerSide(
    conseiller.agence.id,
    accessToken
  )

  return {
    props: {
      beneficiairesEtablissement: beneficiairesEtablissement,
      pageTitle: `Détail session ${session.session.nom} - Agenda`,
      pageHeader: 'Détail de la session i-milo',
      returnTo: redirectTo,
      session: session,
      withoutChat: true,
    },
  }
}

export default withTransaction(
  FicheDetailsSession.name,
  'page'
)(FicheDetailsSession)
