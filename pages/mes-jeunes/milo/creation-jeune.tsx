import next, { GetServerSideProps } from 'next'
import React, { useState } from 'react'
import Link from 'next/link'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import { Container } from 'utils/injectionDependances'
import { UserStructure } from 'interfaces/conseiller'
import { DossierMilo } from 'interfaces/jeune'
import { CreationEtape } from 'components/jeune/CreationEtape'
import InputRechercheDossier from 'components/jeune/InputRechercheDossier'
import DossierJeuneMilo from 'components/jeune/DossierMilo'

import BackIcon from '../../../assets/icons/arrow_back.svg'
import { AppHead } from 'components/AppHead'

type MiloCreationJeuneProps = {
  dossierId: string
  dossier: DossierMilo | null
  errMessage: string
}

function MiloCreationJeune({
  dossierId,
  dossier,
  errMessage,
}: MiloCreationJeuneProps) {
  //TODO: stepper à faire
  const [etape, setEtape] = useState(1)
  useMatomo(
    errMessage
      ? 'Création jeune SIMILO – Etape 1 - récuperation du dossier jeune en erreur'
      : 'Création jeune SIMILO – Etape 1 - récuperation du dossier jeune'
  )

  return (
    <>
      <AppHead
        titre={`Mes jeunes - Création d'un compte jeune Étape ${etape}`}
      />

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
        {!dossierId ? (
          <CreationEtape etape={'1'} />
        ) : (
          <CreationEtape etape={'2'} />
        )}
        <h1 className='text-m-medium text-bleu_nuit mt-6 mb-4'>
          Création d&apos;un compte jeune
        </h1>
        {!dossierId && <InputRechercheDossier />}

        {dossierId && (
          <>
            {dossier && <DossierJeuneMilo dossier={dossier} />}
            {errMessage && (
              <InputRechercheDossier
                dossierId={dossierId}
                errMessage={errMessage}
              />
            )}
          </>
        )}
      </div>
    </>
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

  let dossier: DossierMilo | null = null
  let errMessage: string = ''

  const dossierId = context.query.dossierId as string

  if (dossierId) {
    const { conseillerService } = Container.getDIContainer().dependances
    try {
      dossier =
        (await conseillerService.getDossierJeune(
          dossierId,
          sessionOrRedirect.session.accessToken
        )) || null
    } catch (err) {
      errMessage =
        (err as Error).message || "Une erreur inconnue s'est produite"
      console.log('Error in SSR: /mes-jeunes/milo/creation-jeune', err)
    }
  }

  return {
    props: {
      dossierId: dossierId || '',
      dossier,
      errMessage,
    },
  }
}

export default MiloCreationJeune
