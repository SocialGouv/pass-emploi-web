import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { ChangeEvent, FormEvent, useState } from 'react'

import ImportantIcon from '../../assets/icons/important.svg'

import SuccessMessage from 'components/SuccessMessage'
import Button from 'components/ui/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import ResettableTextInput from 'components/ui/ResettableTextInput'
import {
  compareJeunesByLastName,
  getJeuneFullname,
  Jeune,
} from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { JeunesService } from 'services/jeunes.service'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'
import isEmailValid from 'utils/isEmailValid'

interface ReaffectationProps extends PageProps {}

function Index(_: ReaffectationProps) {
  const { data: session } = useSession<true>({ required: true })
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
  const [jeunes, setJeunes] = useState<Jeune[]>([])
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
  const [isSelected, setIsSelected] = useState<boolean>(false)
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
  }

  function toggleJeune(_event: FormEvent, jeune: Jeune) {
    setErreurReaffectation(undefined)
    if (idsJeunesSelected.includes(jeune.id)) {
      setIdsJeunesSelected(idsJeunesSelected.filter((id) => id !== jeune.id))
    } else {
      setIdsJeunesSelected(idsJeunesSelected.concat(jeune.id))
    }
  }

  async function fetchListeJeunes(e: FormEvent) {
    e.preventDefault()
    if (!isRechercheJeunesEnabled) return

    setRechercheJeunesEnabled(false)
    try {
      const { idConseiller, jeunes: jeunesDuConseiller } =
        await jeunesService.getJeunesDuConseillerParEmail(
          conseillerInitial.email,
          session!.accessToken
        )
      setRechercheJeunesSubmitted(true)
      if (jeunesDuConseiller.length > 0) {
        setJeunes([...jeunesDuConseiller].sort(compareJeunesByLastName))
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
      isReaffectationEnCours
    ) {
      return
    }

    setReaffectationEnCours(true)
    try {
      await jeunesService.reaffecter(
        conseillerInitial.id,
        emailConseillerDestination.value,
        idsJeunesSelected,
        session!.accessToken
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

  useMatomo(trackingTitle)

  function handleTypeReaffectation(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value === 'DEFINITIF') {
      setIsSelected(false)
    } else {
      setIsSelected(true)
    }
  }

  return (
    <>
      {isReaffectationSuccess && (
        <SuccessMessage label={'Les jeunes ont été réaffectés avec succès'} />
      )}

      <div className='mb-10 bg-accent_2_lighten rounded-medium p-6'>
        <p className='text-base-medium mb-4'>
          Pour réaffecter les jeunes d&apos;un conseiller vers un autre
          conseiller :
        </p>
        <ol className='flex text-s-medium'>
          <li className='mr-8'>
            1. Préciser s’il s’agit d’une réaffectation définitive ou temporaire
          </li>
          <li className='mr-8'>
            2. Renseigner l’adresse e-mail du conseiller initial
          </li>
          <li className='mr-8'>3. Sélectionner les jeunes à réaffecter</li>
          <li>4. Renseigner le mail du conseiller de destination</li>
        </ol>
      </div>

      <p className='mb-6'>
        Les champs marqués d’une{' '}
        <span aria-hidden='true' className='text-warning'>
          *
        </span>{' '}
        sont obligatoires
      </p>

      <fieldset className='pb-6'>
        <legend className='text-base-medium pb-2'>
          <span aria-hidden='true'>*</span> Type de réaffectation
        </legend>

        <input
          type='radio'
          name='type-reaffectation'
          id='type-reaffectation--definitif'
          value='DEFINITIF'
          onChange={handleTypeReaffectation}
          required
          className='mr-2'
        />
        <label htmlFor='type-reaffectation--definitif'>Définitif</label>

        <input
          type='radio'
          name='type-reaffectation'
          id='type-reaffectation--temporaire'
          value='TEMPORAIRE'
          onChange={handleTypeReaffectation}
          required
          className='mr-2 ml-2'
        />
        <label htmlFor='type-reaffectation--temporaire'>Temporaire</label>
      </fieldset>

      <div className='grid w-full grid-cols-[1fr_1fr_auto] items-center gap-x-12'>
        <label
          htmlFor='email-conseiller-initial'
          className='text-base-medium text-content_color row-start-1 row-start-1'
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
              value={conseillerInitial.email}
              onChange={editEmailConseillerInitial}
              onReset={resetAll}
              type={'email'}
              className='flex-1 border border-solid border-grey_700 rounded-l-medium border-r-0 text-base-medium text-bleu_nuit'
              required={true}
            />
            <button
              className={`flex p-3 items-center text-base-medium text-primary_darken border border-solid border-content_color rounded-r-medium ${
                isRechercheJeunesEnabled ? 'hover:bg-primary_lighten' : ''
              } disabled:cursor-not-allowed disabled:border-disabled`}
              type='submit'
              title='Rechercher'
              disabled={!isRechercheJeunesEnabled}
            >
              <span className='sr-only'>Rechercher conseiller initial</span>
              <IconComponent
                name={IconName.Search}
                focusable='false'
                aria-hidden={true}
                className={`w-4 h-4 ${
                  isRechercheJeunesEnabled ? '' : 'fill-disabled'
                }`}
              />
            </button>
          </div>
        </form>

        {Boolean(conseillerInitial.error) && (
          <div className='flex col-start-1 row-start-3'>
            <ImportantIcon
              focusable={false}
              aria-hidden={true}
              className='fill-warning w-6 h-6 mr-2'
            />
            <p className='text-warning'>{conseillerInitial.error}</p>
          </div>
        )}

        <label
          htmlFor='email-conseiller-destination'
          className={`text-base-medium whitespace-nowrap col-start-2 row-start-1 ${
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
            value={emailConseillerDestination.value}
            onChange={editEmailConseillerDestination}
            onReset={() => editEmailConseillerDestination('')}
            disabled={!isRechercheJeunesSubmitted || jeunes.length === 0}
            type={'email'}
            className='flex-1 border border-solid border-grey_700 rounded-medium text-base-medium text-bleu_nuit'
            required={true}
          />
        </form>

        {Boolean(emailConseillerDestination.error) && (
          <div className='flex col-start-2 row-start-3'>
            <ImportantIcon
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
            isReaffectationEnCours
          }
        >
          R&eacute;affecter les jeunes
        </Button>

        {idsJeunesSelected.length > 0 && (
          <div className='relative row-start-3 col-start-3'>
            <p className='text-base-medium text-center'>
              {idsJeunesSelected.length} jeune
              {idsJeunesSelected.length > 1 ? 's' : ''} sélectionné
              {idsJeunesSelected.length > 1 ? 's' : ''}
            </p>

            {Boolean(erreurReaffectation) && (
              <div className='absolute flex mt-3'>
                <ImportantIcon
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
          <table className='w-full'>
            <caption className='text-m-medium text-left mb-8'>
              Jeunes de {conseillerInitial.email}
            </caption>
            <thead>
              <tr>
                <th scope='col' className='sr-only pb-2'>
                  Cocher/Décocher les jeunes
                </th>
                <th
                  scope='col'
                  className='pb-2 pl-4 pr-4 text-s-regular text-content_color'
                >
                  Nom et prénom
                </th>
                <th
                  scope='col'
                  className='pb-2 pl-4 pr-4 text-s-regular text-content_color'
                >
                  Conseiller précédent
                </th>
                <th scope='col' className='sr-only'>
                  Email conseiller précédent
                </th>
              </tr>
            </thead>
            <tbody>
              {jeunes.map((jeune: Jeune) => (
                <tr
                  key={jeune.id}
                  onClick={(e) => toggleJeune(e, jeune)}
                  className='hover:bg-primary_lighten cursor-pointer'
                >
                  <td className='pt-6 pb-6 pl-4 w-0'>
                    <input
                      type='checkbox'
                      checked={idsJeunesSelected.includes(jeune.id)}
                      readOnly={true}
                    />
                  </td>
                  <td className='pt-6 pb-6 pl-4 pr-4 text-md-semi'>
                    {getJeuneFullname(jeune)}
                  </td>
                  <td className='pt-6 pb-6 pl-4 pr-4'>
                    {jeune.conseillerPrecedent
                      ? `${jeune.conseillerPrecedent.nom} ${jeune.conseillerPrecedent.prenom}`
                      : '-'}
                  </td>
                  <td className='pt-6 pb-6 pl-4 pr-6'>
                    {jeune.conseillerPrecedent?.email ?? '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  ReaffectationProps
> = async (context) => {
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
      pageHeader: 'Réaffectation des jeunes',
    },
  }
}

export default withTransaction(Index.name, 'page')(Index)
