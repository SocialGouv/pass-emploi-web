import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { ChangeEvent, FormEvent, useState } from 'react'

import Button from 'components/ui/Button/Button'
import ResettableTextInput from 'components/ui/Form/ResettableTextInput'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import SuccessAlert from 'components/ui/Notifications/SuccessAlert'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import {
  compareJeunesByNom,
  getNomJeuneComplet,
  JeuneFromListe,
} from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { JeunesService } from 'services/jeunes.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'
import isEmailValid from 'utils/isEmailValid'

type ReaffectationProps = PageProps

function Reaffectation(_: ReaffectationProps) {
  const jeunesService = useDependance<JeunesService>('jeunesService')

  const [conseillerInitial, setConseillerInitial] = useState<{
    email: string
    id?: string
    error?: string
  }>({ email: '' })
  const [isRechercheJeunesEnabled, setRechercheJeunesEnabled] =
    useState<boolean>(false)
  const [isRechercheJeunesSubmitted, setRechercheJeunesSubmitted] =
    useState<boolean>(false)
  const [jeunes, setJeunes] = useState<JeuneFromListe[]>([])
  const [idsJeunesSelected, setIdsJeunesSelected] = useState<string[]>([])
  const [emailConseillerDestination, setEmailConseillerDestination] = useState<{
    value: string
    error?: string
  }>({ value: '' })
  const [isReaffectationEnCours, setReaffectationEnCours] =
    useState<boolean>(false)
  const [isReaffectationSuccess, setReaffectationSuccess] =
    useState<boolean>(false)
  const [erreurReaffectation, setErreurReaffectation] = useState<
    string | undefined
  >(undefined)
  const [isReaffectationTemporaire, setIsReaffectationTemporaire] = useState<
    boolean | undefined
  >(undefined)
  const [trackingTitle, setTrackingTitle] = useState<string>(
    'Réaffectation jeunes – Etape 1 – Saisie mail cons. ini.'
  )

  function editEmailConseillerInitial(value: string) {
    setConseillerInitial({ email: value })
    setRechercheJeunesSubmitted(false)
    setJeunes([])
    setRechercheJeunesEnabled(isEmailValid(value))
    setIdsJeunesSelected([])
    setReaffectationSuccess(false)
    setErreurReaffectation(undefined)
  }

  function editEmailConseillerDestination(value: string) {
    setEmailConseillerDestination({ value })
    setErreurReaffectation(undefined)
  }

  function resetAll() {
    editEmailConseillerInitial('')
    setEmailConseillerDestination({ value: '' })
    setIsReaffectationTemporaire(undefined)
  }

  function selectionnerJeune(jeune: JeuneFromListe) {
    setErreurReaffectation(undefined)
    if (idsJeunesSelected.includes(jeune.id)) {
      setIdsJeunesSelected(idsJeunesSelected.filter((id) => id !== jeune.id))
    } else {
      setIdsJeunesSelected(idsJeunesSelected.concat(jeune.id))
    }
  }

  function selectionnerTousLesJeunes(_event: FormEvent) {
    setErreurReaffectation(undefined)
    if (idsJeunesSelected.length !== jeunes.length) {
      setIdsJeunesSelected(jeunes.map((jeune) => jeune.id))
    } else {
      setIdsJeunesSelected([])
    }
  }

  async function fetchListeJeunes(e: FormEvent) {
    e.preventDefault()
    if (!isRechercheJeunesEnabled) return

    setRechercheJeunesEnabled(false)
    try {
      const { idConseiller, jeunes: jeunesDuConseiller } =
        await jeunesService.getJeunesDuConseillerParEmail(
          conseillerInitial.email
        )
      setRechercheJeunesSubmitted(true)
      if (jeunesDuConseiller.length > 0) {
        setJeunes([...jeunesDuConseiller].sort(compareJeunesByNom))
        setConseillerInitial({
          ...conseillerInitial,
          id: idConseiller,
        })
        setTrackingTitle(
          'Réaffectation jeunes – Etape 2 – Réaff. jeunes vers cons. dest.'
        )
      } else {
        setConseillerInitial({
          ...conseillerInitial,
          error: 'Aucun jeune trouvé pour ce conseiller',
        })
      }
    } catch (err) {
      let erreur: string
      if ((err as Error).message) erreur = 'Aucun conseiller ne correspond'
      else erreur = "Une erreur inconnue s'est produite"
      setConseillerInitial({ ...conseillerInitial, error: erreur })
      setTrackingTitle('Réaffectation jeunes – Etape 1 – Erreur')
    }
  }

  async function reaffecterJeunes(e: FormEvent) {
    e.preventDefault()
    if (
      !conseillerInitial.id ||
      !isEmailValid(emailConseillerDestination.value) ||
      idsJeunesSelected.length === 0 ||
      isReaffectationEnCours ||
      isReaffectationTemporaire === undefined
    ) {
      return
    }

    setReaffectationEnCours(true)
    try {
      await jeunesService.reaffecter(
        conseillerInitial.id,
        emailConseillerDestination.value,
        idsJeunesSelected,
        isReaffectationTemporaire
      )
      resetAll()
      setReaffectationSuccess(true)
      setTrackingTitle('Réaffectation jeunes – Etape 1 – Succès réaff.')
    } catch (err) {
      const erreur = err as Error
      if (erreur.message?.startsWith('Conseiller')) {
        setEmailConseillerDestination({
          ...emailConseillerDestination,
          error: 'Aucun conseiller ne correspond',
        })
      } else {
        setErreurReaffectation(
          'Suite à un problème inconnu la réaffectation a échoué. Vous pouvez réessayer.'
        )
      }
      setTrackingTitle('Réaffectation jeunes – Etape 2 – Erreur')
    } finally {
      setReaffectationEnCours(false)
    }
  }

  const TYPE_REAFFECTATION = {
    Definitif: 'DEFINITIF',
    Temporaire: 'TEMPORAIRE',
  }

  function handleTypeReaffectation(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value === TYPE_REAFFECTATION.Temporaire) {
      setIsReaffectationTemporaire(true)
    } else {
      setIsReaffectationTemporaire(false)
    }
  }

  useMatomo(trackingTitle)

  return (
    <>
      {isReaffectationSuccess && (
        <SuccessAlert label={'Les jeunes ont été réaffectés avec succès'} />
      )}

      <div className='mb-10 bg-accent_2_lighten rounded-medium p-6'>
        <p className='text-base-bold mb-4'>
          Pour réaffecter les jeunes d&apos;un conseiller vers un autre
          conseiller :
        </p>
        <ol
          className='flex text-s-regular'
          aria-label='Étapes pour la réaffectation'
        >
          <li>
            1. Préciser s’il s’agit d’une réaffectation définitive ou temporaire
          </li>
          <li>2. Renseigner l’adresse e-mail du conseiller initial</li>
          <li>3. Sélectionner les jeunes à réaffecter</li>
          <li>4. Renseigner le mail du conseiller de destination</li>
        </ol>
      </div>

      <p className='mb-6'>
        Les champs avec <span className='text-warning'>*</span> sont
        obligatoires
      </p>

      <fieldset className='pb-6'>
        <legend className='text-base-medium mb-3'>
          <span aria-hidden='true'>*</span> Type de réaffectation
        </legend>

        <input
          className='mr-2'
          type='radio'
          name='type-reaffectation'
          id='type-reaffectation--definitif'
          value={TYPE_REAFFECTATION.Definitif}
          onChange={handleTypeReaffectation}
          checked={isReaffectationTemporaire === false}
          required
        />
        <label htmlFor='type-reaffectation--definitif' className='mr-6'>
          Définitif
        </label>

        <input
          className='mr-2 ml-10'
          type='radio'
          name='type-reaffectation'
          id='type-reaffectation--temporaire'
          value={TYPE_REAFFECTATION.Temporaire}
          onChange={handleTypeReaffectation}
          checked={isReaffectationTemporaire === true}
          required
        />
        <label htmlFor='type-reaffectation--temporaire'>Temporaire</label>
      </fieldset>

      <div className='grid w-full grid-cols-[1fr_1fr_auto] items-center gap-x-12'>
        <label
          htmlFor='email-conseiller-initial'
          className='text-base-medium text-content_color row-start-1 row-start-1 mb-3'
        >
          <span aria-hidden='true'>*</span> E-mail conseiller initial
        </label>

        <form
          role='search'
          onSubmit={fetchListeJeunes}
          className='grow col-start-1 row-start-2'
        >
          <div className='flex'>
            <ResettableTextInput
              id={'email-conseiller-initial'}
              defaultValue={conseillerInitial.email}
              onChange={editEmailConseillerInitial}
              onReset={resetAll}
              type={'email'}
              className='flex-1 border border-solid border-grey_700 rounded-l-medium border-r-0 text-base-regular text-primary_darken'
              required={true}
            />
            <button
              className={`flex p-3 items-center border border-solid border-content_color rounded-r-medium ${
                isRechercheJeunesEnabled ? 'hover:bg-primary_lighten' : ''
              } disabled:cursor-not-allowed disabled:border-disabled`}
              type='submit'
              disabled={!isRechercheJeunesEnabled}
            >
              <span className='sr-only'>Rechercher conseiller initial</span>
              <IconComponent
                name={IconName.Search}
                focusable='false'
                aria-hidden={true}
                className={`w-6 h-6 ${
                  isRechercheJeunesEnabled ? 'fill-primary' : 'fill-disabled'
                }`}
                title='Rechercher'
              />
            </button>
          </div>
        </form>

        {Boolean(conseillerInitial.error) && (
          <div className='flex col-start-1 row-start-3'>
            <IconComponent
              name={IconName.Important}
              focusable={false}
              aria-hidden={true}
              className='fill-warning w-6 h-6 mr-2'
            />
            <p className='text-warning'>{conseillerInitial.error}</p>
          </div>
        )}

        <label
          htmlFor='email-conseiller-destination'
          className={`text-base-medium whitespace-nowrap col-start-2 row-start-1 mb-3 ${
            isRechercheJeunesSubmitted && jeunes.length > 0
              ? 'text-content_color'
              : 'text-disabled'
          }`}
        >
          <span aria-hidden='true'>*</span> E-mail conseiller de destination
        </label>

        <form
          id='affecter-jeunes'
          onSubmit={reaffecterJeunes}
          className='grow col-start-2 row-start-2'
        >
          <ResettableTextInput
            id={'email-conseiller-destination'}
            defaultValue={emailConseillerDestination.value}
            onChange={editEmailConseillerDestination}
            onReset={() => editEmailConseillerDestination('')}
            disabled={!isRechercheJeunesSubmitted || jeunes.length === 0}
            type={'email'}
            className='flex-1 border border-solid border-grey_700 rounded-medium text-base-regular text-primary_darken'
            required={true}
          />
        </form>

        {Boolean(emailConseillerDestination.error) && (
          <div className='flex col-start-2 row-start-3'>
            <IconComponent
              name={IconName.Important}
              focusable={false}
              aria-hidden={true}
              className='fill-warning w-6 h-6 mr-2'
            />
            <p className='text-warning'>{emailConseillerDestination.error}</p>
          </div>
        )}

        <Button
          form='affecter-jeunes'
          label='Réaffecter les jeunes'
          type='submit'
          className='row-start-2 col-start-3'
          disabled={
            idsJeunesSelected.length === 0 ||
            !isEmailValid(emailConseillerDestination.value) ||
            isReaffectationEnCours ||
            isReaffectationTemporaire === undefined
          }
        >
          R&eacute;affecter les jeunes
        </Button>

        {idsJeunesSelected.length > 0 && (
          <div className='relative row-start-3 col-start-3'>
            <p className='text-base-bold text-center'>
              {idsJeunesSelected.length} jeune
              {idsJeunesSelected.length > 1 ? 's' : ''} sélectionné
              {idsJeunesSelected.length > 1 ? 's' : ''}
            </p>

            {Boolean(erreurReaffectation) && (
              <div className='absolute flex mt-3'>
                <IconComponent
                  name={IconName.Important}
                  focusable={false}
                  aria-hidden={true}
                  className='fill-warning w-6 h-6 mr-2 flex-shrink-0'
                />
                <p className='text-warning'>{erreurReaffectation}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {isRechercheJeunesSubmitted && jeunes.length > 0 && (
        <div
          className={`${
            idsJeunesSelected.length === 0 ? 'mt-16' : 'mt-7'
          } ml-5`}
        >
          <Table
            caption={{
              text: `Jeunes de ${conseillerInitial.email}`,
              visible: true,
            }}
          >
            <THead>
              <TR isHeader={true}>
                <TH>
                  <span className='sr-only'>Cocher/Décocher les jeunes</span>
                </TH>
                <TH>Nom et prénom</TH>
                <TH>Conseiller précédent</TH>
                <TH className='sr-only'>Email conseiller précédent</TH>
              </TR>
            </THead>
            <TBody>
              <TR onClick={(e) => selectionnerTousLesJeunes(e)}>
                <TD className='py-4 pl-4'>
                  <input
                    id='reaffectation-tout-selectionner'
                    type='checkbox'
                    className='mr-6'
                    checked={idsJeunesSelected.length === jeunes.length}
                    readOnly={true}
                    title='Tout sélectionner'
                  />
                </TD>
                <TD className='whitespace-nowrap'>
                  <label
                    htmlFor='reaffectation-tout-selectionner'
                    onClick={(e) => e.stopPropagation()}
                  >
                    Tout sélectionner
                  </label>
                </TD>
              </TR>
            </TBody>
            <TBody>
              {jeunes.map((jeune: JeuneFromListe) => (
                <TR key={jeune.id} onClick={() => selectionnerJeune(jeune)}>
                  <TD className='p-4 rounded-l-small'>
                    <input
                      id={'checkbox-' + jeune.id}
                      type='checkbox'
                      checked={idsJeunesSelected.includes(jeune.id)}
                      readOnly={true}
                      title={'Sélectionner ' + getNomJeuneComplet(jeune)}
                    />
                  </TD>
                  <TD className='p-4 text-base-regular'>
                    <label
                      htmlFor={'checkbox-' + jeune.id}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {getNomJeuneComplet(jeune)}
                    </label>
                  </TD>
                  <TD className='p-4 text-base-regular'>
                    {jeune.conseillerPrecedent
                      ? `${jeune.conseillerPrecedent.nom} ${jeune.conseillerPrecedent.prenom}`
                      : '-'}
                  </TD>
                  <TD className='p-4 text-base-regular rounded-r-small'>
                    {jeune.conseillerPrecedent?.email ?? '-'}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user },
  } = sessionOrRedirect
  if (!user.estSuperviseur) {
    return { notFound: true }
  }

  return {
    props: {
      pageTitle: 'Réaffectation',
    },
  }
}

export default withTransaction(Reaffectation.name, 'page')(Reaffectation)
