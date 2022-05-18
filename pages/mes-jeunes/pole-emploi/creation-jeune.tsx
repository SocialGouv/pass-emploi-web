import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import Router from 'next/router'
import React, { useState } from 'react'

import { AjouterJeuneButton } from 'components/jeune/AjouterJeuneButton'
import FormulaireJeunePoleEmploi from 'components/jeune/FormulaireJeunePoleEmploi'
import { SuccessAddJeunePoleEmploi } from 'components/jeune/SuccessAddJeunePoleEmploi'
import { UserStructure } from 'interfaces/conseiller'
import { JeunePoleEmploiFormData } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { JeunesService } from 'services/jeunes.service'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'

interface PoleEmploiCreationJeuneProps extends PageProps {}

function PoleEmploiCreationJeune(): JSX.Element {
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const { data: session } = useSession<true>({ required: true })
  const [createdSuccessId, setCreatedSuccessId] = useState<string>('')
  const [creationError, setCreationError] = useState<string>('')
  const [creationEnCours, setCreationEnCours] = useState<boolean>(false)

  async function creerJeunePoleEmploi(
    newJeune: JeunePoleEmploiFormData
  ): Promise<void> {
    if (!session) return Promise.resolve()

    setCreationError('')
    setCreationEnCours(true)
    try {
      const jeune = await jeunesService.createCompteJeunePoleEmploi(
        {
          firstName: newJeune.prenom,
          lastName: newJeune.nom,
          email: newJeune.email,
        },
        session.user.id,
        session.accessToken
      )
      setCreatedSuccessId(jeune.id)
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
    <>
      {createdSuccessId && (
        <div className='mb-4'>
          <AjouterJeuneButton
            handleAddJeune={() => {
              Router.reload()
            }}
          />
        </div>
      )}

      <h1 className='text-m-medium mt-6 mb-4'>
        Création d&apos;un compte jeune
      </h1>

      {!createdSuccessId && (
        <FormulaireJeunePoleEmploi
          creerJeunePoleEmploi={creerJeunePoleEmploi}
          creationError={creationError}
          creationEnCours={creationEnCours}
        />
      )}

      {createdSuccessId && (
        <SuccessAddJeunePoleEmploi idJeune={createdSuccessId} />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  PoleEmploiCreationJeuneProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)

  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  if (sessionOrRedirect.session.user.structure !== UserStructure.POLE_EMPLOI) {
    return {
      redirect: {
        destination: '/mes-jeunes',
        permanent: false,
      },
    }
  }

  return {
    props: {
      pageTitle: "Mes jeunes – Création d'un compte jeune",
      pageHeader: "Création d'un compte jeune",
    },
  }
}

export default withTransaction(
  PoleEmploiCreationJeune.name,
  'page'
)(PoleEmploiCreationJeune)
