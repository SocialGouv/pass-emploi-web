import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import React, { useState } from 'react'

import { Etape } from 'components/ui/Form/Etape'
import Label from 'components/ui/Form/Label'
import { Switch } from 'components/ui/Form/Switch'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { estUserPoleEmploi } from 'interfaces/conseiller'
import { DetailsSession } from 'interfaces/detailsSession'
import { PageProps } from 'interfaces/pageProps'
import { DATETIME_LONG, toFrenchFormat } from 'utils/date'
import redirectedFromHome from 'utils/redirectedFromHome'

type DetailSessionProps = PageProps & {
  session: DetailsSession
}

function DetailsSession({ session }: DetailSessionProps) {
  const [visibiliteSession, setVisibiliteSession] = useState<boolean>(
    session.session.estVisible
  )
  const [loadingChangerVisibilite, setLoadingChangerVisibilite] =
    useState<boolean>(false)

  async function handleChangerVisibiliteSession() {
    setLoadingChangerVisibilite(true)

    const { changerVisibiliteSession } = await import(
      'services/sessions.service'
    )
    await changerVisibiliteSession(session.session.id, !visibiliteSession)

    setVisibiliteSession(!visibiliteSession)
    setLoadingChangerVisibilite(false)
  }

  return (
    <>
      <InformationMessage label='Pour modifier la session, rendez-vous sur i-milo.' />

      <section className='border border-solid rounded-base w-full p-4 border-grey_100 mt-6'>
        <h2 className='text-m-bold text-grey_800 mb-4'>Informations offre</h2>
        <dl>
          <div className='mb-3'>
            <dt className='inline text-base-regular'>Titre :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.offre.titre}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Type :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.offre.type}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Thème :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.offre.theme}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Description :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.offre.description ?? (
                <>
                  --
                  <span className='sr-only'>information non disponible</span>
                </>
              )}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Partenaire :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.offre.partenaire ?? (
                <>
                  --
                  <span className='sr-only'>information non disponible</span>
                </>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section className='border border-solid rounded-base w-full p-4 border-grey_100 my-6'>
        <h2 className='text-m-bold text-grey_800 mb-4'>Informations session</h2>
        <dl>
          <div className='mb-3'>
            <dt className='inline text-base-regular'>Nom :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.session.nom}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Début :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {toFrenchFormat(
                DateTime.fromISO(session.session.dateHeureDebut),
                DATETIME_LONG
              )}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Fin :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {toFrenchFormat(
                DateTime.fromISO(session.session.dateHeureFin),
                DATETIME_LONG
              )}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>
              Date limite d’inscription :
            </dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.session.dateMaxInscription ? (
                toFrenchFormat(
                  DateTime.fromISO(session.session.dateMaxInscription),
                  DATETIME_LONG
                )
              ) : (
                <>
                  --
                  <span className='sr-only'>information non disponible</span>
                </>
              )}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Animateur :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.session.animateur ?? (
                <>
                  --
                  <span className='sr-only'>information non disponible</span>
                </>
              )}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Lieu :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.session.lieu}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Commentaire :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.session.commentaire ?? (
                <>
                  --
                  <span className='sr-only'>information non disponible</span>
                </>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <Etape numero={1} titre='Gérez la visibilité'>
        <div className='flex items-center gap-1'>
          <Label htmlFor='visibilite-session'>
            Rendre {visibiliteSession ? 'visible' : 'invisible'} la session aux
            bénéficiaires de la Mission Locale
          </Label>
          <Switch
            id='visibilite-session'
            checkedLabel='Oui'
            uncheckedLabel='Non'
            checked={visibiliteSession}
            onChange={handleChangerVisibiliteSession}
            disabled={loadingChangerVisibilite}
          />
        </div>
      </Etape>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  DetailSessionProps
> = async (context) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  if (estUserPoleEmploi(user)) return { notFound: true }

  const idSession = context.query.session_id as string

  const referer = context.req.headers.referer
  const redirectTo =
    referer && !redirectedFromHome(referer) ? referer : '/mes-jeunes'

  const { getDetailsSession } = await import('services/sessions.service')
  const session = await getDetailsSession(user.id, idSession, accessToken)
  if (!session) return { notFound: true }

  return {
    props: {
      pageTitle: `Détail session ${session.session.nom} - Agenda`,
      pageHeader: 'Détail de la session i-milo',
      returnTo: redirectTo,
      session: session,
      withoutChat: true,
    },
  }
}

export default withTransaction(DetailsSession.name, 'page')(DetailsSession)
