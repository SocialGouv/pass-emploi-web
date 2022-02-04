import { AppHead } from 'components/AppHead'
import Button from 'components/Button'
import { GetServerSideProps } from 'next'
import React, { FormEvent, useState } from 'react'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import ArrowIcon from '../../assets/icons/arrow-right.svg'
import CloseIcon from '../../assets/icons/close.svg'
import SearchIcon from '../../assets/icons/search.svg'

type SupervisionProps = {}

function Supervision({}: SupervisionProps) {
  useMatomo('Supervision')

  const [emailConseillerActuel, setEmailConseillerActuel] = useState<string>('')
  const areSomeJeunesSelected = false

  function fetchListeJeunes(e: FormEvent) {
    e.preventDefault()
    console.log({ emailConseillerActuel })
  }

  function resetEmailConseillerActuel(e: FormEvent) {
    e.preventDefault()
    console.log('RESET')
  }

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
                type='text'
                id='email-conseiller-actuel'
                name='email-conseiller-actuel'
                onChange={(e) => setEmailConseillerActuel(e.target.value)}
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
              className='flex p-3 items-center text-base-medium text-primary_primary border border-primary_primary rounded-r-medium hover:bg-primary_lighten'
              type='submit'
              aria-label='Rechercher'
            >
              <SearchIcon role='img' focusable='false' aria-hidden={true} />
            </button>
          </div>
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
                type='text'
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
          className='self-end'
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
