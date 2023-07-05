import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'

import { unDetailSession } from 'fixtures/session'
import { DetailsSession } from 'interfaces/detailsSession'
import DetailSession, {
  getServerSideProps,
} from 'pages/agenda/sessions/[session_id]'
import {
  changerVisibiliteSession,
  getDetailsSession,
} from 'services/sessions.service'
import getByDescriptionTerm from 'tests/querySelector'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'
import { DATETIME_LONG, toFrenchFormat } from 'utils/date'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/sessions.service')

describe('Détails DetailsSession', () => {
  describe('client side', () => {
    describe('contenu', () => {
      let session: DetailsSession
      beforeEach(async () => {
        // Given
        session = unDetailSession()
        // When
        await render(<DetailSession pageTitle='' session={session} />)
      })

      it('affiche un encart d’information pour la modification sur i-milo', () => {
        expect(
          screen.getByText('Pour modifier la session, rendez-vous sur i-milo.')
        ).toBeInTheDocument()
      })

      it('affiche les détails de l’offre', () => {
        // Then
        expect(screen.getByText('Informations offre')).toBeInTheDocument()
        expect(getByDescriptionTerm('Titre :')).toHaveTextContent(
          session.offre.titre
        )
        expect(getByDescriptionTerm('Type :')).toHaveTextContent(
          session.offre.type
        )
        expect(getByDescriptionTerm('Thème :')).toHaveTextContent(
          session.offre.theme
        )
        expect(getByDescriptionTerm('Description :')).toHaveTextContent(
          session.offre.description!
        )
        expect(getByDescriptionTerm('Partenaire :')).toHaveTextContent(
          session.offre.partenaire!
        )
      })

      it('affiche les détails de la session', () => {
        // Then
        expect(screen.getByText('Informations session')).toBeInTheDocument()
        expect(getByDescriptionTerm('Nom :')).toHaveTextContent(
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

    describe('permet de gérer la visibilité de la session', () => {
      let sessionVisible: DetailsSession
      let sessionInvisible: DetailsSession
      let toggleVisibiliteSession: HTMLInputElement
      beforeEach(async () => {
        // Given
        sessionVisible = unDetailSession()
        sessionInvisible = unDetailSession({
          session: {
            id: 'session-invisible-id',
            nom: 'session-invisible',
            dateHeureDebut: '2023-07-04T10:00:00.000+00:00',
            dateHeureFin: '2023-07-04T10:00:00.000+00:00',
            lieu: 'Warneton',
            estVisible: false,
          },
        })
      })

      it('affiche un switch désactivé par défaut', async () => {
        // When
        await render(<DetailSession pageTitle='' session={sessionInvisible} />)
        toggleVisibiliteSession = getToggleVisibiliteSession()

        // Then
        expect(toggleVisibiliteSession).toBeInTheDocument()
        expect(toggleVisibiliteSession).not.toBeChecked()
      })
      it('affiche un switch dont la valeur correspond à la visibilité de la session', async () => {
        // When
        await render(<DetailSession pageTitle='' session={sessionVisible} />)
        toggleVisibiliteSession = getToggleVisibiliteSession()

        // Then
        expect(toggleVisibiliteSession).toBeInTheDocument()
        expect(toggleVisibiliteSession).toBeChecked()
      })

      describe('au clic sur le switch', () => {
        it('change la visibilité', async () => {
          // Given
          ;(changerVisibiliteSession as jest.Mock).mockResolvedValue(undefined)
          await render(
            <DetailSession pageTitle='' session={sessionInvisible} />
          )
          toggleVisibiliteSession = getToggleVisibiliteSession()

          // When
          await userEvent.click(toggleVisibiliteSession)

          // Then
          expect(changerVisibiliteSession).toHaveBeenCalledWith(
            'session-invisible-id',
            true
          )
          expect(toggleVisibiliteSession).toBeChecked()
        })
      })
    })
  })

  describe('server side', () => {
    beforeEach(() => {
      ;(getDetailsSession as jest.Mock).mockResolvedValue(unDetailSession())
    })

    describe('Quand le conseiller est Pôle emploi', () => {
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

        const session = unDetailSession()

        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: {},
        } as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            pageTitle: `Détail session ${session.session.nom} - Agenda`,
            pageHeader: 'Détail de la session i-milo',
            returnTo: '/mes-jeunes',
            session: session,
            withoutChat: true,
          },
        })
      })
    })
  })
})

function getToggleVisibiliteSession() {
  return screen.getByRole<HTMLInputElement>('checkbox', {
    name: /Rendre visible la session/,
  })
}
