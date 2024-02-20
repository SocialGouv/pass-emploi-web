import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import {
  typesAnimationCollective,
  typesEvenement,
  uneAnimationCollective,
  unEvenement,
} from 'fixtures/evenement'
import { desItemsJeunes, uneBaseJeune } from 'fixtures/jeune'
import { StructureConseiller } from 'interfaces/conseiller'
import { StatutAnimationCollective } from 'interfaces/evenement'
import { BaseJeune, getNomJeuneComplet, JeuneFromListe } from 'interfaces/jeune'
import { TypeEvenementReferentiel } from 'interfaces/referentiel'
import EditionRdv, { getServerSideProps } from 'pages/mes-jeunes/edition-rdv'
import { AlerteParam } from 'referentiel/alerteParam'
import {
  creerEvenement,
  getDetailsEvenement,
  getTypesRendezVous,
  supprimerEvenement,
} from 'services/evenements.service'
import {
  getJeunesDeLEtablissementClientSide,
  getJeunesDuConseillerServerSide,
} from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/jeunes.service')
jest.mock('services/evenements.service')
jest.mock('components/Modal')
jest.mock('components/PageActionsPortal')

describe('EditionAnimationCollective', () => {
  describe('server side', () => {
    let jeunes: JeuneFromListe[]
    let typesRendezVous: TypeEvenementReferentiel[]

    describe("quand l'utilisateur n'est pas connecté", () => {
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
    })

    describe("quand l'utilisateur est connecté", () => {
      beforeEach(() => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: 'id-conseiller' },
            accessToken: 'accessToken',
          },
        })

        jeunes = desItemsJeunes()
        typesRendezVous = typesEvenement()
        ;(getJeunesDuConseillerServerSide as jest.Mock).mockResolvedValue(
          jeunes
        )
        ;(getTypesRendezVous as jest.Mock).mockResolvedValue(typesRendezVous)
      })

      it('prépare la page', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: { referer: '/agenda?onglet=etablissement' } },
          query: { type: 'ac' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            withoutChat: true,
            conseillerEstObservateur: false,
            lectureSeule: false,
            pageTitle: 'Créer une animation collective',
            pageHeader: 'Créer une animation collective',
            returnTo: '/agenda?onglet=etablissement',
            typesRendezVous: expect.arrayContaining([]),
            evenementTypeAC: true,
          },
        })
      })

      it('récupère le référentiel des types d’événements de catégorie AC', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: { referer: '/agenda?onglet=etablissement' } },
          query: { type: 'ac' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(getTypesRendezVous).toHaveBeenCalledWith('accessToken')
        expect(actual).toMatchObject({
          props: { typesRendezVous: typesAnimationCollective() },
        })
      })

      it("récupère la page d'origine", async () => {
        // When
        const actual = await getServerSideProps({
          req: {
            headers: {
              referer: '/agenda?onglet=etablissement',
            },
          },
          query: {},
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: { returnTo: '/agenda?onglet=etablissement' },
        })
      })

      it('récupère le jeune concerné', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: { idJeune: 'id-jeune' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: { idJeune: 'id-jeune' },
        })
      })

      it('récupère l’animation collective concernée', async () => {
        // Given
        const animationCollective = unEvenement({
          type: { code: 'ATELIER', label: 'Atelier' },
          jeunes: [{ id: 'id-autre-jeune', prenom: 'Sheldon', nom: 'Cooper' }],
        })
        ;(getDetailsEvenement as jest.Mock).mockResolvedValue(
          animationCollective
        )

        // When
        const actual = await getServerSideProps({
          req: { headers: { referer: '/agenda?onglet=etablissement' } },
          query: { idRdv: 'id-rdv', type: 'ac' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(getDetailsEvenement).toHaveBeenCalledWith(
          'id-rdv',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: {
            evenement: animationCollective,
            pageTitle: `Modifier le rendez-vous ${animationCollective.titre}`,
            pageHeader: 'Détail de l’animation collective',
            evenementTypeAC: true,
          },
        })
      })

      it('récupère le referer s’il y en a un', async () => {
        // Given
        ;(getDetailsEvenement as jest.Mock).mockResolvedValue(
          uneAnimationCollective()
        )

        // When
        const actual = await getServerSideProps({
          req: {
            headers: { referer: '/agenda?onglet=conseiller&periodeIndex=-1' },
          },
          query: { redirectUrl: 'redirectUrl' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: {
            returnTo: '/agenda?onglet=conseiller&periodeIndex=-1',
          },
        })
      })

      it("renvoie une 404 si l’animation collective n'existe pas", async () => {
        // Given
        ;(getDetailsEvenement as jest.Mock).mockResolvedValue(undefined)

        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: { idRdv: 'id-rdv' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({ notFound: true })
      })
    })

    describe('quand l’utilisateur est France Travail', () => {
      it('renvoie sur la liste des jeunes', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: {
              id: 'id-conseiller',
              structure: StructureConseiller.POLE_EMPLOI,
            },
            accessToken: 'accessToken',
          },
        })

        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: {},
        } as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          redirect: { destination: '/mes-jeunes', permanent: false },
        })
      })
    })
  })

  describe('client side', () => {
    let jeunesConseiller: JeuneFromListe[]
    let jeunesAutreConseiller: BaseJeune[]
    let jeunesEtablissement: BaseJeune[]

    let typesRendezVous: TypeEvenementReferentiel[]

    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
    let push: Function
    beforeEach(() => {
      jeunesConseiller = desItemsJeunes()
      jeunesAutreConseiller = [
        uneBaseJeune({
          id: 'jeune-etablissement-1',
          prenom: 'Jeune Etablissement 1',
        }),
        uneBaseJeune({
          id: 'jeune-etablissement-2',
          prenom: 'Jeune Etablissement 2',
        }),
      ]
      jeunesEtablissement = [
        ...jeunesConseiller.map(({ id, nom, prenom }) => ({ id, nom, prenom })),
        ...jeunesAutreConseiller,
      ]
      ;(supprimerEvenement as jest.Mock).mockResolvedValue(undefined)
      ;(creerEvenement as jest.Mock).mockResolvedValue(
        '963afb47-2b15-46a9-8c0c-0e95240b2eb5'
      )
      ;(getJeunesDeLEtablissementClientSide as jest.Mock).mockResolvedValue(
        jeunesEtablissement
      )
      typesRendezVous = typesAnimationCollective()

      alerteSetter = jest.fn()
      push = jest.fn(() => Promise.resolve())
      ;(useRouter as jest.Mock).mockReturnValue({ push })
    })

    describe('quand on veut créer une animation collective', () => {
      beforeEach(async () => {
        // Given
        typesRendezVous = typesAnimationCollective()
        await act(async () => {
          renderWithContexts(
            <EditionRdv
              typesRendezVous={typesRendezVous}
              withoutChat={true}
              returnTo='/agenda?onglet=etablissement'
              pageTitle=''
              evenementTypeAC={true}
              lectureSeule={false}
              conseillerEstObservateur={false}
            />,
            {
              customConseiller: {
                agence: {
                  nom: 'Mission Locale Aubenas',
                  id: 'id-etablissement',
                },
              },
            }
          )
        })
      })

      it('récupère les bénéficiaires de l’établissement', async () => {
        // Then
        expect(getJeunesDeLEtablissementClientSide).toHaveBeenCalledWith(
          'id-etablissement'
        )
        jeunesEtablissement.forEach((jeune) =>
          expect(
            screen.getByRole('option', {
              name: getNomJeuneComplet(jeune),
              hidden: true,
            })
          ).toBeInTheDocument()
        )
      })

      it('le titre est obligatoire', async () => {
        // Given
        const inputTitre = screen.getByRole('textbox', { name: /Titre/ })

        // When
        expect(inputTitre).toHaveAttribute('required', '')
        await userEvent.click(inputTitre)
        await userEvent.tab()

        // Then
        expect(
          screen.getByText('Le champ “Titre” est vide. Renseignez un titre.')
        ).toBeInTheDocument()
      })

      it('les bénéficiaires sont facultatifs', async () => {
        // Given
        const selectType = screen.getByRole('combobox', {
          name: /Type/,
        })
        const inputDate = screen.getByLabelText('* Date format : jj/mm/aaaa')
        const inputHoraire = screen.getByLabelText('* Heure format : hh:mm')
        const inputDuree = screen.getByLabelText('* Durée format : hh:mm')
        const inputTitre = screen.getByLabelText('* Titre')
        await userEvent.selectOptions(selectType, 'Atelier')
        await userEvent.type(inputDate, '2022-03-03')
        await userEvent.type(inputHoraire, '10:30')
        await userEvent.type(inputDuree, '02:37')
        await userEvent.type(inputTitre, 'Titre de l’événement')

        // When
        const buttonValider = screen.getByRole('button', {
          name: 'Créer l’animation collective',
        })
        await userEvent.click(buttonValider)

        // Then
        const selectJeunes = screen.getByRole('combobox', {
          name: /Bénéficiaires/,
        })
        expect(selectJeunes).toHaveAttribute('aria-required', 'false')
        expect(creerEvenement).toHaveBeenCalledWith(
          expect.objectContaining({
            jeunesIds: [],
          })
        )
      })

      it("contient un message pour prévenir qu'il y a des jeunes qui ne sont pas au conseiller", async () => {
        // Given
        await userEvent.type(
          screen.getByLabelText(
            /Recherchez et ajoutez un ou plusieurs bénéficiaires/
          ),
          getNomJeuneComplet(jeunesAutreConseiller[0])
        )

        // Then
        expect(
          screen.getByText(/des bénéficiaires que vous ne suivez pas/)
        ).toBeInTheDocument()
        expect(
          screen.getByLabelText(
            'Ce bénéficiaire n’est pas dans votre portefeuille'
          )
        ).toBeInTheDocument()
      })
    })

    describe('Cloture', () => {
      describe("quand il n'y a pas de statut", () => {
        it("n'affiche pas le lien Clore", async () => {
          // Given
          const evenement = unEvenement()
          delete evenement.statut

          // When
          await act(async () => {
            renderWithContexts(
              <EditionRdv
                typesRendezVous={typesRendezVous}
                withoutChat={true}
                returnTo='/agenda'
                evenement={evenement}
                pageTitle=''
                evenementTypeAC={true}
                lectureSeule={false}
                conseillerEstObservateur={false}
              />
            )
          })

          // Then
          const cloreButton = screen.queryByRole('link', {
            name: 'Clore',
          })
          expect(cloreButton).not.toBeInTheDocument()
        })
      })

      describe('quand l’animation collection est à venir', () => {
        it("n'affiche pas le lien Clore", async () => {
          // Given
          const evenement = unEvenement({
            statut: StatutAnimationCollective.AVenir,
          })

          // When
          await act(async () => {
            renderWithContexts(
              <EditionRdv
                typesRendezVous={typesRendezVous}
                withoutChat={true}
                returnTo='/agenda'
                evenement={evenement}
                pageTitle=''
                evenementTypeAC={true}
                lectureSeule={false}
                conseillerEstObservateur={false}
              />
            )
          })

          // Then
          const cloreButton = screen.queryByRole('link', {
            name: 'Clore',
          })
          expect(cloreButton).not.toBeInTheDocument()
        })
      })

      describe('quand l’animation est passée et non close', () => {
        it('affiche un lien pour la clore', async () => {
          // Given
          const evenement = unEvenement({
            statut: StatutAnimationCollective.AClore,
          })

          // When
          await act(async () => {
            renderWithContexts(
              <EditionRdv
                typesRendezVous={typesRendezVous}
                withoutChat={true}
                returnTo='https://localhost:3000/agenda'
                evenement={evenement}
                pageTitle=''
                evenementTypeAC={true}
                lectureSeule={false}
                conseillerEstObservateur={false}
              />
            )
          })

          // Then
          const cloreButton = screen.getByRole('link', {
            name: 'Clore',
          })
          expect(cloreButton).toHaveAttribute(
            'href',
            `/evenements/${evenement.id}/cloture?redirectUrl=https%3A%2F%2Flocalhost%3A3000%2Fagenda%3Fonglet%3Detablissement`
          )
        })
      })
    })

    describe('quand on consulte une animation collective close', () => {
      let jeuneAbsent: BaseJeune & { futPresent: boolean }
      let jeunePresent: BaseJeune & { futPresent: boolean }

      beforeEach(async () => {
        jeuneAbsent = {
          id: jeunesConseiller[0].id,
          prenom: jeunesConseiller[0].prenom,
          nom: jeunesConseiller[0].nom,
          futPresent: false,
        }
        jeunePresent = {
          id: jeunesConseiller[1].id,
          prenom: jeunesConseiller[1].prenom,
          nom: jeunesConseiller[1].nom,
          futPresent: true,
        }
        const evenement = unEvenement({
          jeunes: [jeuneAbsent, jeunePresent],
          type: { code: 'ATELIER', label: 'Atelier' },
          statut: StatutAnimationCollective.Close,
        })

        await act(async () => {
          renderWithContexts(
            <EditionRdv
              typesRendezVous={typesRendezVous}
              withoutChat={true}
              returnTo='/agenda'
              evenement={evenement}
              pageTitle=''
              evenementTypeAC={true}
              lectureSeule={true}
              conseillerEstObservateur={true}
            />,
            {
              customConseiller: {
                agence: {
                  nom: 'Mission Locale Aubenas',
                  id: 'id-etablissement',
                },
              },
            }
          )
        })
      })

      it('ne récupère pas les autres bénéficiaires de l’établissement', async () => {
        // Then
        expect(getJeunesDeLEtablissementClientSide).toHaveBeenCalledTimes(0)
      })

      it('empêche toute modification', () => {
        // Then
        expect(screen.getByLabelText(/Titre/)).toBeDisabled()
        expect(screen.getByLabelText(/Commentaire/)).toBeDisabled()
        expect(screen.getByLabelText('Modalité')).toBeDisabled()
        expect(screen.getByLabelText(/Date/)).toBeDisabled()
        expect(screen.getByLabelText(/Heure/)).toBeDisabled()
        expect(screen.getByLabelText(/Durée/)).toBeDisabled()
        expect(screen.getByLabelText(/Adresse/)).toBeDisabled()
        expect(screen.getByLabelText(/Organisme/)).toBeDisabled()
        expect(screen.getByLabelText(/conseiller sera présent/)).toBeDisabled()
        expect(
          screen.getByLabelText(
            /Recherchez et ajoutez un ou plusieurs bénéficiaires/
          )
        ).toBeDisabled()
        expect(
          screen.queryByText(/bénéficiaires est facultatif/)
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /Enlever jeune/ })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /Supprimer/ })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /Annuler/ })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /Modifier/ })
        ).not.toBeInTheDocument()
      })

      it('indique les bénéficiaires qui étaient présents', () => {
        // Then
        expect(
          within(
            screen.getByText(getNomJeuneComplet(jeunePresent))
          ).getByLabelText(/Ce bénéficiaire était présent à l’événement/)
        ).toBeInTheDocument()
        expect(
          within(
            screen.getByText(getNomJeuneComplet(jeuneAbsent))
          ).queryByLabelText(/Ce bénéficiaire était présent à l’événement/)
        ).not.toBeInTheDocument()
      })
    })
  })
})
