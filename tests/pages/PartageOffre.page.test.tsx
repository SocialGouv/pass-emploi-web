import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import { desItemsJeunes } from 'fixtures/jeune'
import {
  unDetailImmersion,
  unDetailOffreEmploi,
  unDetailServiceCivique,
} from 'fixtures/offre'
import { BaseJeune } from 'interfaces/jeune'
import {
  DetailImmersion,
  DetailOffre,
  DetailOffreEmploi,
  DetailServiceCivique,
  TypeOffre,
} from 'interfaces/offre'
import PartageOffre, {
  getServerSideProps,
} from 'pages/offres/[offre_type]/[offre_id]/partage'
import { AlerteParam } from 'referentiel/alerteParam'
import { getImmersionServerSide } from 'services/immersions.service'
import { getJeunesDuConseillerServerSide } from 'services/jeunes.service'
import { partagerOffre } from 'services/messages.service'
import { getOffreEmploiServerSide } from 'services/offres-emploi.service'
import { getServiceCiviqueServerSide } from 'services/services-civiques.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/offres-emploi.service')
jest.mock('services/services-civiques.service')
jest.mock('services/immersions.service')
jest.mock('services/jeunes.service')
jest.mock('services/messages.service')

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
      let offreEmploi: DetailOffreEmploi
      let serviceCivique: DetailServiceCivique
      let immersion: DetailImmersion

      beforeEach(() => {
        // Given
        offreEmploi = unDetailOffreEmploi()
        serviceCivique = unDetailServiceCivique()
        immersion = unDetailImmersion()
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: 'id-conseiller' },
            accessToken: 'accessToken',
          },
        })
        ;(getOffreEmploiServerSide as jest.Mock).mockResolvedValue(offreEmploi)
        ;(getServiceCiviqueServerSide as jest.Mock).mockResolvedValue(
          serviceCivique
        )
        ;(getImmersionServerSide as jest.Mock).mockResolvedValue(immersion)
        ;(getJeunesDuConseillerServerSide as jest.Mock).mockResolvedValue(
          desItemsJeunes()
        )
      })

      it('charge la page avec les détails de l’offre d’emploi', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: { referer: 'referer-url' } },
          query: { offre_type: 'emploi', offre_id: 'offre-id' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(getOffreEmploiServerSide).toHaveBeenCalledWith(
          'offre-id',
          'accessToken'
        )
        expect(actual).toEqual({
          props: {
            offre: offreEmploi,
            pageTitle: 'Recherche d’offres - Partager offre',
            pageHeader: 'Partager une offre',
            returnTo: 'referer-url',
            withoutChat: true,
          },
        })
      })

      it('charge la page avec les détails du service civique', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: { referer: 'referer-url' } },
          query: { offre_type: 'service-civique', offre_id: 'offre-id' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(getServiceCiviqueServerSide).toHaveBeenCalledWith(
          'offre-id',
          'accessToken'
        )
        expect(actual).toEqual({
          props: {
            offre: serviceCivique,
            pageTitle: 'Recherche d’offres - Partager offre',
            pageHeader: 'Partager une offre',
            returnTo: 'referer-url',
            withoutChat: true,
          },
        })
      })

      it("charge la page avec les détails de l'immersion", async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: { referer: 'referer-url' } },
          query: { offre_type: 'immersion', offre_id: 'offre-id' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(getImmersionServerSide).toHaveBeenCalledWith(
          'offre-id',
          'accessToken'
        )
        expect(actual).toEqual({
          props: {
            offre: immersion,
            pageTitle: 'Recherche d’offres - Partager offre',
            pageHeader: 'Partager une offre',
            returnTo: 'referer-url',
            withoutChat: true,
          },
        })
      })

      it("renvoie une 404 si l'offre n'existe pas", async () => {
        // Given
        ;(getOffreEmploiServerSide as jest.Mock).mockResolvedValue(undefined)

        // When
        const actual = await getServerSideProps({
          query: { offre_type: 'emploi', offre_id: 'offre-id' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({ notFound: true })
      })

      it('ignore le referer si besoin', async () => {
        // When
        const actual = await getServerSideProps({
          req: {
            headers: {
              referer:
                'http://localhost:3000/?redirectUrl=%2Foffres%2Femploi%2Foffre-id%2Fpartage',
            },
          },
          query: { offre_type: 'emploi', offre_id: 'offre-id' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: {
            returnTo: '/recherche-offres',
          },
        })
      })
    })
  })

  describe('client side', () => {
    describe('spécifique', () => {
      it("affiche les informations de l’offre d'emploi", () => {
        // Given
        const offre = unDetailOffreEmploi()
        renderWithContexts(
          <PartageOffre
            offre={offre}
            withoutChat={true}
            pageTitle=''
            returnTo='/return/to'
          />
        )

        // Then
        const offreCard = screen.getByRole('heading', {
          name: 'Offre n°' + offre.id,
        }).parentElement!
        expect(within(offreCard).getByText('Emploi')).toBeInTheDocument()
        expect(within(offreCard).getByText(offre.titre)).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.typeContrat)
        ).toBeInTheDocument()
        expect(within(offreCard).getByText(offre.duree!)).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.nomEntreprise!)
        ).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.localisation!)
        ).toBeInTheDocument()
      })

      it("affiche les informations de l’offre d'alternance", () => {
        // Given
        const offre = unDetailOffreEmploi({ type: TypeOffre.ALTERNANCE })
        renderWithContexts(
          <PartageOffre
            offre={offre}
            withoutChat={true}
            pageTitle=''
            returnTo='/return/to'
          />
        )

        // Then
        const offreCard = screen.getByRole('heading', {
          name: 'Offre n°' + offre.id,
        }).parentElement!
        expect(within(offreCard).getByText('Alternance')).toBeInTheDocument()
        expect(within(offreCard).getByText(offre.titre)).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.typeContrat)
        ).toBeInTheDocument()
        expect(within(offreCard).getByText(offre.duree!)).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.nomEntreprise!)
        ).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.localisation!)
        ).toBeInTheDocument()
      })

      it('affiche les informations du service civique', () => {
        // Given
        const offre = unDetailServiceCivique()
        renderWithContexts(
          <PartageOffre
            offre={offre}
            withoutChat={true}
            pageTitle=''
            returnTo='/return/to'
          />
        )

        // Then
        const offreCard = screen.getByRole('heading', { name: offre.titre })
          .parentElement!
        expect(within(offreCard).getByText(offre.domaine)).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.organisation!)
        ).toBeInTheDocument()
        expect(within(offreCard).getByText(offre.ville!)).toBeInTheDocument()
        expect(
          within(offreCard).getByText('Dès le 17 février 2022')
        ).toBeInTheDocument()
      })

      it("affiche les informations de l'immersion", () => {
        // Given
        const offre = unDetailImmersion()
        renderWithContexts(
          <PartageOffre
            offre={offre}
            withoutChat={true}
            pageTitle=''
            returnTo='/return/to'
          />
        )

        // Then
        const offreCard = screen.getByRole('heading', { name: offre.titre })
          .parentElement!
        expect(
          within(offreCard).getByText(offre.nomEtablissement)
        ).toBeInTheDocument()
        expect(within(offreCard).getByText(offre.ville)).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.secteurActivite)
        ).toBeInTheDocument()
      })
    })

    describe('commun', () => {
      let offre: DetailOffre
      let jeunes: BaseJeune[]

      let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
      let push: Function
      beforeEach(() => {
        alerteSetter = jest.fn()
        push = jest.fn(async () => {})
        ;(useRouter as jest.Mock).mockReturnValue({ push })

        offre = unDetailOffreEmploi()
        jeunes = desItemsJeunes()
        ;(partagerOffre as jest.Mock).mockResolvedValue({})

        renderWithContexts(
          <PartageOffre
            offre={offre}
            withoutChat={true}
            pageTitle=''
            returnTo='/return/to'
          />,
          {
            customAlerte: { alerteSetter },
          }
        )
      })

      it('contient une liste pour choisir un ou plusieurs jeune', () => {
        // Given
        const etape = screen.getByRole('group', {
          name: 'Étape 1 Bénéficiaires',
        })

        // Then
        const selectJeune = within(etape).getByRole('combobox', {
          name: /Bénéficiaires/,
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

      it('contient un bouton d’envoi et d’annulation', () => {
        // Then
        expect(screen.getByRole('button', { name: 'Envoyer' })).toHaveAttribute(
          'type',
          'submit'
        )
        expect(screen.getByRole('link', { name: 'Annuler' })).toHaveAttribute(
          'href',
          '/return/to'
        )
      })

      describe('formulaire rempli', () => {
        let inputMessage: HTMLTextAreaElement
        let buttonValider: HTMLButtonElement
        let message: string
        beforeEach(async () => {
          // Given

          const selectJeune = screen.getByRole('combobox', {
            name: /Bénéficiaires/,
          })
          inputMessage = screen.getByRole('textbox', { name: /Message/ })
          buttonValider = screen.getByRole('button', { name: 'Envoyer' })

          message = "Regarde cette offre qui pourrait t'intéresser."
          await userEvent.type(selectJeune, 'Jirac Kenji')
          await userEvent.type(selectJeune, "D'Aböville-Muñoz François Maria")
          await userEvent.type(inputMessage, message)
        })

        describe('quand le formulaire est valide', () => {
          it("partage l'offre", async () => {
            // When
            await userEvent.click(buttonValider)

            // Then
            expect(partagerOffre).toHaveBeenCalledWith({
              offre,
              idsDestinataires: [jeunes[2].id, jeunes[0].id],
              cleChiffrement: 'cleChiffrement',
              message,
            })
          })

          it('partage une offre avec un message par défaut', async () => {
            // Given
            await userEvent.clear(inputMessage)

            // When
            await userEvent.click(buttonValider)

            // Then
            expect(partagerOffre).toHaveBeenCalledWith({
              offre,
              idsDestinataires: [jeunes[2].id, jeunes[0].id],
              cleChiffrement: 'cleChiffrement',
              message:
                'Bonjour, je vous partage une offre d’emploi qui pourrait vous intéresser.',
            })
          })

          it('renvoie à la recherche', async () => {
            // When
            await userEvent.click(buttonValider)

            // Then
            expect(alerteSetter).toHaveBeenCalledWith('partageOffre')
            expect(push).toHaveBeenCalledWith('/return/to')
          })
        })

        it("est désactivé quand aucun jeune n'est sélectionné", async () => {
          // Given
          const enleverJeunes: HTMLButtonElement[] = screen.getAllByRole(
            'button',
            { name: /Enlever beneficiaire/ }
          )

          // When
          for (const bouton of enleverJeunes) {
            await userEvent.click(bouton)
          }

          // Then
          expect(buttonValider).toHaveAttribute('disabled', '')
          expect(
            screen.getByText(
              "Aucun bénéficiaire n'est renseigné. Veuillez sélectionner au moins un bénéficiaire."
            )
          ).toBeInTheDocument()
        })
      })
    })
  })
})
