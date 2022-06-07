import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import Router from 'next/router'
import React, { ReactNode, useEffect, useState } from 'react'

import { AjouterJeuneButton } from 'components/jeune/AjouterJeuneButton'
import { CreationEtape } from 'components/jeune/CreationEtape'
import DossierJeuneMilo from 'components/jeune/DossierJeuneMilo'
import FormulaireRechercheDossier from 'components/jeune/FormulaireRechercheDossier'
import SuccessAddJeuneMilo from 'components/jeune/SuccessAddJeuneMilo'
import { UserStructure } from 'interfaces/conseiller'
import { DossierMilo } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { Container } from 'utils/injectionDependances'

interface MiloCreationJeuneProps extends PageProps {
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
      {createdSucessId && (
        <div className='mb-4'>
          <AjouterJeuneButton
            handleAddJeune={() => {
              Router.push('/mes-jeunes/milo/creation-jeune')
              dossierId = ''
              setCreatedSucessId('')
              setEtape(1)
            }}
          />
        </div>
      )}

      <CreationEtape etape={etape} />

      <h1 className='text-m-medium text-primary mt-6 mb-4'>
        Création d&apos;un compte jeune
      </h1>
      {switchSteps()}
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

  if (!sessionOrRedirect.validSession) {
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
      console.error('Error in SSR: /mes-jeunes/milo/creation-jeune', err)
    }
  }
  //TODO: remettre numéro étape dans title
  return {
    props: {
      dossierId: dossierId || '',
      dossier,
      erreurMessageHttpMilo,
      pageTitle: `Mes jeunes - Création d'un compte jeune`,
      pageHeader: `Création d'un compte jeune`,
    },
  }
}

export default withTransaction(
  MiloCreationJeune.name,
  'page'
)(MiloCreationJeune)
