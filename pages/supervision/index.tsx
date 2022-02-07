import { AppHead } from 'components/AppHead'
import Button from 'components/Button'
import { Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import React, { FormEvent, useState } from 'react'
import { JeunesService } from 'services/jeunes.service'
import useMatomo from 'utils/analytics/useMatomo'
import { useDependance } from 'utils/injectionDependances'
import isEmailValid from 'utils/isEmailValid'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import ArrowIcon from '../../assets/icons/arrow-right.svg'
import CloseIcon from '../../assets/icons/close.svg'
import SearchIcon from '../../assets/icons/search.svg'
import ImportantIcon from '../../assets/icons/important.svg'

type SupervisionProps = {}

function Supervision({}: SupervisionProps) {
  const { data: session } = useSession({ required: true })
  const jeunesService = useDependance<JeunesService>('jeunesService')

  const [emailConseillerActuel, setEmailConseillerActuel] = useState<{
    value: string
    error?: string
  }>({ value: '' })
  const [isRechercheEnabled, setRecherchedEnabled] = useState<boolean>(false)
  const [isRechercheSubmitted, setRechecheSubmitted] = useState<boolean>(false)
  const [jeunes, setJeunes] = useState<Jeune[]>([])
  const areSomeJeunesSelected = false

  function editEmailConseillerActuel(value: string) {
    setEmailConseillerActuel({ value })
    setRechecheSubmitted(false)
    setJeunes([])
    setRecherchedEnabled(Boolean(value) && isEmailValid(value))
  }

  async function fetchListeJeunes(e: FormEvent) {
    e.preventDefault()
    setRecherchedEnabled(false)
    try {
      const jeunes: Jeune[] = await jeunesService.getJeunesDuConseillerParEmail(
        emailConseillerActuel.value,
        session!.accessToken
      )
      setJeunes(jeunes)
      setRechecheSubmitted(true)
    } catch (err) {
      let erreur: string
      if ((err as Error).message) erreur = 'Aucun conseiller ne correspond'
      else erreur = "Une erreur inconnue s'est produite"
      setEmailConseillerActuel({ ...emailConseillerActuel, error: erreur })
    }
  }

  function resetEmailConseillerActuel(e: FormEvent) {
    e.preventDefault()
    editEmailConseillerActuel('')
  }

  useMatomo('Supervision')

  return (
    <>
      <AppHead titre='Supervision' />
      <span className='flex flex-wrap justify-between mb-12'>
        <h1 className='h2-semi text-primary_primary'>
          Réaffectation des jeunes
        </h1>
      </span>

      <div className='mb-10 bg-gris_blanc rounded-medium p-6 text-primary_primary'>
        <span className='text-base-medium mb-4'>
          Pour réaffecter les jeunes d&apos;un conseiller vers un autre
          conseiller :
        </span>
        <ol className='flex text-sm-medium'>
          <li className='mr-8'>
            1. Renseigner l’adresse e-mail du conseiller initial
          </li>
          <li className='mr-8'>2. Sélectionner les jeunes à réaffecter</li>
          <li>3. Renseigner le mail du conseiller de destination</li>
        </ol>
      </div>

      <div className='flex w-full'>
        <form role='search' onSubmit={fetchListeJeunes} className='grow mr-12'>
          <label
            htmlFor='email-conseiller-actuel'
            className='text-base-medium text-neutral_content'
          >
            E-mail conseiller actuel
          </label>
          <div className='flex mt-3.5'>
            <>
              <input
                type='email'
                id='email-conseiller-actuel'
                name='email-conseiller-actuel'
                value={emailConseillerActuel.value}
                onChange={(e) => editEmailConseillerActuel(e.target.value)}
                className={`flex-1 p-3 w-8/12 border border-r-0 border-neutral_grey rounded-l-medium text-base-medium text-primary_primary`}
              />
              <button
                type='reset'
                title='Effacer'
                aria-label='Effacer le champ de saisie'
                className='border border-r-0 border-l-0 border-content_color w-8 text-primary_primary'
                onClick={resetEmailConseillerActuel}
              >
                <CloseIcon
                  role='img'
                  className='text-primary_primary'
                  focusable={false}
                  aria-hidden={true}
                />
              </button>
            </>

            <button
              className={`flex p-3 items-center text-base-medium text-primary_primary border border-primary_primary rounded-r-medium ${
                isRechercheEnabled
                  ? 'hover:bg-primary_lighten'
                  : 'border-[#999BB3]'
              }`}
              type='submit'
              title='Rechercher'
              aria-label='Rechercher conseiller actuel'
              disabled={!isRechercheEnabled}
            >
              <SearchIcon
                role='img'
                focusable='false'
                aria-hidden={true}
                className={isRechercheEnabled ? '' : 'fill-[#999BB3]'}
              />
            </button>
          </div>
          {Boolean(emailConseillerActuel.error) && (
            <div className='flex mt-4'>
              <ImportantIcon
                role='img'
                focusable={false}
                aria-hidden={true}
                className='fill-status_warning w-6 h-6 mr-2'
              />
              <span className=' text-status_warning'>
                {emailConseillerActuel.error}
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
            <>
              <input
                type='email'
                id='email-conseiller-destination'
                name='email-conseiller-destination'
                onChange={() => {}}
                className='flex-1 p-3 w-8/12 border border-r-0 border-neutral_grey rounded-l-medium text-base-medium text-primary_primary disabled:border-[#999BB3]'
                disabled={!areSomeJeunesSelected}
              />
              <button
                type='reset'
                title='Effacer'
                aria-label='Effacer le champ de saisie'
                className='border border border-l-0 border-content_color rounded-r-medium w-8 text-primary_primary disabled:border-[#999BB3]'
                onClick={() => {}}
                disabled={!areSomeJeunesSelected}
              >
                <CloseIcon
                  role='img'
                  className={`text-primary_primary ${
                    !areSomeJeunesSelected ? 'fill-[#999BB3]' : ''
                  }`}
                  focusable={false}
                  aria-hidden={true}
                />
              </button>
            </>
          </div>
        </form>

        <Button
          form='affecter-jeunes'
          label='Réaffecter les jeunes'
          type='submit'
          className='mt-9'
          disabled={!areSomeJeunesSelected}
        >
          <ArrowIcon
            className='fill-blanc mr-2'
            role='img'
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
          <span className='text-m-medium'>
            Jeunes de {emailConseillerActuel.value}
          </span>
          <table className='w-full mt-8'>
            <thead>
              <tr>
                <th className='pb-2' />
                <th className='pb-2 pl-4 pr-4 text-sm-regular text-neutral_content'>
                  Nom et prénom
                </th>
                <th className='pb-2 pl-4 pr-4 text-sm-regular text-neutral_content'>
                  Conseiller précédent
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {jeunes.map((jeune: Jeune) => (
                <tr key={jeune.id}>
                  <td className='pt-6 pb-6 pl-4 w-0'>
                    <input type='checkbox' disabled={true} />
                  </td>
                  <td className='pt-6 pb-6 pl-4 pr-4 text-md-semi'>
                    {jeune.firstName} {jeune.lastName}
                  </td>
                  <td className='pt-6 pb-6 pl-4 pr-4'>
                    {jeune.conseillerPrecedent
                      ? `${jeune.conseillerPrecedent.prenom} ${jeune.conseillerPrecedent.nom}`
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
