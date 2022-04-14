import { withTransaction } from '@elastic/apm-rum-react'
import FailureMessage from 'components/FailureMessage'
import Button, { ButtonStyle } from 'components/ui/Button'
import ButtonLink from 'components/ui/ButtonLink'
import { Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { JeunesService } from 'services/jeunes.service'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { RequestError } from 'utils/fetchJson'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'
import BackIcon from '../../../assets/icons/arrow_back.svg'
import InfoIcon from '../../../assets/icons/information.svg'

interface SuppressionJeuneProps {
  jeune: Jeune
  withoutChat: true
  pageTitle: string
}

function SuppressionJeune({ jeune }: SuppressionJeuneProps) {
  const { data: session } = useSession<true>({ required: true })
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const initialTracking = 'Détail jeune - Suppression compte'
  const [tracking, setTracking] = useState<string>(initialTracking)

  async function supprimerJeune() {
    setLoading(true)
    try {
      await jeunesService.supprimerJeune(jeune.id, session!.accessToken)
      await router.push('/mes-jeunes?suppression=succes')
    } catch (e) {
      setTracking('Détail jeune - Erreur suppr. compte')
      if (e instanceof RequestError) {
        if (e.code === 'JEUNE_PAS_INACTIF') {
          setError(
            'Le jeune a activé son compte. Vous ne pouvez pas supprimer un compte jeune activé.'
          )
        } else {
          setError(e.message)
        }
      } else {
        setError(
          'Suite à un problème inconnu la suppression a échoué. Vous pouvez réessayer.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  function clearDeletionError(): void {
    setError(undefined)
    setTracking(initialTracking)
  }

  useMatomo(tracking)

  return (
    <>
      <div className={styles.header}>
        <Link href={`/mes-jeunes/${jeune.id}`}>
          <a className='flex items-center w-max'>
            <BackIcon aria-hidden={true} focusable='false' />
            <span className='ml-6 h4-semi text-bleu_nuit'>
              Détails {jeune.firstName} {jeune.lastName}
            </span>
          </a>
        </Link>
      </div>

      <div className={styles.content}>
        {error && (
          <FailureMessage label={error} onAcknowledge={clearDeletionError} />
        )}

        <div className='m-auto mt-20 w-max'>
          <p className='h4-semi text-bleu_nuit'>
            Confirmez la suppression du compte jeune
          </p>
          <p className='mt-8 p-4 bg-primary_lighten rounded-medium text-base-medium text-primary flex items-center'>
            <InfoIcon focusable={false} aria-hidden={true} className='mr-2' />
            Une fois confirmée toutes les informations liées à ce jeune seront
            supprimées
          </p>

          <div className='mt-8 flex'>
            {!loading && (
              <ButtonLink
                href={`/mes-jeunes/${jeune.id}`}
                style={ButtonStyle.SECONDARY}
              >
                Annuler
              </ButtonLink>
            )}
            {loading && (
              <Button style={ButtonStyle.SECONDARY} disabled={true}>
                Annuler
              </Button>
            )}

            <Button
              type='button'
              style={ButtonStyle.PRIMARY}
              onClick={supprimerJeune}
              disabled={loading}
              className='ml-6'
            >
              Confirmer
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  SuppressionJeuneProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const jeunesService = withDependance<JeunesService>('jeunesService')
  const {
    session: { accessToken },
  } = sessionOrRedirect
  const idJeune = context.query.jeune_id as string

  const jeune = await jeunesService.getJeuneDetails(idJeune, accessToken)
  if (!jeune) return { notFound: true }

  if (jeune.isActivated) {
    return {
      redirect: { destination: `/mes-jeunes/${jeune.id}`, permanent: true },
    }
  }
  return {
    props: {
      jeune,
      withoutChat: true,
      pageTitle: `Suppression - ${jeune.firstName} ${jeune.lastName}`,
    },
  }
}

export default withTransaction(SuppressionJeune.name, 'page')(SuppressionJeune)
