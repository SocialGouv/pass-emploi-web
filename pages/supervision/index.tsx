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

type SupervisionProps = {}

function Supervision({}: SupervisionProps) {
  const { data: session } = useSession({ required: true })
  const jeunesService = useDependance<JeunesService>('jeunesService')

  const [emailConseillerInitial, setEmailConseillerInitial] = useState<{
    value: string
    error?: string
  }>({ value: '' })
  const [isRechercheEnabled, setRecherchedEnabled] = useState<boolean>(false)
  const [isRechercheSubmitted, setRechercheSubmitted] = useState<boolean>(false)
  const [jeunes, setJeunes] = useState<Jeune[]>([])
  const areSomeJeunesSelected = false

  function editEmailConseillerInitial(value: string) {
    setEmailConseillerInitial({ value })
    setRechercheSubmitted(false)
    setJeunes([])
    setRecherchedEnabled(Boolean(value) && isEmailValid(value))
  }

  async function fetchListeJeunes(e: FormEvent) {
    e.preventDefault()
    setRecherchedEnabled(false)
    try {
      const jeunes: Jeune[] = await jeunesService.getJeunesDuConseillerParEmail(
        emailConseillerInitial.value,
        session!.accessToken
      )
      if (jeunes.length > 0) {
        setJeunes(jeunes.sort(compareJeunesByLastName))
        setRechercheSubmitted(true)
      } else {
        setEmailConseillerInitial({
          ...emailConseillerInitial,
          error: 'Aucun jeune trouvé pour ce conseiller',
        })
      }
    } catch (err) {
      let erreur: string
      if ((err as Error).message) erreur = 'Aucun conseiller ne correspond'
      else erreur = "Une erreur inconnue s'est produite"
      setEmailConseillerInitial({ ...emailConseillerInitial, error: erreur })
    }
  }

  function resetEmailConseillerInitial() {
    editEmailConseillerInitial('')
  }

  useMatomo(
    !isRechercheSubmitted
      ? 'Réaffectation jeunes – Etape 1 – Saisie mail cons. ini.'
      : Boolean(emailConseillerInitial.error)
      ? 'Réaffectation jeunes – Etape 1 – Erreur'
      : 'Réaffectation jeunes – Etape 2 – Réaff. jeunes vers cons. dest.'
  )

  return (
    <>
      <AppHead titre='Supervision' />
      <span className='flex flex-wrap justify-between ml-[-2.5rem] pl-10 w-3/4 pb-9 border-b-4 border-b-primary_lighten mb-10'>
        <h1 className='h2-semi text-primary_primary'>
          Réaffectation des jeunes
        </h1>
      </span>

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

      <div className='flex w-full items-end'>
        <form role='search' onSubmit={fetchListeJeunes} className='grow mr-12'>
          <label
            htmlFor='email-conseiller-initial'
            className='text-base-medium text-neutral_content'
          >
            E-mail conseiller initial
          </label>
          <div className='flex mt-3.5'>
            <ResettableTextInput
              id={'email-conseiller-initial'}
              onChange={editEmailConseillerInitial}
              onReset={resetEmailConseillerInitial}
              type={'email'}
              roundedRight={false}
            />
            <button
              className={`flex p-3 items-center text-base-medium text-primary_primary border border-primary_primary rounded-r-medium ${
                isRechercheEnabled ? 'hover:bg-primary_lighten' : ''
              } disabled:cursor-not-allowed disabled:border-[#999BB3]`}
              type='submit'
              title='Rechercher'
              aria-label='Rechercher conseiller initial'
              disabled={!isRechercheEnabled}
            >
              <SearchIcon
                focusable='false'
                aria-hidden={true}
                className={isRechercheEnabled ? '' : 'fill-[#999BB3]'}
              />
            </button>
          </div>
          {Boolean(emailConseillerInitial.error) && (
            <div className='flex mt-4'>
              <ImportantIcon
                focusable={false}
                aria-hidden={true}
                className='fill-status_warning w-6 h-6 mr-2'
              />
              <span className='text-status_warning'>
                {emailConseillerInitial.error}
              </span>
            </div>
          )}
        </form>

        <form id='affecter-jeunes' onSubmit={() => {}} className='grow mr-16'>
          <label
            htmlFor='email-conseiller-destination'
            className={`text-base-medium ${
              areSomeJeunesSelected ? 'text-neutral_content' : 'text-[#999BB3]'
            }`}
          >
            E-mail conseiller de destination
          </label>
          <div className='flex mt-3.5'>
            <ResettableTextInput
              id={'email-conseiller-destination'}
              onChange={() => {}}
              onReset={() => {}}
              disabled={!areSomeJeunesSelected}
              type={'email'}
            />
          </div>
        </form>

        <Button
          form='affecter-jeunes'
          label='Réaffecter les jeunes'
          type='submit'
          disabled={!areSomeJeunesSelected}
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
      </div>

      {isRechercheSubmitted && (
        <div className='mt-6 ml-5'>
          <table className='w-full'>
            <caption className='text-m-medium mb-8'>
              Jeunes de {emailConseillerInitial.value}
            </caption>
            <thead>
              <tr>
                <th
                  scope='col'
                  className='pb-2'
                  aria-label='Cocher/Décocher les jeunes'
                />
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
                <th scope='col' aria-label='Email conseiller précédent' />
              </tr>
            </thead>
            <tbody>
              {jeunes.map((jeune: Jeune) => (
                <tr key={jeune.id}>
                  <td className='pt-6 pb-6 pl-4 w-0'>
                    <input type='checkbox' disabled={true} />
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
