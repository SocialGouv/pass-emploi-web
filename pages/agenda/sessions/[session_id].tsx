import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
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
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { ValueWithError } from 'components/ValueWithError'
import { estUserPoleEmploi } from 'interfaces/conseiller'
import { DetailsSession } from 'interfaces/detailsSession'
import { BaseJeune } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { InformationBeneficiaireSession } from 'services/sessions.service'
import { DATETIME_LONG, toFrenchFormat } from 'utils/date'
import redirectedFromHome from 'utils/redirectedFromHome'

type DetailSessionProps = PageProps & {
  beneficiairesEtablissement: BaseJeune[]
  session: DetailsSession
}

type BeneficiaireSelectionneSession = {
  id: string
  value: string
  statut: string
  commentaire?: string
}

const statutBeneficiaire = {
  inscrit: 'INSCRIT',
  refusJeune: 'REFUS_JEUNE',
  refusTiers: 'REFUS_TIERS',
}

function FicheDetailsSession({
  beneficiairesEtablissement,
  session,
  returnTo,
}: DetailSessionProps) {
  const input = useRef<HTMLInputElement>(null)

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

  function initBeneficiairesSelectionnes() {
    if (session.inscriptions.length === 0) return []
    return session.inscriptions.map((beneficiaire) => ({
      id: beneficiaire.idJeune,
      value: `${beneficiaire.prenom} ${beneficiaire.nom}`,
      statut: beneficiaire.statut,
    }))
  }

  async function handleChangerVisibiliteSession() {
    setLoadingChangerVisibilite(true)

    const { modifierInformationsSession } = await import(
      'services/sessions.service'
    )
    await modifierInformationsSession(!visibiliteSession, session.session.id)

    setVisibiliteSession(!visibiliteSession)
    setLoadingChangerVisibilite(false)
  }

  function getBeneficiairesNonSelectionnees(): BeneficiaireSelectionneSession[] {
    return beneficiairesEtablissement
      .map((beneficiaire) => ({
        id: beneficiaire.id,
        value: `${beneficiaire.prenom} ${beneficiaire.nom}`,
        statut: statutBeneficiaire.inscrit,
      }))
      .filter((beneficiaire) => {
        return !beneficiairesSelectionnes.value.some(
          (selectedBeneficiaire) => selectedBeneficiaire.id === beneficiaire.id
        )
      })
  }

  function rechercheUnBeneficiaire(
    inputValue: string
  ): BeneficiaireSelectionneSession {
    return getBeneficiairesNonSelectionnees().find(
      ({ value }) =>
        value.localeCompare(inputValue, undefined, {
          sensitivity: 'base',
        }) === 0
    )
  }

  function updateBeneficiairesSelectionnes(
    option: BeneficiaireSelectionneSession
  ) {
    const updatedBeneficiairesSelectionnes = [
      option,
      ...beneficiairesSelectionnes.value,
    ]
    setBeneficiairesSelectionnes({ value: updatedBeneficiairesSelectionnes })
    input.current!.value = ''

    if (nbPlacesDisponibles.value)
      setNbPlacesDisponibles({
        value: nbPlacesDisponibles.value - 1,
      })
  }

  function selectionnerBeneficiaire(inputValue: string) {
    const option = rechercheUnBeneficiaire(inputValue)
    if (option) updateBeneficiairesSelectionnes(option)
  }

  function handleSelectionnerBeneficiaire() {
    if (!input.current.value) return
    const option = rechercheUnBeneficiaire(input.current.value ?? '')

    if (!option)
      setBeneficiairesSelectionnes({
        value: beneficiairesSelectionnes.value,
        error: 'Aucun bénéficiaire ne correspond à cette recherche.',
      })
    else updateBeneficiairesSelectionnes(option)
  }

  function desinscrireBeneficiaire(idBeneficiaire: string) {
    const beneficiaireADesinscrire = session.inscriptions.find(
      (b) => b.idJeune === idBeneficiaire
    )
    if (!beneficiaireADesinscrire) {
      const nouvelleSelection: BeneficiaireSelectionneSession[] =
        beneficiairesSelectionnes.value.filter((b) => b.id !== idBeneficiaire)
      setBeneficiairesSelectionnes({ value: nouvelleSelection })
      if (nbPlacesDisponibles.value)
        setNbPlacesDisponibles({ value: nbPlacesDisponibles.value + 1 })
    } else {
      //todo ouvrir la popup
    }
  }

  function getNbPlacesDisponibles() {
    return session.session.nbPlacesDisponibles
      ? session.session.nbPlacesDisponibles -
          session.inscriptions.filter(
            (beneficiaire) => beneficiaire.statut === statutBeneficiaire.inscrit
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

  function collecterDifferencesInscriptions(): InformationBeneficiaireSession[] {
    const differenceInscriptions: InformationBeneficiaireSession[] = []

    beneficiairesSelectionnes.value.forEach((modifiedItem) => {
      const originalItem = session.inscriptions.find(
        (item) => item.idJeune === modifiedItem.id
      )

      if (
        !originalItem ||
        JSON.stringify(originalItem) !== JSON.stringify(modifiedItem)
      ) {
        differenceInscriptions.push({
          idJeune: modifiedItem.id,
          statut: modifiedItem.statut,
          commentaire: modifiedItem.commentaire ?? undefined,
        })
      }
    })

    return differenceInscriptions
  }

  async function enregistrerInscriptions(e: FormEvent) {
    e.preventDefault()
    const { modifierInformationsSession } = await import(
      'services/sessions.service'
    )
    const inscriptions: InformationBeneficiaireSession[] =
      collecterDifferencesInscriptions()

    await modifierInformationsSession(
      visibiliteSession,
      session.session.id,
      inscriptions
    )
  }

  return (
    <>
      <InformationMessage label='Pour modifier la session, rendez-vous sur i-milo.' />

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
            onChange={(value: string) => selectionnerBeneficiaire(value)}
            onBlur={handleSelectionnerBeneficiaire}
            required={true}
            multiple={true}
            aria-controls='selected-beneficiaires'
            ref={input}
            invalid={Boolean(beneficiairesSelectionnes.error)}
            disabled={nbPlacesDisponibles.value === 0}
          />

          {Boolean(nbPlacesDisponibles.value) && (
            <span className='mb-2'>
              {nbPlacesDisponibles.value}{' '}
              {nbPlacesDisponibles.value > 1
                ? 'places restantes'
                : 'place restante'}
            </span>
          )}

          {beneficiairesSelectionnes.value.length > 0 && (
            <ul
              aria-labelledby='selected-beneficiaires--title'
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
                    beneficiaireEstInscrit={
                      beneficiaire.statut === statutBeneficiaire.inscrit
                    }
                    idBeneficiaire={beneficiaire.id}
                    value={beneficiaire.value}
                    statut={beneficiaire.statut}
                    onClick={desinscrireBeneficiaire}
                  />
                </li>
              ))}
            </ul>
          )}
        </Etape>
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
      </form>
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

  const { getJeunesDeLEtablissementServerSide } = await import(
    'services/jeunes.service'
  )
  const beneficiairesEtablissement = await getJeunesDeLEtablissementServerSide(
    conseiller?.agence?.id,
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
