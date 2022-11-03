import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'

import { unConseiller } from 'fixtures/conseiller'
import { uneListeDAgencesMILO } from 'fixtures/referentiel'
import {
  mockedConseillerService,
  mockedReferentielService,
} from 'fixtures/services'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import Profil, { getServerSideProps } from 'pages/profil'
import { ConseillerService } from 'services/conseiller.service'
import { ReferentielService } from 'services/referentiel.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

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

      it('en tant que Mission locale avec une agence déjà renseignée charge la page avec les bonnes props sans le referetiel d’agences', async () => {
        // Given
        const conseiller = unConseiller({ agence: 'MLS3F SAINT-LOUIS' })
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

      it('en tant que Mission locale sans agence déjà renseignée charge la page avec les bonnes props avec le referetiel d’agences', async () => {
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
    let conseiller: Conseiller

    beforeEach(() => {
      conseillerService = mockedConseillerService()
    })
    describe('contenu', () => {
      beforeEach(async () => {
        // Given
        conseiller = unConseiller({
          email: 'nils.tavernier@mail.com',
          agence: 'MLS3F SAINT-LOUIS',
        })

        // When
        await act(async () => {
          renderWithContexts(<Profil referentielAgences={[]} pageTitle='' />, {
            customConseiller: conseiller,
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
      describe('si son agence est déjà renseignée', () => {
        beforeEach(async () => {
          // Given
          const conseiller = unConseiller({
            structure: StructureConseiller.MILO,
            agence: 'MLS3F SAINT-LOUIS',
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
            getByDescriptionTerm('Votre Mission locale :')
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

      describe('si son agence est n’est pas encore renseignée', () => {
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

        it('contient un input pour choisir une Mission locale', () => {
          // Then
          expect(
            screen.getByRole('combobox', {
              name: /Recherchez votre Mission locale/,
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

        it('contient une option pour dire que la Mission locale n’est pas dans la liste', () => {
          // Then
          expect(
            screen.getByRole('option', {
              hidden: true,
              name: 'Ma mission locale n’apparaît pas dans la liste',
            })
          ).toBeInTheDocument()
        })

        it('affiche un lien vers le support quand la Mission locale n’est pas dans la liste', async () => {
          // Given
          const missionLocaleInput = screen.getByRole('combobox', {
            name: /Recherchez votre Mission locale/,
          })

          // When
          await userEvent.selectOptions(
            missionLocaleInput,
            'Ma mission locale n’apparaît pas dans la liste'
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
            name: /Recherchez votre Mission locale/,
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
