import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import Router from 'next/router'
import React, { ReactNode, useEffect, useState } from 'react'

import { AjouterJeuneButton } from 'components/jeune/AjouterJeuneButton'
import CreationEtape from 'components/jeune/CreationEtape'
import DossierJeuneMilo from 'components/jeune/DossierJeuneMilo'
import FormulaireRechercheDossier from 'components/jeune/FormulaireRechercheDossier'
import SuccessAddJeuneMilo from 'components/jeune/SuccessAddJeuneMilo'
import { StructureConseiller } from 'interfaces/conseiller'
import { DossierMilo } from 'interfaces/jeune'
import { JeuneMiloFormData } from 'interfaces/json/jeune'
import { PageProps } from 'interfaces/pageProps'
import { ConseillerService } from 'services/conseiller.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { Container, useDependance } from 'utils/injectionDependances'

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
  const conseillerService =
    useDependance<ConseillerService>('conseillerService')

  const [etape, setEtape] = useState(1)
  const [createdSucessId, setCreatedSucessId] = useState<string>('')
  const [erreurMessage, setErreurMessage] = useState<string>(
    erreurMessageHttpMilo
  )

  async function creerCompteJeune(newJeune: JeuneMiloFormData) {
    try {
      const { id } = await conseillerService.createCompteJeuneMilo(newJeune)
      setCreatedSucessId(id)
    } catch (error) {
      setErreurMessage((error as Error).message)
    }
  }

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

      <div className='mt-4'>{switchSteps()}</div>
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
            onCreateCompte={creerCompteJeune}
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

  if (sessionOrRedirect.session.user.structure !== StructureConseiller.MILO) {
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
