import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import FormulaireJeunePoleEmploi from 'components/jeune/FormulaireJeunePoleEmploi'
import { StructureConseiller } from 'interfaces/conseiller'
import { JeunePoleEmploiFormData } from 'interfaces/json/jeune'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import { createCompteJeunePoleEmploi } from 'services/jeunes.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

interface PoleEmploiCreationJeuneProps extends PageProps {}

function PoleEmploiCreationJeune(): JSX.Element {
  const router = useRouter()
  const [_, setAlerte] = useAlerte()
  const [portefeuille, setPortefeuille] = usePortefeuille()

  const [creationError, setCreationError] = useState<string>('')
  const [creationEnCours, setCreationEnCours] = useState<boolean>(false)

  async function creerJeunePoleEmploi(
    newJeune: JeunePoleEmploiFormData
  ): Promise<void> {
    setCreationError('')
    setCreationEnCours(true)
    try {
      const beneficiaireCree = await createCompteJeunePoleEmploi({
        firstName: newJeune.prenom,
        lastName: newJeune.nom,
        email: newJeune.email,
      })

      setPortefeuille(portefeuille.concat(beneficiaireCree))
      setAlerte(AlerteParam.creationBeneficiaire, beneficiaireCree.id)
      await router.push('/mes-jeunes')
    } catch (error) {
      setCreationError(
        (error as Error).message || "Une erreur inconnue s'est produite"
      )
    } finally {
      setCreationEnCours(false)
    }
  }

  useMatomo(creationError ? 'Création jeune PE en erreur' : 'Création jeune PE')

  return (
    <FormulaireJeunePoleEmploi
      creerJeunePoleEmploi={creerJeunePoleEmploi}
      creationError={creationError}
      creationEnCours={creationEnCours}
    />
  )
}

export const getServerSideProps: GetServerSideProps<
  PoleEmploiCreationJeuneProps
> = async (context) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)

  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  if (
    sessionOrRedirect.session.user.structure !== StructureConseiller.POLE_EMPLOI
  ) {
    return {
      redirect: {
        destination: '/mes-jeunes',
        permanent: false,
      },
    }
  }

  return {
    props: {
      pageTitle: `Portefeuille - Créer bénéficiaire`,
      pageHeader: `Créer un compte bénéficiaire`,
      returnTo: '/mes-jeunes',
    },
  }
}

export default withTransaction(
  PoleEmploiCreationJeune.name,
  'page'
)(PoleEmploiCreationJeune)
