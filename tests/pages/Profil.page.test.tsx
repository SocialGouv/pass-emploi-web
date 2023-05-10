import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import { unConseiller } from 'fixtures/conseiller'
import { desItemsJeunes } from 'fixtures/jeune'
import { uneListeDAgencesMILO } from 'fixtures/referentiel'
import {
  mockedConseillerService,
  mockedJeunesService,
  mockedReferentielService,
} from 'fixtures/services'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import { JeuneFromListe } from 'interfaces/jeune'
import Profil, { getServerSideProps } from 'pages/profil'
import { ConseillerService } from 'services/conseiller.service'
import { JeunesService } from 'services/jeunes.service'
import { ReferentielService } from 'services/referentiel.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')
jest.mock('components/Modal')

describe('Page Profil conseiller', () => {
  describe('server side', () => {
    it('requiert la connexion', async () => {
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
      let actual: GetServerSidePropsResult<any>
      let conseillerService: ConseillerService
      let referentielService: ReferentielService

      it('en tant que Pôle Emploi charge la page avec les bonnes props', async () => {
        // Given
        const conseiller = unConseiller()
        const structure = 'POLE_EMPLOI'

        // When
        await getServerSidePropsForConseiller(conseiller, structure)

        // Then
        expect(actual).toEqual({
          props: {
            referentielAgences: [],
            pageTitle: 'Mon profil',
            pageHeader: 'Profil',
          },
        })
        expect(referentielService.getAgencesServerSide).not.toHaveBeenCalled()
      })

      it('en tant que Mission Locale avec une agence déjà renseignée charge la page avec les bonnes props sans le référentiel d’agences', async () => {
        // Given
        const conseiller = unConseiller({
          agence: { nom: 'MLS3F SAINT-LOUIS' },
        })
        const structure = 'MILO'

        // When
        await getServerSidePropsForConseiller(conseiller, structure)

        // Then
        expect(actual).toEqual({
          props: {
            referentielAgences: [],
            pageTitle: 'Mon profil',
            pageHeader: 'Profil',
          },
        })
      })

      it('en tant que Mission Locale sans agence déjà renseignée charge la page avec les bonnes props avec le référentiel d’agences', async () => {
        // Given
        const conseiller = unConseiller()
        const structure = 'MILO'

        // When
        await getServerSidePropsForConseiller(conseiller, structure)

        // Then
        expect(actual).toEqual({
          props: {
            referentielAgences: uneListeDAgencesMILO(),
            pageTitle: 'Mon profil',
            pageHeader: 'Profil',
          },
        })
      })

      async function getServerSidePropsForConseiller(
        conseiller: Conseiller,
        structure: string
      ) {
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            accessToken: 'accessToken',
            user: { id: 'id-conseiller', structure: structure },
          },
        })

        conseillerService = mockedConseillerService({
          getConseillerServerSide: jest.fn(async () => conseiller),
        })
        referentielService = mockedReferentielService({
          getAgencesServerSide: jest.fn(async () => uneListeDAgencesMILO()),
        })
        ;(withDependance as jest.Mock).mockImplementation((dependance) => {
          if (dependance === 'conseillerService') return conseillerService
          if (dependance === 'referentielService') return referentielService
        })

        actual = await getServerSideProps({} as GetServerSidePropsContext)
      }
    })
  })

  describe('client side', () => {
    let conseillerService: ConseillerService
    let jeunesService: JeunesService
    let conseiller: Conseiller
    let jeunes: JeuneFromListe[]
    let push: Function

    beforeEach(async () => {
      conseillerService = mockedConseillerService()
      process.env = Object.assign(process.env, { ENABLE_PE_BRSA_SSO: 'true' })
    })

    describe('contenu', () => {
      beforeEach(async () => {
        // Given
        conseiller = unConseiller({
          email: 'nils.tavernier@mail.com',
          agence: { nom: 'MLS3F SAINT-LOUIS' },
        })

        // When
        await act(async () => {
          renderWithContexts(<Profil referentielAgences={[]} pageTitle='' />, {
            customConseiller: conseiller,
            customDependances: { conseillerService },
          })
        })
      })

      it('affiche les informations du conseiller', () => {
        // Then
        expect(screen.getByText('Nils Tavernier')).toBeInTheDocument()
        expect(getByDescriptionTerm('Votre e-mail :')).toHaveTextContent(
          'nils.tavernier@mail.com'
        )
        expect(getByDescriptionTerm('Votre agence :')).toHaveTextContent(
          'MLS3F SAINT-LOUIS'
        )
      })

      it("contient un champ pour sélectionner l'activation des notifications", () => {
        // When
        const toggleNotifications = getToggleNotifications()

        // Then
        expect(toggleNotifications).toBeInTheDocument()
        expect(toggleNotifications.checked).toEqual(
          conseiller.notificationsSonores
        )
      })

      it('affiche les informations du mode démo', () => {
        //THEN
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Application CEJ jeune - mode démo',
          })
        ).toBeInTheDocument()
      })

      it('affiche un bouton pour supprimer le compte', () =>
        // Then
        expect(screen.getByText('Supprimer mon compte')).toBeInTheDocument())
    })

    describe('quand il manque des informations', () => {
      it("n'affiche pas les informations manquantes", async () => {
        // When
        await act(async () => {
          renderWithContexts(<Profil referentielAgences={[]} pageTitle='' />)
        })

        // Then
        expect(() =>
          screen.getByRole('term', { name: /Votre e-mail/ })
        ).toThrow()
        expect(() =>
          screen.getByRole('term', { name: /Votre agence/ })
        ).toThrow()
      })
    })

    describe('quand le conseiller est MILO', () => {
      it('n’affiche pas le bouton de suppression de compte', async () => {
        // Given
        const conseiller = unConseiller({
          structure: StructureConseiller.MILO,
        })

        // When
        await act(async () => {
          renderWithContexts(<Profil referentielAgences={[]} pageTitle='' />, {
            customConseiller: conseiller,
            customDependances: { conseillerService },
          })
        })

        // Then
        expect(() => screen.getByText('Supprimer mon compte')).toThrow()
      })

      describe('si son agence est déjà renseignée', () => {
        beforeEach(async () => {
          // Given
          const conseiller = unConseiller({
            structure: StructureConseiller.MILO,
            agence: { nom: 'MLS3F SAINT-LOUIS' },
          })

          // When
          await act(async () => {
            renderWithContexts(
              <Profil referentielAgences={[]} pageTitle='' />,
              { customConseiller: conseiller }
            )
          })
        })

        it('affiche le label correspondant', async () => {
          // Then
          expect(
            getByDescriptionTerm('Votre Mission Locale :')
          ).toHaveTextContent('MLS3F SAINT-LOUIS')
        })

        it('affiche un lien vers le support pour changer d’agence', async () => {
          // Then
          expect(
            screen.getByRole('link', {
              name: /contacter le support/,
            })
          ).toHaveAttribute('href', 'mailto:support@pass-emploi.beta.gouv.fr')
        })
      })

      describe('si son agence n’est pas encore renseignée', () => {
        const agences = uneListeDAgencesMILO()
        beforeEach(async () => {
          // Given
          const conseiller = unConseiller({
            structure: StructureConseiller.MILO,
          })

          // When
          await act(async () => {
            renderWithContexts(
              <Profil referentielAgences={agences} pageTitle='' />,
              {
                customConseiller: conseiller,
                customDependances: { conseillerService },
              }
            )
          })
        })

        it('contient un input pour choisir un département', () => {
          // Then
          expect(
            screen.getByRole('textbox', { name: /Département/ })
          ).toBeInTheDocument()
        })

        it('contient un input pour choisir une Mission Locale', () => {
          // Then
          expect(
            screen.getByRole('combobox', {
              name: /Recherchez votre Mission Locale/,
            })
          ).toBeInTheDocument()
          agences.forEach((agence) =>
            expect(
              screen.getByRole('option', { hidden: true, name: agence.nom })
            ).toBeInTheDocument()
          )
        })

        it('filtre les Missions locales selon le département entré', async () => {
          // Given
          const codeDepartement = '1'
          const departementInput = screen.getByRole('textbox', {
            name: /Département/,
          })

          // When
          await userEvent.type(departementInput, codeDepartement)

          // Then
          agences
            .filter((agence) => agence.codeDepartement === codeDepartement)
            .forEach((agence) =>
              expect(
                screen.getByRole('option', { hidden: true, name: agence.nom })
              ).toBeInTheDocument()
            )

          agences
            .filter((agence) => agence.codeDepartement !== codeDepartement)
            .forEach((agence) =>
              expect(
                screen.queryByRole('option', { hidden: true, name: agence.nom })
              ).not.toBeInTheDocument()
            )
        })

        it('supprime les préfixes 0 dans l’application du filtre selon le département entré', async () => {
          // Given
          const codeDepartement = '01'
          const departementInput = screen.getByRole('textbox', {
            name: /Département/,
          })

          // When
          await userEvent.type(departementInput, codeDepartement)

          // Then
          expect(
            screen.getByRole('option', {
              hidden: true,
              name: 'MLS3F SAINT-LOUIS',
            })
          ).toBeInTheDocument()
        })

        it('contient une option pour dire que la Mission Locale n’est pas dans la liste', () => {
          // Then
          expect(
            screen.getByRole('option', {
              hidden: true,
              name: 'Ma Mission Locale n’apparaît pas dans la liste',
            })
          ).toBeInTheDocument()
        })

        it('affiche un lien vers le support quand la Mission Locale n’est pas dans la liste', async () => {
          // Given
          const missionLocaleInput = screen.getByRole('combobox', {
            name: /Recherchez votre Mission Locale/,
          })

          // When
          await userEvent.selectOptions(
            missionLocaleInput,
            'Ma Mission Locale n’apparaît pas dans la liste'
          )

          // Then
          expect(
            screen.getByText(/vous devez contacter le support/)
          ).toBeInTheDocument()
          expect(
            screen.getByRole('link', { name: 'Contacter le support' })
          ).toHaveAttribute('href', 'mailto:support@pass-emploi.beta.gouv.fr')
        })

        it("modifie le conseiller avec l'agence choisie", async () => {
          // Given
          const departementInput = screen.getByRole('textbox', {
            name: /Département/,
          })
          await userEvent.type(departementInput, '1')
          const missionLocaleInput = screen.getByRole('combobox', {
            name: /Recherchez votre Mission Locale/,
          })
          await userEvent.selectOptions(missionLocaleInput, 'MLS3F SAINT-LOUIS')

          // When
          const submit = screen.getByRole('button', { name: 'Ajouter' })
          await userEvent.click(submit)

          // Then
          expect(conseillerService.modifierAgence).toHaveBeenCalledWith({
            id: '443',
            nom: 'MLS3F SAINT-LOUIS',
            codeDepartement: '1',
          })
        })

        it("ne fait rien si l'agence n'est pas renseignée", async () => {
          // Given
          const submit = screen.getByRole('button', { name: 'Ajouter' })

          // When
          await userEvent.click(submit)

          // Then
          expect(conseillerService.modifierAgence).not.toHaveBeenCalled()
        })
      })
    })

    describe('quand le conseiller est PE BRSA', () => {
      it('affiche les informations du mode démo pour BRSA', async () => {
        // Given
        conseiller = unConseiller({
          structure: StructureConseiller.POLE_EMPLOI_BRSA,
          email: 'pe-brsa@pole-emploi.fr',
        })

        // When
        await act(async () => {
          renderWithContexts(<Profil referentielAgences={[]} pageTitle='' />, {
            customConseiller: conseiller,
          })
        })
        //THEN
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Application pass emploi - mode démo',
          })
        ).toBeInTheDocument()
      })
    })

    describe('Supprimer un compte', () => {
      describe('en tant que PE sans bénéficiaires', () => {
        beforeEach(async () => {
          // Given
          jeunesService = mockedJeunesService({
            getJeunesDuConseillerClientSide: jest.fn(async () => []),
          })
          push = jest.fn(() => Promise.resolve())
          ;(useRouter as jest.Mock).mockReturnValue({ push })

          conseiller = unConseiller({
            email: 'conseiller@pole-emploi.fr',
            structure: StructureConseiller.POLE_EMPLOI_BRSA,
          })

          // When
          await act(async () => {
            renderWithContexts(
              <Profil referentielAgences={[]} pageTitle='' />,
              {
                customConseiller: conseiller,
                customDependances: { jeunesService, conseillerService },
              }
            )
          })

          const supprimerConseillerButton = screen.getByRole('button', {
            name: 'Supprimer mon compte',
          })

          await userEvent.click(supprimerConseillerButton)
        })

        it('affiche une modale avec les bonnes informations', async () => {
          // Then
          expect(
            screen.getByText(/Attention, cette opération/)
          ).toBeInTheDocument()
          expect(
            screen.getByRole('button', { name: 'Confirmer' })
          ).toBeInTheDocument()
        })

        it('lors de la confirmation, supprime le conseiller et redirige vers la page de connexion', async () => {
          // Given
          const confirmerSuppressionButton = screen.getByRole('button', {
            name: 'Confirmer',
          })

          // When
          await userEvent.click(confirmerSuppressionButton)
          await act(() => new Promise((r) => setTimeout(r, 500)))

          // Then
          expect(
            screen.getByText('Vous allez être redirigé dans quelques secondes')
          ).toBeInTheDocument()
          expect(conseillerService.supprimerConseiller).toHaveBeenCalledWith(
            conseiller.id
          )
          await act(() => new Promise((r) => setTimeout(r, 3000)))

          expect(push).toHaveBeenCalledWith('/api/auth/federated-logout')
        })
      })

      describe('en tant que PE avec bénéficiaires', () => {
        it('affiche une modale avec les bonnes informations', async () => {
          // Given
          jeunes = desItemsJeunes()
          jeunesService = mockedJeunesService({
            getJeunesDuConseillerClientSide: jest.fn(async () => jeunes),
          })

          // When
          await act(async () => {
            renderWithContexts(
              <Profil referentielAgences={[]} pageTitle='' />,
              {
                customConseiller: conseiller,
                customDependances: { jeunesService, conseillerService },
              }
            )
          })

          const supprimerConseillerButton = screen.getByRole('button', {
            name: 'Supprimer mon compte',
          })
          await userEvent.click(supprimerConseillerButton)
          // Then
          expect(screen.getByText('Retour')).toBeInTheDocument()
          expect(
            screen.getByText(
              /Afin de procéder à la suppression de votre compte, votre portefeuille doit avoir été transféré./
            )
          ).toBeInTheDocument()
          expect(() => screen.getByText('Confirmer')).toThrow()
        })
      })
    })

    describe('quand on change le paramétrage des notifications', () => {
      beforeEach(async () => {
        // Given
        const conseiller = unConseiller({
          notificationsSonores: false,
        })

        await act(async () => {
          renderWithContexts(<Profil referentielAgences={[]} pageTitle='' />, {
            customConseiller: conseiller,
            customDependances: { conseillerService },
          })
        })

        const toggleNotifications = getToggleNotifications()

        // When
        await userEvent.click(toggleNotifications)
      })

      it('met à jour côté API', async () => {
        // Then
        expect(
          conseillerService.modifierNotificationsSonores
        ).toHaveBeenCalledWith(conseiller.id, !conseiller.notificationsSonores)
      })
    })
  })
})

function getToggleNotifications() {
  return screen.getByRole<HTMLInputElement>('checkbox', {
    name: /notifications sonores/,
  })
}
