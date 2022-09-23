import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsContext } from 'next/types'

import { desItemsJeunes } from 'fixtures/jeune'
import { unDetailOffre } from 'fixtures/offre'
import {
  mockedJeunesService,
  mockedMessagesService,
  mockedOffresEmploiService,
} from 'fixtures/services'
import { BaseJeune, JeuneFromListe } from 'interfaces/jeune'
import { DetailOffreEmploi } from 'interfaces/offre-emploi'
import PartageOffre, {
  getServerSideProps,
} from 'pages/offres/[offre_id]/partage'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import { OffresEmploiService } from 'services/offres-emploi.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Page Partage Offre', () => {
  describe('server side', () => {
    it('requiert une session valide', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: false,
        redirect: { destination: 'whatever' },
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: { destination: 'whatever' } })
    })

    describe("quand l'utilisateur est connecté", () => {
      let offre: DetailOffreEmploi
      let jeunes: JeuneFromListe[]
      let offresEmploiService: OffresEmploiService
      let jeunesService: JeunesService
      beforeEach(() => {
        // Given
        offre = unDetailOffre()
        jeunes = desItemsJeunes()
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: 'id-conseiller' },
            accessToken: 'accessToken',
          },
        })
        offresEmploiService = mockedOffresEmploiService({
          getOffreEmploiServerSide: jest.fn(async () => unDetailOffre()),
        })
        jeunesService = mockedJeunesService({
          getJeunesDuConseillerServerSide: jest.fn(async () =>
            desItemsJeunes()
          ),
        })
        ;(withDependance as jest.Mock).mockImplementation(
          (dependance: string) => {
            if (dependance === 'offresEmploiService') return offresEmploiService
            if (dependance === 'jeunesService') return jeunesService
          }
        )
      })

      it('charge la page avec les détails de l’offre', async () => {
        // When
        const actual = await getServerSideProps({
          query: { offre_id: 'offre-id' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(
          offresEmploiService.getOffreEmploiServerSide
        ).toHaveBeenCalledWith('offre-id', 'accessToken')
        expect(actual).toEqual({
          props: {
            offre,
            jeunes: expect.arrayContaining([]),
            pageTitle: 'Partager une offre',
            withoutChat: true,
          },
        })
      })

      it('charge les jeunes du conseiller', async () => {
        // When
        const actual = await getServerSideProps({
          query: { offre_id: 'offre-id' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(
          jeunesService.getJeunesDuConseillerServerSide
        ).toHaveBeenCalledWith('id-conseiller', 'accessToken')
        expect(actual).toMatchObject({ props: { jeunes } })
      })

      it("renvoie une 404 si l'offre n'existe pas", async () => {
        // Given
        ;(
          offresEmploiService.getOffreEmploiServerSide as jest.Mock
        ).mockResolvedValue(undefined)

        // When
        const actual = await getServerSideProps({
          query: { offre_id: 'offre-id' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({ notFound: true })
      })
    })
  })

  describe('client side', () => {
    let offre: DetailOffreEmploi
    let jeunes: BaseJeune[]
    let messagesService: MessagesService
    beforeEach(() => {
      offre = unDetailOffre()
      jeunes = desItemsJeunes()
      messagesService = mockedMessagesService()

      renderWithContexts(
        <PartageOffre
          offre={offre}
          jeunes={jeunes}
          pageTitle=''
          withoutChat={true}
        />,
        { customDependances: { messagesService } }
      )
    })

    it('affiche les informations de l’offre', () => {
      // Then
      expect(screen.getByText(offre.titre)).toBeInTheDocument()
      expect(screen.getByText('Offre n°' + offre.id)).toBeInTheDocument()
    })

    it('contient une liste pour choisir un ou plusieurs jeune', () => {
      // Given
      const etape = screen.getByRole('group', {
        name: 'Étape 1 Bénéficiaires',
      })

      // Then
      const selectJeune = within(etape).getByRole('combobox', {
        name: 'Rechercher et ajouter des jeunes Nom et prénom',
      })
      const options = within(etape).getByRole('listbox', { hidden: true })

      expect(selectJeune).toHaveAttribute('aria-required', 'true')
      expect(selectJeune).toHaveAttribute('multiple', '')
      for (const jeune of jeunes) {
        const jeuneOption = within(options).getByRole('option', {
          name: `${jeune.nom} ${jeune.prenom}`,
          hidden: true,
        })
        expect(jeuneOption).toBeInTheDocument()
      }
    })

    it('contient un champ de saisie pour accompagner l’offre d’un message', () => {
      // Given
      const etape = screen.getByRole('group', {
        name: 'Étape 2 Écrivez votre message',
      })

      // Then
      expect(
        within(etape).getByRole('textbox', { name: /Message/ })
      ).toBeInTheDocument()
    })

    it('contient un bouton d’envoie et d’annulation', () => {
      // Then
      expect(screen.getByRole('button', { name: 'Envoyer' })).toHaveAttribute(
        'type',
        'submit'
      )
      expect(
        screen.getByRole('button', { name: 'Annuler' })
      ).toBeInTheDocument()
    })

    describe('formulaire rempli', () => {
      let inputMessage: HTMLTextAreaElement
      let message: string
      beforeEach(async () => {
        // Given
        const selectJeune = screen.getByRole('combobox', {
          name: 'Rechercher et ajouter des jeunes Nom et prénom',
        })
        inputMessage = screen.getByRole('textbox', { name: /Message/ })

        message = "Regarde cette offre qui pourrait t'intéresser."
        await userEvent.type(selectJeune, 'Jirac Kenji')
        await userEvent.type(selectJeune, "D'Aböville-Muñoz François Maria")
        await userEvent.type(inputMessage, message)
      })

      it("partage l'offre", async () => {
        // When
        await userEvent.click(screen.getByRole('button', { name: 'Envoyer' }))

        // Then
        expect(messagesService.partagerOffre).toHaveBeenCalledWith({
          offre,
          idsDestinataires: [jeunes[0].id, jeunes[2].id],
          cleChiffrement: 'cleChiffrement',
          message,
        })
      })

      it('partage une offre avec un message par défaut', async () => {
        // Given
        await userEvent.clear(inputMessage)

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Envoyer' }))

        // Then
        expect(messagesService.partagerOffre).toHaveBeenCalledWith({
          offre,
          idsDestinataires: [jeunes[0].id, jeunes[2].id],
          cleChiffrement: 'cleChiffrement',
          message:
              "Bonjour, je vous partage une offre d'emploi qui pourrait vous intéresser.",
        })
      })
    })
  })
})
