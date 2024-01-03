import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { ReactNode, useEffect, useState } from 'react'

import CreationEtape from 'components/jeune/CreationEtape'
import DossierJeuneMilo from 'components/jeune/DossierJeuneMilo'
import FormulaireRechercheDossier from 'components/jeune/FormulaireRechercheDossier'
import { StructureConseiller } from 'interfaces/conseiller'
import { DossierMilo } from 'interfaces/jeune'
import { JeuneMiloFormData } from 'interfaces/json/jeune'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

interface MiloCreationJeuneProps extends PageProps {
  dossierId: string
  dossier: DossierMilo | null
  erreurMessageHttpMilo: string
  etape: number
}

function MiloCreationJeune({
  dossierId,
  dossier,
  erreurMessageHttpMilo,
}: MiloCreationJeuneProps) {
  const router = useRouter()
  const [_, setAlerte] = useAlerte()
  const [portefeuille, setPortefeuille] = usePortefeuille()

  const [etape, setEtape] = useState(1)
  const [erreurMessage, setErreurMessage] = useState<string>(
    erreurMessageHttpMilo
  )

  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  async function creerCompteJeune(
    beneficiaireData: JeuneMiloFormData
  ): Promise<void> {
    try {
      const { createCompteJeuneMilo } = await import(
        'services/conseiller.service'
      )
      const beneficiaireCree = await createCompteJeuneMilo(beneficiaireData)

      setPortefeuille(portefeuille.concat(beneficiaireCree))
      setAlerte(AlerteParam.creationBeneficiaire, beneficiaireCree.id)
      await router.push('/mes-jeunes')
    } catch (error) {
      setErreurMessage((error as Error).message)
    }
  }

  useMatomo(
    erreurMessageHttpMilo
      ? 'Création jeune SIMILO – Etape 1 - récuperation du dossier jeune en erreur'
      : 'Création jeune SIMILO – Etape 1 - récuperation du dossier jeune',
    aDesBeneficiaires
  )

  useEffect(() => {
    if (!dossierId) {
      setEtape(1)
    }

    if (dossierId && !erreurMessageHttpMilo) {
      setEtape(2)
      setErreurMessage('')
    }
  }, [dossierId, erreurMessageHttpMilo])

  return (
    <>
      <CreationEtape etape={etape} />

      <div className='mt-4'>{switchSteps()}</div>
    </>
  )

  function switchSteps() {
    return etape === 1 ? etape1() : etape2()
  }

  function etape1(): ReactNode {
    return (
      <FormulaireRechercheDossier
        dossierId={dossierId}
        errMessage={erreurMessageHttpMilo}
      />
    )
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
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
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
  //remettre numéro étape dans title
  let etape: number = 1

  if (dossierId) {
    try {
      const { getDossierJeune } = await import('services/conseiller.service')
      dossier =
        (await getDossierJeune(
          dossierId,
          sessionOrRedirect.session.accessToken
        )) || null
      etape = dossier ? 2 : 1
    } catch (err) {
      erreurMessageHttpMilo =
        (err as Error).message || "Une erreur inconnue s'est produite"
      console.error('Error in SSR: /mes-jeunes/milo/creation-jeune', err)
    }
  }

  return {
    props: {
      dossierId: dossierId || '',
      dossier,
      erreurMessageHttpMilo,
      etape,
      pageTitle: `Portefeuille - Créer compte bénéficiaire - étape ${etape} sur 2 `,
      pageHeader: `Créer un compte bénéficiaire`,
      returnTo: '/mes-jeunes',
    },
  }
}

export default withTransaction(
  MiloCreationJeune.name,
  'page'
)(MiloCreationJeune)
