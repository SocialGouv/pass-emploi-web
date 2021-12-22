import { GetServerSideProps } from 'next'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import { Container } from 'utils/injectionDependances'
import { UserStructure } from 'interfaces/conseiller'
import { DossierMilo } from 'interfaces/jeune'
import { CreationEtape } from 'components/jeune/CreationEtape'
import InputRechercheDossier from 'components/jeune/InputRechercheDossier'
import DossierJeuneMilo from 'components/jeune/DossierJeuneMilo'
import { SuccessAddJeuneMilo } from 'components/jeune/SuccessAddJeuneMilo'

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
  const [etape, setEtape] = useState(1)
  const [createdSucessId, setCreatedSucessId] = useState<string>('')
  const [erreurMessage, setErreurMessage] = useState<string>(errMessage)

  useMatomo(
    errMessage
      ? 'Création jeune SIMILO – Etape 1 - récuperation du dossier jeune en erreur'
      : 'Création jeune SIMILO – Etape 1 - récuperation du dossier jeune'
  )

  useEffect(() => {
    if (!dossierId) {
      setEtape(1)
    }

    if (dossierId && !errMessage) {
      setEtape(2)
      setErreurMessage('')
    }

    if (createdSucessId) {
      setEtape(3)
    }
  }, [dossierId, errMessage, createdSucessId])

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
        <CreationEtape etape={etape} />

        <h1 className='text-m-medium text-bleu_nuit mt-6 mb-4'>
          Création d&apos;un compte jeune
        </h1>
        {switchSteps()}
      </div>
    </>
  )

  function switchSteps() {
    switch (etape) {
      case 1:
        return step1()
      case 2:
        return step2()
      case 3:
        return step3()
      default:
        break
    }
  }

  function step1(): React.ReactNode {
    return <InputRechercheDossier />
  }

  function step3(): React.ReactNode {
    return <SuccessAddJeuneMilo idJeune={createdSucessId} />
  }

  function step2(): React.ReactNode {
    return (
      <>
        {dossier && (
          <DossierJeuneMilo
            dossier={dossier}
            onCreatedSuccess={(id) => setCreatedSucessId(id)}
            onCreatedError={(message) => setErreurMessage(message)}
            erreurMessage={erreurMessage || ''}
          />
        )}

        {errMessage && (
          <InputRechercheDossier
            dossierId={dossierId}
            errMessage={errMessage}
          />
        )}
      </>
    )
  }
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
