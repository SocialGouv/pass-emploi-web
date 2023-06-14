import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { uneListeDAgencesMILO } from 'fixtures/referentiel'
import { StructureConseiller } from 'interfaces/conseiller'
import { CategorieSituation, JeuneEtablissement } from 'interfaces/jeune'
import { Agence } from 'interfaces/referentiel'
import Etablissement, { getServerSideProps } from 'pages/etablissement'
import { modifierAgence } from 'services/conseiller.service'
import { rechercheJeunesDeLEtablissement } from 'services/jeunes.service'
import { getAgencesClientSide } from 'services/referentiel.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'
import { toFullDate } from 'utils/date'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/jeunes.service')
jest.mock('services/referentiel.service')
jest.mock('services/conseiller.service')
jest.mock('components/Modal')
jest.mock('components/PageActionsPortal')

describe('Etablissement', () => {
  describe('Client side', () => {
    const unJeune = (page: number): JeuneEtablissement => ({
      base: {
        id: 'id-jeune',
        nom: 'Page ' + page,
        prenom: 'Albert',
      },
      referent: {
        id: 'id-conseiller',
        nom: 'Le Calamar',
        prenom: 'Carlo',
      },
      situation: CategorieSituation.EMPLOI,
      dateDerniereActivite: '2023-03-01T14:11:38.040Z',
    })
    beforeEach(async () => {
      ;(rechercheJeunesDeLEtablissement as jest.Mock).mockImplementation(
        async (_idEtablissement, _recherche, page: number) => ({
          jeunes: [unJeune(page)],
          metadonnees: { nombrePages: 4, nombreTotal: 37 },
        })
      )
    })

    describe('Render', () => {
      beforeEach(async () => {
        renderWithContexts(<Etablissement pageTitle='' />, {
          customConseiller: {
            structure: StructureConseiller.MILO,
            agence: { nom: 'Mission Locale Aubenas', id: 'id-etablissement' },
          },
        })
      })

      it('affiche un lien vers la page de réaffectation', () => {
        // Then
        expect(
          screen.getByRole('link', {
            name: 'Réaffecter des bénéficiaires',
          })
        ).toHaveAttribute('href', '/etablissement/reaffectation')
      })

      it('affiche un champ de recherche', () => {
        // Then
        expect(
          screen.getByLabelText(
            /Rechercher un bénéficiaire par son nom ou prénom/
          )
        ).toBeInTheDocument()
        expect(
          screen.getByRole('button', {
            name: 'Rechercher',
          })
        ).toBeInTheDocument()
      })

      describe('recherche', () => {
        beforeEach(async () => {
          const inputRechercheJeune = screen.getByLabelText(
            /Rechercher un bénéficiaire par son nom ou prénom/
          )
          const buttonRechercheJeune = screen.getByRole('button', {
            name: 'Rechercher',
          })

          // When
          await userEvent.type(inputRechercheJeune, 'am')
          await userEvent.click(buttonRechercheJeune)
        })

        it('lance une recherche parmis les jeunes de la Mission Locale', async () => {
          // Then
          expect(rechercheJeunesDeLEtablissement).toHaveBeenCalledWith(
            'id-etablissement',
            'am',
            1
          )
        })

        it('affiche le resultat de la recherche dans un tableau', async () => {
          // Then
          const tableauDeJeunes = screen.getByRole('table', {
            name: 'Résultat de recherche (1)',
          })
          expect(tableauDeJeunes).toBeInTheDocument()
          expect(
            within(tableauDeJeunes).getByRole('columnheader', {
              name: 'Bénéficiaire',
            })
          ).toBeInTheDocument()
          expect(
            within(tableauDeJeunes).getByRole('columnheader', {
              name: 'Situation',
            })
          ).toBeInTheDocument()
          expect(
            within(tableauDeJeunes).getByRole('columnheader', {
              name: 'Dernière activité',
            })
          ).toBeInTheDocument()
          expect(
            within(tableauDeJeunes).getByRole('columnheader', {
              name: 'Conseiller',
            })
          ).toBeInTheDocument()
          expect(
            screen.getByRole('row', {
              name: 'Accéder à la fiche de Page 1 Albert',
            })
          ).toHaveAttribute('href', 'etablissement/beneficiaires/id-jeune')
          expect(
            within(tableauDeJeunes).getByText(`Page 1 Albert`)
          ).toBeInTheDocument()
          expect(
            within(tableauDeJeunes).getByText('Emploi')
          ).toBeInTheDocument()
          expect(
            within(tableauDeJeunes).getByText(
              toFullDate('2023-03-01T14:11:38.040Z')
            )
          ).toBeInTheDocument()
          expect(
            within(tableauDeJeunes).getByText(`Carlo Le Calamar`)
          ).toBeInTheDocument()
        })

        it('ne déclenche pas de recherche quand on vide le champ', async () => {
          // When
          await userEvent.click(
            screen.getByRole('button', { name: 'Effacer le champ de saisie' })
          )

          // Then
          expect(rechercheJeunesDeLEtablissement).toHaveBeenCalledTimes(1)
          expect(
            screen.queryByText(/Résultat de recherche/)
          ).not.toBeInTheDocument()
        })

        describe('pagination', () => {
          it('récupère la page demandée', async () => {
            // When
            await userEvent.click(
              screen.getByRole('button', { name: 'Page 3' })
            )

            // Then
            expect(rechercheJeunesDeLEtablissement).toHaveBeenCalledWith(
              'id-etablissement',
              'am',
              3
            )
            expect(screen.getByText('Page 3 Albert')).toBeInTheDocument()
          })

          it('met à jour la page courante', async () => {
            // When
            await userEvent.click(screen.getByLabelText('Page suivante'))
            await userEvent.click(screen.getByLabelText('Page suivante'))

            // Then
            expect(rechercheJeunesDeLEtablissement).toHaveBeenCalledWith(
              'id-etablissement',
              'am',
              2
            )
            expect(rechercheJeunesDeLEtablissement).toHaveBeenCalledWith(
              'id-etablissement',
              'am',
              3
            )

            expect(screen.getByLabelText(`Page 3`)).toHaveAttribute(
              'aria-current',
              'page'
            )
          })

          it('ne recharge pas la page courante', async () => {
            // When
            await userEvent.click(screen.getByLabelText(`Page 1`))

            // Then
            expect(rechercheJeunesDeLEtablissement).toHaveBeenCalledTimes(1)
          })
        })
      })

      it(`prévient qu'il n'y a pas de résultat`, async () => {
        // Given
        const inputRechercheJeune = screen.getByLabelText(
          /Rechercher un bénéficiaire par son nom ou prénom/
        )
        const buttonRechercheJeune = screen.getByRole('button', {
          name: 'Rechercher',
        })

        ;(rechercheJeunesDeLEtablissement as jest.Mock).mockResolvedValue({
          jeunes: [],
          metadonnes: { nombrePages: 0, nombreTotal: 0 },
        })

        // When
        await userEvent.type(inputRechercheJeune, 'am')
        await userEvent.click(buttonRechercheJeune)

        // Then
        expect(
          screen.getByText(
            'Aucune bénéficiaire ne correspond à votre recherche.'
          )
        ).toBeInTheDocument()
      })

      it(`prévient qu'il faut saisir au moins 2 caractères`, async () => {
        // Given
        const inputRechercheJeune = screen.getByLabelText(
          /Rechercher un bénéficiaire par son nom ou prénom/
        )
        const buttonRechercheJeune = screen.getByRole('button', {
          name: 'Rechercher',
        })

        // When
        await userEvent.type(inputRechercheJeune, 'z')
        await userEvent.click(buttonRechercheJeune)

        // Then
        expect(rechercheJeunesDeLEtablissement).toHaveBeenCalledTimes(0)
        expect(
          screen.getByText('Veuillez saisir au moins 2 caractères')
        ).toBeInTheDocument()
      })
    })

    describe('Quand le conseiller n’est pas MILO', () => {
      it('n’affiche pas la colonne Situation', async () => {
        // Given
        renderWithContexts(<Etablissement pageTitle='' />, {
          customConseiller: {
            structure: StructureConseiller.PASS_EMPLOI,
            agence: { nom: 'Mission Locale Aubenas', id: 'id-etablissement' },
          },
        })
        const inputRechercheJeune = screen.getByLabelText(
          /Rechercher un bénéficiaire par son nom ou prénom/
        )
        const buttonRechercheJeune = screen.getByRole('button', {
          name: 'Rechercher',
        })

        // When
        await userEvent.type(inputRechercheJeune, 'am')
        await userEvent.click(buttonRechercheJeune)

        // Then
        expect(
          screen.queryByRole('columnheader', { name: 'Situation' })
        ).not.toBeInTheDocument()
      })
    })

    describe('quand le conseiller n’a pas d’établissement', () => {
      let agences: Agence[]

      beforeEach(async () => {
        agences = uneListeDAgencesMILO()
        ;(getAgencesClientSide as jest.Mock).mockResolvedValue(agences)

        // When
        await act(async () => {
          await renderWithContexts(<Etablissement pageTitle='' />, {
            customConseiller: { structure: StructureConseiller.MILO },
          })
        })
      })

      it('n’affiche pas le champs de recherche', async () => {
        // Then
        expect(
          screen.queryByRole('search', {
            name: 'Rechercher un bénéficiaire par son nom ou prénom',
          })
        ).not.toBeInTheDocument()
      })

      it('demande de renseigner son agence', async () => {
        // Then
        expect(
          screen.getByText(/Votre Mission Locale n’est pas renseignée/)
        ).toBeInTheDocument()

        expect(
          screen.getByRole('button', {
            name: 'Renseigner votre Mission Locale',
          })
        ).toBeInTheDocument()
      })

      it('permet de renseigner son agence', async () => {
        // When
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Renseigner votre Mission Locale',
          })
        )

        // Then
        expect(getAgencesClientSide).toHaveBeenCalledWith(
          StructureConseiller.MILO
        )
        expect(
          screen.getByRole('combobox', { name: /votre Mission Locale/ })
        ).toBeInTheDocument()
        agences.forEach((agence) =>
          expect(
            screen.getByRole('option', { hidden: true, name: agence.nom })
          ).toBeInTheDocument()
        )
      })

      it('sauvegarde l’agence et affiche la barre de recherche', async () => {
        // Given
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Renseigner votre Mission Locale',
          })
        )
        const agence = agences[2]
        const searchAgence = screen.getByRole('combobox', {
          name: /votre Mission Locale/,
        })
        const submit = screen.getByRole('button', { name: 'Ajouter' })

        // When
        await userEvent.selectOptions(searchAgence, agence.nom)
        await userEvent.click(submit)

        // Then
        expect(modifierAgence).toHaveBeenCalledWith({
          id: agence.id,
          nom: agence.nom,
          codeDepartement: '3',
        })
        expect(() =>
          screen.getByText('Votre Mission Locale n’est pas renseignée')
        ).toThrow()

        expect(
          screen.getByRole('textbox', {
            name: 'Rechercher un bénéficiaire par son nom ou prénom',
          })
        ).toBeInTheDocument()
      })
    })
  })

  describe('Server side', () => {
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

    describe('quand le conseiller est Pole emploi', () => {
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
        expect(actual).toEqual({ notFound: true })
      })
    })

    describe('quand le conseiller est connecté', () => {
      it('prépare la page en tant que pass emploi', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { structure: 'PASS_EMPLOI' },
          },
        })
        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then

        expect(actual).toEqual({
          props: {
            pageTitle: 'Établissement',
            pageHeader: 'Rechercher un bénéficiaire de mon agence',
          },
        })
      })

      it('prépare la page en tant que MILO', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { structure: 'MILO' },
          },
        })
        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then

        expect(actual).toEqual({
          props: {
            pageTitle: 'Établissement',
            pageHeader: 'Rechercher un bénéficiaire de ma Mission Locale',
          },
        })
      })
    })
  })
})
