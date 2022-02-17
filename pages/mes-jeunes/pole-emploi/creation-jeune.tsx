import { AppHead } from 'components/AppHead'
import FormulaireJeunePoleEmploi from 'components/jeune/FormulaireJeunePoleEmploi'
import { SuccessAddJeunePoleEmploi } from 'components/jeune/SuccessAddJeunePoleEmploi'
import { UserStructure } from 'interfaces/conseiller'
import { JeunePoleEmploiFormData } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import React, { useState } from 'react'
import { JeunesService } from 'services/jeunes.service'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import { useDependance } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import BackIcon from '../../../assets/icons/arrow_back.svg'

function PoleEmploiCreationJeune() {
  const jeunesService = useDependance<JeunesService>('jeunesService')
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

      <div className={styles.header}>
        <Link href={'/mes-jeunes'}>
          <a className='flex items-center'>
            <BackIcon role='img' focusable='false' aria-hidden={true} />
            <span className='ml-6 h4-semi text-bleu_nuit'>
              Liste de mes jeunes
            </span>
          </a>
        </Link>
      </div>

      <div className={`${styles.content} pl-32`}>
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
