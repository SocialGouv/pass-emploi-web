import { GetServerSideProps } from 'next'
import Button from 'components/Button'
import { FormEvent } from 'react'
import Link from 'next/link'
import BackIcon from '../../../assets/icons/arrow_back.svg'
import { CreationEtape } from 'components/jeune/CreationEtape'

type MiloCreationJeuneProps = {}

function MiloCreationJeune({}: MiloCreationJeuneProps) {
  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    alert('hyyyyyy')
  }

  return (
    <>
      <div className='flex items-center'>
        <Link href={'/mes-jeunes'} passHref>
          <a className='mr-6'>
            <BackIcon
              role='img'
              focusable='false'
              aria-label='Retour sur la liste de tous les jeunes'
            />
          </a>
        </Link>
        <p className='h4-semi text-bleu_nuit'>Liste de mes jeunes</p>
      </div>
      <div className='mt-20 pl-32'>
        <CreationEtape />
        <h1 className='text-m-medium text-bleu_nuit mt-6 mb-4'>
          Création d&apos;un compte jeune
        </h1>
        <p className='text-base-regular text-bleu mb-4'>
          Saisissez le numéro de dossier du jeune pour lequel vous voulez créer
          un compte
        </p>
        <form method='POST' onSubmit={handleSearchSubmit}>
          <label
            className='block text-sm-semi text-bleu_nuit'
            htmlFor='recherche-numero'
          >
            Numéro de dossier
          </label>
          <input
            type='text'
            id='recherche-numero'
            name='recherche-numero'
            required
            className='mt-4 mb-16 p-3 w-8/12 border border-bleu_nuit rounded-medium'
          />
          <Button type='submit'>Valider le numéro</Button>
        </form>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  MiloCreationJeuneProps
> = async ({}) => {
  return {
    props: {},
  }
}

export default MiloCreationJeune
