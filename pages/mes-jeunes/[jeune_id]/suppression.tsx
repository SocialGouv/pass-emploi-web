import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import FailureMessage from 'components/FailureMessage'
import InformationMessage from 'components/InformationMessage'
import Button, { ButtonStyle } from 'components/ui/Button'
import ButtonLink from 'components/ui/ButtonLink'
import { UserStructure } from 'interfaces/conseiller'
import { Jeune } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { JeunesService } from 'services/jeunes.service'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { RequestError } from 'utils/httpClient'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

interface SuppressionJeuneProps extends PageProps {
  jeune: Jeune
  structureConseiller: string
}

function SuppressionJeune({
  jeune,
  structureConseiller,
}: SuppressionJeuneProps) {
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
      {error && (
        <FailureMessage label={error} onAcknowledge={clearDeletionError} />
      )}

      <div className='m-auto mt-20 w-max'>
        <p className='text-l-regular text-primary_darken'>
          Confirmez la suppression du compte jeune
        </p>
        <div className='mt-8'>
          <InformationMessage content='Une fois confirmée toutes les informations liées à ce compte jeune seront supprimées'>
            {structureConseiller === UserStructure.MILO && (
              <p>
                Si vous souhaitez <b>recréer le compte de ce jeune</b>, merci de
                transmettre en amont le numéro de dossier technique à l’adresse{' '}
                <a
                  className='underline hover:text-primary_darken'
                  href='mailto:support@pass-emploi.beta.gouv.fr'
                >
                  support@pass-emploi.beta.gouv.fr
                </a>
                .
              </p>
            )}
          </InformationMessage>
        </div>

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
    session: { user, accessToken },
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
      structureConseiller: user.structure,
      withoutChat: true,
      pageTitle: `Suppression - ${jeune.firstName} ${jeune.lastName}`,
      pageHeader: `Suppression de ${jeune.firstName} ${jeune.lastName}`,
      returnTo: `/mes-jeunes/${jeune.id}`,
    },
  }
}

export default withTransaction(SuppressionJeune.name, 'page')(SuppressionJeune)
