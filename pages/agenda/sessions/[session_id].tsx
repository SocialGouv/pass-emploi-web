import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import React from 'react'

import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { estUserPoleEmploi } from 'interfaces/conseiller'
import { PageProps } from 'interfaces/pageProps'
import { Session } from 'interfaces/session'
import { DATETIME_LONG, toFrenchFormat } from 'utils/date'
import redirectedFromHome from 'utils/redirectedFromHome'

interface DetailSessionProps extends PageProps {
  session: Session
}

function DetailSession({ session }: DetailSessionProps) {
  return (
    <>
      <div className='mt-6'>
        <InformationMessage label='Pour modifier la session, rendez-vous sur i-milo.' />
      </div>

      <section className='border border-solid rounded-base w-full p-4 border-grey_100 mt-6'>
        <h2 className='text-m-bold text-grey_800 mb-4'>Informations offre</h2>
        <dl>
          <div className='mb-3'>
            <dt className='inline text-base-regular'>Titre de l’offre :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.offre.titre}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Type :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.offre.type.label}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Thème de l’offre :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.offre.theme}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>
              Description de l’offre :
            </dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.offre.description ?? '--'}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Partenaire :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.offre.partenaire ?? '--'}
            </dd>
          </div>
        </dl>
      </section>

      <section className='border border-solid rounded-base w-full p-4 border-grey_100 mt-6'>
        <h2 className='text-m-bold text-grey_800 mb-4'>Informations session</h2>
        <dl>
          <div className='mb-3'>
            <dt className='inline text-base-regular'>Nom de la session :</dt>
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
              {session.session.dateMaxInscription
                ? toFrenchFormat(
                    DateTime.fromISO(session.session.dateMaxInscription),
                    DATETIME_LONG
                  )
                : '--'}
            </dd>
          </div>

          <div className='mb-3'>
            <dt className='inline text-base-regular'>Animateur :</dt>
            <dd className='ml-2 inline text-base-medium'>
              {session.session.animateur ?? '--'}
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
              {session.session.commentaire ?? '--'}
            </dd>
          </div>
        </dl>
      </section>
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
      pageTitle: 'Détail de la session i-milo',
      returnTo: redirectTo,
      session: session,
      withoutChat: true,
    },
  }
}

export default withTransaction(DetailSession.name, 'page')(DetailSession)
