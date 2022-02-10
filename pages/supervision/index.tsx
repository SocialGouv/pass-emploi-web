import { AppHead } from 'components/AppHead'
import Button from 'components/Button'
import ResettableTextInput from 'components/ResettableTextInput'
import { compareJeunesByLastName, Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import React, { FormEvent, useState } from 'react'
import { JeunesService } from 'services/jeunes.service'
import useMatomo from 'utils/analytics/useMatomo'
import { useDependance } from 'utils/injectionDependances'
import isEmailValid from 'utils/isEmailValid'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import ArrowIcon from '../../assets/icons/arrow-right.svg'
import ImportantIcon from '../../assets/icons/important.svg'
import SearchIcon from '../../assets/icons/search.svg'
import SuccessIcon from '../../assets/icons/done.svg'

type SupervisionProps = {}

function Supervision({}: SupervisionProps) {
  const { data: session } = useSession({ required: true })
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
  }

  function editEmailConseillerDestination(value: string) {
    setEmailConseillerDestination({ value })
    setErreurReaffectation(undefined)
  }

  function resetAll() {
    setEmailConseillerDestination({ value: '' })
    editEmailConseillerInitial('')
  }

  function toggleJeune(e: FormEvent, jeune: Jeune) {
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
        setJeunes(jeunesDuConseiller.sort(compareJeunesByLastName))
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

  return (
    <>
      <AppHead titre='Supervision' />

      <h1
        className={`h2-semi text-primary_primary ml-[-2.5rem] pl-10 w-3/4 pb-9 border-solid border-0 border-b-4 border-b-primary_lighten ${
          isReaffectationSuccess ? 'mb-8' : 'mb-10'
        }`}
      >
        Réaffectation des jeunes
      </h1>

      {isReaffectationSuccess && (
        <div className='text-status_success bg-status_success_lighten p-6 flex items-center rounded-medium mb-8'>
          <SuccessIcon
            aria-hidden={true}
            focusable={false}
            className='w-6 h-6 mr-2'
          />
          <p>Les jeunes ont été réaffectés avec succès</p>
        </div>
      )}

      <div className='mb-10 bg-gris_blanc rounded-medium p-6 text-primary_primary'>
        <p className='text-base-medium mb-4'>
          Pour réaffecter les jeunes d&apos;un conseiller vers un autre
          conseiller :
        </p>
        <ol className='flex text-sm-medium'>
          <li className='mr-8'>
            1. Renseigner l’adresse e-mail du conseiller initial
          </li>
          <li className='mr-8'>2. Sélectionner les jeunes à réaffecter</li>
          <li>3. Renseigner le mail du conseiller de destination</li>
        </ol>
      </div>

      <div className='grid w-full grid-cols-[2fr_2fr_1fr] items-end gap-x-12 gap-y-4'>
        <label
          htmlFor='email-conseiller-initial'
          className='text-base-medium text-neutral_content row-start-1 row-start-1'
        >
          E-mail conseiller initial
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
              roundedRight={false}
            />
            <button
              className={`flex p-3 items-center text-base-medium text-primary_primary border border-solid border-primary_primary rounded-r-medium ${
                isRechercheJeunesEnabled ? 'hover:bg-primary_lighten' : ''
              } disabled:cursor-not-allowed disabled:border-[#999BB3]`}
              type='submit'
              title='Rechercher'
              disabled={!isRechercheJeunesEnabled}
            >
              <span className='visually-hidden'>
                Rechercher conseiller initial
              </span>
              <SearchIcon
                focusable='false'
                aria-hidden={true}
                className={isRechercheJeunesEnabled ? '' : 'fill-[#999BB3]'}
              />
            </button>
          </div>
        </form>

        {Boolean(conseillerInitial.error) && (
          <div className='flex col-start-1 row-start-3'>
            <ImportantIcon
              focusable={false}
              aria-hidden={true}
              className='fill-status_warning w-6 h-6 mr-2'
            />
            <p className='text-status_warning'>{conseillerInitial.error}</p>
          </div>
        )}

        <label
          htmlFor='email-conseiller-destination'
          className={`text-base-medium col-start-2 row-start-1 ${
            isRechercheJeunesSubmitted && jeunes.length > 0
              ? 'text-neutral_content'
              : 'text-[#999BB3]'
          }`}
        >
          E-mail conseiller de destination
        </label>

        <form
          id='affecter-jeunes'
          onSubmit={reaffecterJeunes}
          className='grow col-start-2 row-start-2'
        >
          <div className='flex'>
            <ResettableTextInput
              id={'email-conseiller-destination'}
              value={emailConseillerDestination.value}
              onChange={editEmailConseillerDestination}
              onReset={() => editEmailConseillerDestination('')}
              disabled={!isRechercheJeunesSubmitted || jeunes.length === 0}
              type={'email'}
            />
          </div>
        </form>

        {Boolean(emailConseillerDestination.error) && (
          <div className='flex col-start-2 row-start-3'>
            <ImportantIcon
              focusable={false}
              aria-hidden={true}
              className='fill-status_warning w-6 h-6 mr-2'
            />
            <p className='text-status_warning'>
              {emailConseillerDestination.error}
            </p>
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
          <ArrowIcon
            className='fill-blanc mr-2'
            focusable='false'
            aria-hidden={true}
            width='16px'
            height='16px'
          />
          Réaffecter les jeunes
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
                  className='fill-status_warning w-6 h-6 mr-2 flex-shrink-0'
                />
                <p className='text-status_warning'>{erreurReaffectation}</p>
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
            <caption className='text-m-medium mb-8'>
              Jeunes de {conseillerInitial.email}
            </caption>
            <thead>
              <tr>
                <th scope='col' className='visually-hidden pb-2'>
                  Cocher/Décocher les jeunes
                </th>
                <th
                  scope='col'
                  className='pb-2 pl-4 pr-4 text-sm-regular text-neutral_content'
                >
                  Nom et prénom
                </th>
                <th
                  scope='col'
                  className='pb-2 pl-4 pr-4 text-sm-regular text-neutral_content'
                >
                  Conseiller précédent
                </th>
                <th scope='col' className='visually-hidden'>
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
                    {jeune.lastName} {jeune.firstName}
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

export const getServerSideProps: GetServerSideProps<SupervisionProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.hasSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user },
  } = sessionOrRedirect
  if (!user.estSuperviseur) {
    return { notFound: true }
  }

  return {
    props: {},
  }
}

export default Supervision
