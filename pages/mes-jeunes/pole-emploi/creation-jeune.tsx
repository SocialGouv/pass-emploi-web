import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import FormulaireJeunePoleEmploi from 'components/jeune/FormulaireJeunePoleEmploi'
import { StructureConseiller } from 'interfaces/conseiller'
import { JeunePoleEmploiFormData } from 'interfaces/json/jeune'
import { PageProps } from 'interfaces/pageProps'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { JeunesService } from 'services/jeunes.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'

interface PoleEmploiCreationJeuneProps extends PageProps {}

function PoleEmploiCreationJeune(): JSX.Element {
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const router = useRouter()
  const [creationError, setCreationError] = useState<string>('')
  const [creationEnCours, setCreationEnCours] = useState<boolean>(false)

  async function creerJeunePoleEmploi(
    newJeune: JeunePoleEmploiFormData
  ): Promise<void> {
    setCreationError('')
    setCreationEnCours(true)
    try {
      const { id } = await jeunesService.createCompteJeunePoleEmploi({
        firstName: newJeune.prenom,
        lastName: newJeune.nom,
        email: newJeune.email,
      })
      await router.push({
        pathname: `/mes-jeunes`,
        query: {
          [QueryParam.creationBeneficiaire]: QueryValue.succes,
          idBeneficiaire: id,
        },
      })
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
    },
  }
}

export default withTransaction(
  PoleEmploiCreationJeune.name,
  'page'
)(PoleEmploiCreationJeune)
