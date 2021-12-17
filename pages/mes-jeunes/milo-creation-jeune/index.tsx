import { GetServerSideProps } from 'next'
import Button from 'components/Button'
import React, { FormEvent, useState } from 'react'
import Link from 'next/link'
import BackIcon from '../../../assets/icons/arrow_back.svg'
import { CreationEtape } from 'components/jeune/CreationEtape'
import Router from 'next/router'
import { ErrorMessage } from 'components/ErrorMessage'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import { UserStructure } from 'interfaces/conseiller'
import {
  MessageErreurDossierContext,
  useMessageErreurDossierContext,
} from 'context/hooks'

type MiloCreationJeuneProps = {}

function MiloCreationJeune({}: MiloCreationJeuneProps) {
  const errorMessage = useMessageErreurDossierContext()

  console.log('errorMessage', errorMessage)

  const [numeroDossier, setNumeroDossier] = useState<string>('')
  const [messageErreur, setMessageErreur] = useState<string>('')

  const validate = () => {
    if (numeroDossier === '') {
      //TODO: implémenter avec erreur PoleEmploi API
      setMessageErreur('Veuillez remplir le champ')
      return false
    }
    return true
  }

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const isValid = validate()
    if (isValid) {
      Router.push(`/mes-jeunes/milo-creation-jeune/${numeroDossier}`)
    }
  }

  const handleSearchInputChanges = (value: string) => {
    setNumeroDossier(value)
  }

  useMatomo('Création jeune SIMILO – Etape 1 - récuperation du dossier jeune')

  return (
    <MessageErreurDossierContext.Provider value={errorMessage || null}>
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
            onChange={(e) => handleSearchInputChanges(e.target.value)}
            className='mt-4 mb-4 p-3 w-8/12 border border-bleu_nuit rounded-medium'
          />

          {messageErreur && <ErrorMessage>{errorMessage}</ErrorMessage>}

          {/* {errorNotFound && (
            <ErrorMessage>
              Dossier non trouvé. Vérifiez le numéro de dossier et saisissez-le
              de nouveau.
            </ErrorMessage>
          )} */}

          <Button type='submit'>Valider le numéro</Button>
        </form>
      </div>
    </MessageErreurDossierContext.Provider>
  )
}

export const getServerSideProps: GetServerSideProps<
  MiloCreationJeuneProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)

  if (!sessionOrRedirect.hasSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  if (sessionOrRedirect.session.user.structure !== UserStructure.MILO) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}

export default MiloCreationJeune

// Error du Back

// - 400 validation donnée entrée
// - 403 dossier non justifié
// - 404 NOT FOUND
// - 500
