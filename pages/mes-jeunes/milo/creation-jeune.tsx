import { withTransaction } from '@elastic/apm-rum-react'
import { AppHead } from 'components/AppHead'
import { AjouterJeuneButton } from 'components/jeune/AjouterJeuneButton'
import { CreationEtape } from 'components/jeune/CreationEtape'
import DossierJeuneMilo from 'components/jeune/DossierJeuneMilo'
import FormulaireRechercheDossier from 'components/jeune/FormulaireRechercheDossier'
import { SuccessAddJeuneMilo } from 'components/jeune/SuccessAddJeuneMilo'
import { UserStructure } from 'interfaces/conseiller'
import { DossierMilo } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Router from 'next/router'
import React, { ReactNode, useEffect, useState } from 'react'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { Container } from 'utils/injectionDependances'
import BackIcon from '../../../assets/icons/arrow_back.svg'

type MiloCreationJeuneProps = {
  dossierId: string
  dossier: DossierMilo | null
  erreurMessageHttpMilo: string
}

function MiloCreationJeune({
  dossierId,
  dossier,
  erreurMessageHttpMilo,
}: MiloCreationJeuneProps) {
  const [etape, setEtape] = useState(1)
  const [createdSucessId, setCreatedSucessId] = useState<string>('')
  const [erreurMessage, setErreurMessage] = useState<string>(
    erreurMessageHttpMilo
  )

  useMatomo(
    erreurMessageHttpMilo
      ? 'Création jeune SIMILO – Etape 1 - récuperation du dossier jeune en erreur'
      : 'Création jeune SIMILO – Etape 1 - récuperation du dossier jeune'
  )

  useEffect(() => {
    if (!dossierId) {
      setEtape(1)
    }

    if (dossierId && !erreurMessageHttpMilo) {
      setEtape(2)
      setErreurMessage('')
    }

    if (createdSucessId) {
      setEtape(3)
    }
  }, [dossierId, erreurMessageHttpMilo, createdSucessId])

  return (
    <>
      <AppHead
        titre={`Mes jeunes - Création d'un compte jeune - Étape ${etape}`}
      />

      <div className={`flex justify-between ${styles.header}`}>
        <Link href={'/mes-jeunes'}>
          <a className='flex items-center'>
            <BackIcon role='img' focusable='false' aria-hidden={true} />
            <span className='ml-6 h4-semi text-bleu_nuit'>
              Liste de mes jeunes
            </span>
          </a>
        </Link>

        {createdSucessId && (
          <AjouterJeuneButton
            handleAddJeune={() => {
              Router.push('/mes-jeunes/milo/creation-jeune')
              dossierId = ''
              setCreatedSucessId('')
              setEtape(1)
            }}
          />
        )}
      </div>

      <div className={`${styles.content} pl-32`}>
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
        return etape1()
      case 2:
        return etape2()
      case 3:
        return etape3()
      default:
        break
    }
  }

  function etape1(): ReactNode {
    return (
      <FormulaireRechercheDossier
        dossierId={dossierId}
        errMessage={erreurMessageHttpMilo}
      />
    )
  }

  function etape3(): ReactNode {
    return <SuccessAddJeuneMilo idJeune={createdSucessId} />
  }

  function etape2(): ReactNode {
    return (
      <>
        {dossier && (
          <DossierJeuneMilo
            dossier={dossier}
            onCreatedSuccess={(id) => setCreatedSucessId(id)}
            onCreatedError={(message) => setErreurMessage(message)}
            erreurMessageHttpPassEmploi={erreurMessage || ''}
          />
        )}

        {erreurMessageHttpMilo && (
          <FormulaireRechercheDossier
            dossierId={dossierId}
            errMessage={erreurMessageHttpMilo}
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
        destination: '/mes-jeunes',
        permanent: false,
      },
    }
  }

  let dossier: DossierMilo | null = null
  let erreurMessageHttpMilo: string = ''

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
      erreurMessageHttpMilo =
        (err as Error).message || "Une erreur inconnue s'est produite"
      console.log('Error in SSR: /mes-jeunes/milo/creation-jeune', err)
    }
  }

  return {
    props: {
      dossierId: dossierId || '',
      dossier,
      erreurMessageHttpMilo,
    },
  }
}

export default withTransaction(
  MiloCreationJeune.name,
  'page'
)(MiloCreationJeune)
