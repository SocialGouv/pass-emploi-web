import { act, screen } from '@testing-library/react'
import { DateTime } from 'luxon'
import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'

import { uneSession } from 'fixtures/session'
import { Session } from 'interfaces/session'
import DetailSession, {
  getServerSideProps,
} from 'pages/agenda/sessions/[session_id]'
import { getDetailsSession } from 'services/sessions.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'
import { DATETIME_LONG, toFrenchFormat } from 'utils/date'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/sessions.service')

describe('Détails Session', () => {
  describe('client side', () => {
    describe('contenu', () => {
      let session: Session
      beforeEach(async () => {
        // Given
        session = uneSession()
        // When
        await act(async () => {
          renderWithContexts(<DetailSession pageTitle='' session={session} />)
        })
      })

      it('affiche les détails de l’offre', () => {
        // Then
        expect(screen.getByText('Informations offre')).toBeInTheDocument()
        expect(getByDescriptionTerm('Titre de l’offre :')).toHaveTextContent(
          session.offre.titre
        )
        expect(getByDescriptionTerm('Type :')).toHaveTextContent(
          session.offre.type.label
        )
        expect(getByDescriptionTerm('Thème de l’offre :')).toHaveTextContent(
          session.offre.theme
        )
        expect(
          getByDescriptionTerm('Description de l’offre :')
        ).toHaveTextContent(session.offre.description!)
        expect(getByDescriptionTerm('Partenaire :')).toHaveTextContent(
          session.offre.partenaire!
        )
      })

      it('affiche les détails de la session', () => {
        // Then
        expect(screen.getByText('Informations session')).toBeInTheDocument()
        expect(getByDescriptionTerm('Nom de la session :')).toHaveTextContent(
          session.session.nom
        )
        expect(getByDescriptionTerm('Début :')).toHaveTextContent(
          toFrenchFormat(
            DateTime.fromISO(session.session.dateHeureDebut),
            DATETIME_LONG
          )
        )
        expect(getByDescriptionTerm('Fin :')).toHaveTextContent(
          toFrenchFormat(
            DateTime.fromISO(session.session.dateHeureFin),
            DATETIME_LONG
          )
        )
        expect(
          getByDescriptionTerm('Date limite d’inscription :')
        ).toHaveTextContent(
          toFrenchFormat(
            DateTime.fromISO(session.session.dateMaxInscription!),
            DATETIME_LONG
          )
        )
        expect(getByDescriptionTerm('Animateur :')).toHaveTextContent(
          session.session.animateur!
        )
        expect(getByDescriptionTerm('Lieu :')).toHaveTextContent(
          session.session.lieu
        )
        expect(getByDescriptionTerm('Commentaire :')).toHaveTextContent(
          session.session.commentaire!
        )
      })
    })
  })

  describe('server side', () => {
    beforeEach(() => {
      ;(getDetailsSession as jest.Mock).mockResolvedValue(uneSession())
    })

    describe('Quand le conseiller est Pole emploi', () => {
      let actual: GetServerSidePropsResult<any>

      it('renvoie une 404', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { structure: 'POLE_EMPLOI' },
          },
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
        expect(getDetailsSession).not.toHaveBeenCalled()
        expect(actual).toEqual({ notFound: true })
      })
    })

    describe('Quand le conseiller est Milo', () => {
      let actual: GetServerSidePropsResult<any>

      it('recupère le détail de la session', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: {
            user: { structure: 'MILO', id: 'id-conseiller' },
            accessToken: 'accessToken',
          },
          validSession: true,
        })

        // When
        actual = await getServerSideProps({
          req: { headers: {} },
          query: { session_id: 'id-session' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(getDetailsSession).toHaveBeenCalledWith(
          'id-conseiller',
          'id-session',
          'accessToken'
        )
      })

      it('prépare la page', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { structure: 'MILO' },
          },
        })

        const session = uneSession()

        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: {},
        } as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            pageTitle: 'Détail de la session i-milo',
            returnTo: '/mes-jeunes',
            session: session,
            withoutChat: true,
          },
        })
      })
    })
  })
})
