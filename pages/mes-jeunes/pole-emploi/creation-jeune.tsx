import { AppHead } from 'components/AppHead'
import FormulaireJeunePoleEmploi from 'components/jeune/FormulaireJeunePoleEmploi'
import { SuccessAddJeunePoleEmploi } from 'components/jeune/SuccessAddJeunePoleEmploi'
import { UserStructure } from 'interfaces/conseiller'
import { JeunePoleEmploiFormData } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import React, { useState } from 'react'
import useMatomo from 'utils/analytics/useMatomo'
import { useDIContext } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import BackIcon from '../../../assets/icons/arrow_back.svg'

function PoleEmploiCreationJeune() {
  const { jeunesService } = useDIContext()
  const { data: session } = useSession({ required: true })
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
      <AppHead titre={`Mes jeunes – Création d'un compte jeune`} />

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
        <h1 className='text-m-medium text-bleu_nuit mt-6 mb-4'>
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
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)

  if (!sessionOrRedirect.hasSession) {
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

  return { props: {} }
}

export default PoleEmploiCreationJeune
