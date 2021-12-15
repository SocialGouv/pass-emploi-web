import { GetServerSideProps } from 'next'
import Button from 'components/Button'
import { FormEvent, useState } from 'react'
import Link from 'next/link'
import BackIcon from '../../../assets/icons/arrow_back.svg'
import { CreationEtape } from 'components/jeune/CreationEtape'
import { useRouter } from 'next/router'

type MiloCreationJeuneProps = {}

function MiloCreationJeune({}: MiloCreationJeuneProps) {
  const [numeroDossier, setNumeroDossier] = useState<string | undefined>('')
  const router = useRouter()

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    //url à valider
    router.push(`/mes-jeunes/milo-creation-jeune/${numeroDossier}`)
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
            value={numeroDossier}
            onChange={(e) => setNumeroDossier(e.target.value)}
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
