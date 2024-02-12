import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import { unConseiller } from 'fixtures/conseiller'
import {
  uneListeDAgencesMILO,
  uneListeDAgencesPoleEmploi,
} from 'fixtures/referentiel'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import { Agence } from 'interfaces/referentiel'
import Home, { getServerSideProps } from 'pages/index'
import { AlerteParam } from 'referentiel/alerteParam'
import {
  getConseillerServerSide,
  modifierAgence,
} from 'services/conseiller.service'
import { getAgencesServerSide } from 'services/referentiel.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/conseiller.service')
jest.mock('services/referentiel.service')
jest.mock('components/Modal')

describe('Home', () => {
  describe('client side', () => {
    describe('quand le conseiller doit renseigner sa structure', () => {
      let replace: jest.Mock

      beforeEach(() => {
        // Given
        replace = jest.fn(() => Promise.resolve())
        ;(useRouter as jest.Mock).mockReturnValue({ replace })

        // When
        renderWithContexts(
          <Home
            afficherModaleAgence={true}
            afficherModaleEmail={false}
            redirectUrl='/mes-jeunes'
            pageTitle=''
          />,
          {
            customConseiller: { structure: StructureConseiller.MILO },
          }
        )
      })

      it('contient un message pour demander la structure du conseiller', () => {
        // Then
        expect(
          screen.getByText(/vous devez renseigner votre structure/)
        ).toBeInTheDocument()
      })

      it('affiche un lien pour contacter le support', async () => {
        // Then
        expect(
          screen.getByRole('link', {
            name: 'Contacter le support (nouvelle fenêtre)',
          })
        ).toHaveAttribute('href', 'mailto:support@pass-emploi.beta.gouv.fr')
      })

      it('affiche un lien vers i-milo', async () => {
        // Then
        expect(
          screen.getByRole('link', {
            name: 'Accéder à i-milo (nouvelle fenêtre)',
          })
        ).toHaveAttribute('href', 'https://portail.i-milo.fr/')
      })
    })

    describe('quand le conseiller doit renseigner son adresse email', () => {
      let replace: jest.Mock

      beforeEach(() => {
        // Given
        replace = jest.fn(() => Promise.resolve())
        ;(useRouter as jest.Mock).mockReturnValue({ replace })

        // When
        renderWithContexts(
          <Home
            afficherModaleAgence={false}
            afficherModaleEmail={true}
            redirectUrl='/mes-jeunes'
            pageTitle=''
          />,
          {
            customConseiller: { structure: StructureConseiller.MILO },
          }
        )
      })

      it('contient un message pour demander l’adresse email du conseiller', () => {
        // Then
        expect(
          screen.getByText(/Votre adresse email n’est pas renseignée/)
        ).toBeInTheDocument()
      })

      it('affiche un lien vers i-milo', async () => {
        // Then
        expect(
          screen.getByRole('link', {
            name: 'Accéder à i-milo (nouvelle fenêtre)',
          })
        ).toHaveAttribute(
          'href',
          'https://admin.i-milo.fr/moncompte/coordonnees/'
        )
      })
    })

    describe('quand le conseiller n’est pas Mission Locale', () => {
      let agences: Agence[]
      let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
      let replace: jest.Mock

      beforeEach(() => {
        // Given
        alerteSetter = jest.fn()
        replace = jest.fn(() => Promise.resolve())
        ;(useRouter as jest.Mock).mockReturnValue({ replace })
        agences = uneListeDAgencesPoleEmploi()

        // When
        renderWithContexts(
          <Home
            afficherModaleAgence={true}
            afficherModaleEmail={false}
            referentielAgences={agences}
            redirectUrl='/mes-jeunes'
            pageTitle=''
          />,
          {
            customConseiller: { structure: StructureConseiller.POLE_EMPLOI },
            customAlerte: { alerteSetter },
          }
        )
      })

      it("contient un message pour demander l'agence du conseiller", () => {
        // Then
        expect(
          screen.getByText(/La liste des agences a été mise à jour/)
        ).toBeInTheDocument()
        expect(
          screen.getByText(/Une fois votre agence renseignée/)
        ).toBeInTheDocument()
      })

      it('contient un input pour choisir une agence', () => {
        // Then
        expect(
          screen.getByRole('combobox', { name: /votre agence/ })
        ).toBeInTheDocument()
        agences.forEach((agence) =>
          expect(
            screen.getByRole('option', { hidden: true, name: agence.nom })
          ).toBeInTheDocument()
        )
      })

      it("contient un bouton pour dire que l'agence n'est pas dans liste", () => {
        // Then
        expect(
          screen.getByRole('checkbox', { name: /Mon agence n’apparaît pas/ })
        ).toBeInTheDocument()
        expect(() =>
          screen.getByRole('textbox', { name: /Saisir le nom/ })
        ).toThrow()
      })

      it('contient un bouton pour annuler', async () => {
        // Given
        const annuler = screen.getByRole('button', { name: 'Annuler' })

        // When
        await userEvent.click(annuler)

        // Then
        expect(replace).toHaveBeenCalledWith('/mes-jeunes')
      })

      it("modifie le conseiller avec l'agence choisie", async () => {
        // Given
        const agence = agences[2]
        const searchAgence = screen.getByRole('combobox', {
          name: /votre agence/,
        })
        const submit = screen.getByRole('button', { name: 'Ajouter' })

        // When
        await userEvent.type(searchAgence, agence.nom)
        await userEvent.click(submit)

        // Then
        expect(modifierAgence).toHaveBeenCalledWith({
          id: agence.id,
          nom: 'Agence Pôle emploi THIERS',
          codeDepartement: '3',
        })
        expect(alerteSetter).toHaveBeenCalledWith('choixAgence')
        expect(replace).toHaveBeenCalledWith('/mes-jeunes')
      })

      it("prévient si l'agence n'est pas renseignée", async () => {
        // Given
        const searchAgence = screen.getByRole('combobox', {
          name: /votre agence/,
        })
        const submit = screen.getByRole('button', { name: 'Ajouter' })

        // When
        await userEvent.type(searchAgence, 'pouet')
        await userEvent.click(submit)

        // Then
        expect(
          screen.getByText('Sélectionner une agence dans la liste')
        ).toBeInTheDocument()
        expect(modifierAgence).not.toHaveBeenCalled()
        expect(replace).not.toHaveBeenCalled()
      })

      describe("quand l'agence n'est pas dans la liste", () => {
        let searchAgence: HTMLInputElement
        let agenceLibre: HTMLInputElement
        beforeEach(async () => {
          // Given
          searchAgence = screen.getByRole('combobox', {
            name: /Rechercher/,
          })
          await userEvent.type(searchAgence, 'pouet')

          const checkAgenceNonTrouvee = screen.getByRole('checkbox', {
            name: /n’apparaît pas/,
          })
          await userEvent.click(checkAgenceNonTrouvee)

          agenceLibre = screen.getByRole('textbox', {
            name: /Saisir le nom de votre agence/,
          })
        })

        it('permet de renseigner une agence libre', async () => {
          // When
          await userEvent.type(agenceLibre, 'Agence libre')
          const submit = screen.getByRole('button', { name: 'Ajouter' })
          await userEvent.click(submit)

          // Then
          expect(modifierAgence).toHaveBeenCalledWith({
            nom: 'Agence libre',
          })
        })

        it('bloque la sélection dans la liste', () => {
          // Then
          expect(searchAgence.value).toEqual('')
          expect(searchAgence).toHaveAttribute('disabled', '')
        })

        it("prévient si l'agence n'est pas renseignée", async () => {
          // When
          const submit = screen.getByRole('button', { name: 'Ajouter' })
          await userEvent.click(submit)

          // Then
          expect(screen.getByText('Saisir une agence')).toBeInTheDocument()
          expect(modifierAgence).toHaveBeenCalledTimes(0)
        })
      })
    })

    describe('quand le conseiller est Mission Locale', () => {
      let agences: Agence[]
      let replace: jest.Mock

      beforeEach(() => {
        // Given
        replace = jest.fn(() => Promise.resolve())
        ;(useRouter as jest.Mock).mockReturnValue({ replace })
        agences = uneListeDAgencesMILO()

        // When
        renderWithContexts(
          <Home
            afficherModaleAgence={true}
            afficherModaleEmail={false}
            referentielAgences={agences}
            redirectUrl='/mes-jeunes'
            pageTitle=''
          />,
          {
            customConseiller: { structure: StructureConseiller.MILO },
          }
        )
      })

      it('contient un message pour demander la Mission Locale du conseiller', () => {
        // Then
        expect(
          screen.getByText(/Une fois votre Mission Locale renseignée/)
        ).toBeInTheDocument()
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

      it('filtre les Missions Locales selon le département entré', async () => {
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
          screen.getByRole('link', {
            name: 'Contacter le support (nouvelle fenêtre)',
          })
        ).toHaveAttribute('href', 'mailto:support@pass-emploi.beta.gouv.fr')
      })

      it('contient un bouton pour annuler', async () => {
        // Given
        const annuler = screen.getByRole('button', { name: 'Annuler' })

        // When
        await userEvent.click(annuler)

        // Then
        expect(replace).toHaveBeenCalledWith('/mes-jeunes')
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
        expect(modifierAgence).toHaveBeenCalledWith({
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
        expect(modifierAgence).not.toHaveBeenCalled()
        expect(replace).not.toHaveBeenCalled()
      })
    })
  })

  describe('server side', () => {
    it('nécessite une session valide', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: false,
        redirect: 'whatever',
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: 'whatever' })
    })

    describe('si le conseiller a renseigné son agence', () => {
      beforeEach(() => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: '1' },
            accessToken: 'accessToken',
          },
        })

        const conseillerAvecAgence: Conseiller = unConseiller({
          agence: { nom: 'MLS3F SAINT-LOUIS', id: 'id-agence' },
        })
        ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
          conseillerAvecAgence
        )
      })

      it('redirige vers le portefeuille', async () => {
        // When
        const actual = await getServerSideProps({
          query: {},
        } as unknown as GetServerSidePropsContext)

        //Then
        expect(actual).toEqual({
          redirect: { destination: '/mes-jeunes', permanent: false },
        })
      })

      it('redirige vers l’url renseignée', async () => {
        // When
        const actual = await getServerSideProps({
          query: { redirectUrl: '/agenda' },
        } as unknown as GetServerSidePropsContext)

        //Then
        expect(actual).toEqual({
          redirect: { destination: '/agenda', permanent: false },
        })
      })
    })

    describe('si le conseiller Milo n’a pas renseigné sa structure', () => {
      beforeEach(() => {
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {},
        })

        const conseiller = unConseiller({
          structure: StructureConseiller.MILO,
          email: 'tchoupi@proton.com',
        })

        ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)
        ;(getAgencesServerSide as jest.Mock).mockResolvedValue(
          uneListeDAgencesMILO()
        )
      })

      it('renvoie les props nécessaires pour demander l’agence', async () => {
        // When
        const actual = await getServerSideProps({
          query: {},
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            afficherModaleAgence: true,
            afficherModaleEmail: false,
            redirectUrl: '/mes-jeunes',
            pageTitle: 'Accueil',
          },
        })
      })
    })

    describe('si le conseiller n’a pas renseigné son agence', () => {
      beforeEach(() => {
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {},
        })

        const conseiller = unConseiller({
          structure: StructureConseiller.POLE_EMPLOI,
        })

        ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)
        ;(getAgencesServerSide as jest.Mock).mockResolvedValue(
          uneListeDAgencesMILO()
        )
      })

      it('renvoie les props nécessaires pour demander l’agence', async () => {
        // When
        const actual = await getServerSideProps({
          query: {},
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            afficherModaleAgence: true,
            afficherModaleEmail: false,
            redirectUrl: '/mes-jeunes',
            referentielAgences: uneListeDAgencesMILO(),
            pageTitle: 'Accueil',
          },
        })
      })

      it('renvoie l’url renseignée', async () => {
        // When
        const actual = await getServerSideProps({
          query: { redirectUrl: '/agenda' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            afficherModaleAgence: true,
            afficherModaleEmail: false,
            redirectUrl: '/agenda',
            referentielAgences: uneListeDAgencesMILO(),
            pageTitle: 'Accueil',
          },
        })
      })
    })

    describe('si le conseiller n’a pas renseigné son adresse email', () => {
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: {},
      })

      const conseiller = unConseiller({
        agence: { nom: 'MLS3F SAINT-LOUIS', id: 'id-agence' },
        structureMilo: {
          nom: 'Mission Locale Aubenas',
          id: 'id-test',
        },
        structure: StructureConseiller.MILO,
        email: undefined,
      })

      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)
      ;(getAgencesServerSide as jest.Mock).mockResolvedValue(
        uneListeDAgencesMILO()
      )

      it('renvoie les props nécessaires pour demander l’adresse email', async () => {
        // When
        const actual = await getServerSideProps({
          query: {},
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            afficherModaleAgence: false,
            afficherModaleEmail: true,
            redirectUrl: '/mes-jeunes',
            pageTitle: 'Accueil',
          },
        })
      })
    })

    describe('si le conseiller doit signer la dernière version des CGU', () => {
      it('redirige vers le portefeuille', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {},
        })

        const conseiller: Conseiller = unConseiller({
          dateSignatureCGU: '1970-01-01',
        })
        ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)
        ;(getAgencesServerSide as jest.Mock).mockResolvedValue(
          uneListeDAgencesMILO()
        )

        // When
        const actual = await getServerSideProps({
          query: {},
        } as unknown as GetServerSidePropsContext)

        //Then
        expect(actual).toEqual({
          redirect: {
            destination: '/consentement-cgu',
            permanent: false,
          },
        })
      })
    })
  })
})
