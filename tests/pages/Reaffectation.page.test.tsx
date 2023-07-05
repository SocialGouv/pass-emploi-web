import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unConseiller } from 'fixtures/conseiller'
import { desItemsJeunes } from 'fixtures/jeune'
import { BaseConseiller, StructureConseiller } from 'interfaces/conseiller'
import { JeuneFromListe } from 'interfaces/jeune'
import Reaffectation, { getServerSideProps } from 'pages/reaffectation'
import {
  getConseillerByEmail,
  getConseillerServerSide,
  getConseillersEtablissementServerSide,
} from 'services/conseiller.service'
import {
  getJeunesDuConseillerParEmail,
  getJeunesDuConseillerParId,
  reaffecter,
} from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/jeunes.service')
jest.mock('services/conseiller.service')
jest.mock('components/Modal')

describe('Reaffectation', () => {
  const conseillersEtablissement = [
    unConseiller({
      id: 'id-albert-durant',
      firstName: 'Albert',
      lastName: 'Durant',
      agence: { nom: 'agence-dijon', id: 'id-agence' },
      email: 'adurant@milo.com',
      aDesBeneficiairesARecuperer: true,
      structure: StructureConseiller.MILO,
    }),
    unConseiller({
      id: 'id-claude-dupont',
      firstName: 'Claude',
      lastName: 'Dupont',
      agence: { nom: 'agence-dijon', id: 'id-agence' },
      aDesBeneficiairesARecuperer: true,
      structure: StructureConseiller.MILO,
    }),
  ]

  describe('client side', () => {
    let jeunes: JeuneFromListe[]
    let conseillerParEmail: BaseConseiller
    beforeEach(async () => {
      // Given
      jeunes = desItemsJeunes()
      conseillerParEmail = {
        id: 'id-conseiller-mail',
        firstName: 'Nils',
        lastName: 'Tavernier',
      }
      ;(getConseillerByEmail as jest.Mock).mockResolvedValue(conseillerParEmail)
      ;(getJeunesDuConseillerParId as jest.Mock).mockResolvedValue(jeunes)
      ;(getJeunesDuConseillerParEmail as jest.Mock).mockResolvedValue({
        conseiller: conseillerParEmail,
        jeunes,
      })

      // When
      await act(() => {
        renderWithContexts(
          <Reaffectation
            conseillersEtablissement={conseillersEtablissement}
            withoutChat={true}
            pageTitle=''
          />
        )
      })
    })

    describe('Étape 1 : type réaffectation', () => {
      it('contient un champ pour sélectionner le type de réaffectation', () => {
        // When
        const etape = screen.getByRole('group', {
          name: 'Étape 1 Choisissez un type de réaffectation',
        })
        // Then
        expect(
          within(etape).getByRole('radio', { name: 'Définitive' })
        ).toBeInTheDocument()
        expect(
          within(etape).getByRole('radio', { name: 'Temporaire' })
        ).toBeInTheDocument()
      })
    })

    describe('Étape 2 : conseiller initial', () => {
      let etape: HTMLFieldSetElement
      beforeEach(async () => {
        etape = screen.getByRole('group', {
          name: 'Étape 2 Recherchez les bénéficiaires d’un conseiller',
        })
      })

      it("affiche un champ de recherche d'un conseiller initial", async () => {
        // THEN
        expect(
          within(etape).getByRole('combobox', {
            name: 'Nom et prénom ou e-mail conseiller initial',
          })
        ).toBeInTheDocument()
        expect(
          within(etape).getByRole('option', {
            hidden: true,
            name: 'Albert Durant (adurant@milo.com)',
          })
        ).toBeInTheDocument()
        expect(
          within(etape).getByRole('option', {
            hidden: true,
            name: 'Claude Dupont',
          })
        ).toBeInTheDocument()
      })

      it("affiche un bouton pour rechercher les jeunes d'un conseiller", async () => {
        // THEN
        expect(
          within(etape).getByRole('button', {
            name: 'Afficher la liste des bénéficiaires',
          })
        ).toBeInTheDocument()
      })

      it('affiche une aide à la recherche', async () => {
        // When
        await userEvent.click(
          within(etape).getByRole('button', {
            name: /Le conseiller n’apparaît pas dans la liste déroulante/,
          })
        )

        // Then
        expect(
          screen.getByText(
            /Vous ne trouvez pas le nom d’une conseillère ou d’un conseiller dans la liste/
          )
        ).toBeInTheDocument()
      })

      describe('quand on recherche un conseiller de l’établissement', () => {
        it('récupère les jeunes du conseiller', async () => {
          // GIVEN
          const nomConseillerInitial = 'Albert Durant (adurant@milo.com)'
          const idConseillerInitial = 'id-albert-durant'
          const conseillerInitialInput =
            screen.getByLabelText(/conseiller initial/)
          const submitRecherche = screen.getByLabelText(
            'Afficher la liste des bénéficiaires'
          )
          await userEvent.type(conseillerInitialInput, nomConseillerInitial)

          // WHEN
          await userEvent.click(submitRecherche)

          // THEN
          expect(getJeunesDuConseillerParId).toHaveBeenCalledWith(
            idConseillerInitial
          )
          for (const jeune of jeunes) {
            expect(
              screen.getByText(`${jeune.nom} ${jeune.prenom}`)
            ).toBeInTheDocument()
          }
        })
      })

      describe('quand on recherche un conseiller par son mail', () => {
        it('récupère les jeunes du conseiller', async () => {
          // GIVEN
          const conseillerInitialInput =
            screen.getByLabelText(/conseiller initial/)
          const submitRecherche = screen.getByLabelText(
            'Afficher la liste des bénéficiaires'
          )

          await userEvent.type(conseillerInitialInput, 'conseiller@mail.com')

          // WHEN
          await userEvent.click(submitRecherche)

          // THEN
          expect(getJeunesDuConseillerParEmail).toHaveBeenCalledWith(
            'conseiller@mail.com'
          )
          for (const jeune of jeunes) {
            expect(
              screen.getByText(`${jeune.nom} ${jeune.prenom}`)
            ).toBeInTheDocument()
          }
        })
      })
    })

    describe('Étape 3 : bénéficiaires', () => {
      let etape: HTMLFieldSetElement
      beforeEach(async () => {
        // GIVEN
        const conseillerInitialInput =
          screen.getByLabelText(/conseiller initial/)
        const submitRecherche = screen.getByLabelText(
          'Afficher la liste des bénéficiaires'
        )
        await userEvent.type(
          conseillerInitialInput,
          'Albert Durant (adurant@milo.com)'
        )
        await userEvent.click(submitRecherche)

        etape = screen.getByRole('group', {
          name: 'Étape 3 Sélectionnez les bénéficiaires à réaffecter',
        })
      })

      it('affiche les jeunes du conseiller', async () => {
        // THEN
        const liste = within(etape).getByRole('list')

        expect(liste).toBeInTheDocument()
        for (const jeune of jeunes) {
          expect(
            within(liste).getByRole('checkbox', {
              name: `${jeune.nom} ${jeune.prenom}`,
            })
          ).toBeInTheDocument()
        }
      })

      it('selectionne tous les jeunes au clic sur la checkbox', async () => {
        // When
        await userEvent.click(
          within(etape).getByRole('checkbox', {
            name: 'Tout sélectionner',
          })
        )

        // Then
        expect(
          within(etape).getByRole('checkbox', {
            name: 'Tout sélectionner',
          })
        ).toBeChecked()
        for (const jeune of jeunes) {
          expect(
            within(etape).getByRole('checkbox', {
              name: `${jeune.nom} ${jeune.prenom}`,
            })
          ).toBeChecked()
        }

        // When
        await userEvent.click(
          within(etape).getByRole('checkbox', {
            name: 'Tout sélectionner',
          })
        )

        // Then
        expect(
          within(etape).getByRole('checkbox', {
            name: 'Tout sélectionner',
          })
        ).not.toBeChecked()
        for (const jeune of jeunes) {
          expect(
            within(etape).getByRole('checkbox', {
              name: `${jeune.nom} ${jeune.prenom}`,
            })
          ).not.toBeChecked()
        }
      })
    })

    describe('Étape 4 : conseiller destinataire et réaffectation', () => {
      let conseillerInitialInput: HTMLElement
      let getCheckboxJeune: () => HTMLElement
      let getEtape: () => HTMLFieldSetElement
      let getConseillerDestinataireInput: () => HTMLElement
      beforeEach(async () => {
        // GIVEN
        conseillerInitialInput = screen.getByRole('combobox', {
          name: /conseiller initial/,
        })
        getCheckboxJeune = () =>
          screen.getByRole('checkbox', {
            name: new RegExp(jeunes[1].nom),
          })

        getEtape = () =>
          screen.getByRole('group', {
            name: 'Étape 4 Renseignez le conseiller de destination',
          })
        getConseillerDestinataireInput = () =>
          within(getEtape()).getByRole('combobox', {
            name: /conseiller de destination/,
          })

        await userEvent.click(screen.getByRole('radio', { name: 'Définitive' }))
      })

      it("affiche un champ de recherche d'un conseiller de destination", async () => {
        // Given
        await userEvent.type(
          conseillerInitialInput,
          'Albert Durant (adurant@milo.com)'
        )
        await userEvent.click(
          screen.getByLabelText('Afficher la liste des bénéficiaires')
        )

        // Then
        expect(getConseillerDestinataireInput()).toBeInTheDocument()
        expect(
          within(getEtape()).getByRole('option', {
            hidden: true,
            name: 'Albert Durant (adurant@milo.com)',
          })
        ).toBeInTheDocument()
        expect(
          within(getEtape()).getByRole('option', {
            hidden: true,
            name: 'Claude Dupont',
          })
        ).toBeInTheDocument()
      })

      it('affiche une aide à la recherche', async () => {
        // Given
        await userEvent.type(
          conseillerInitialInput,
          'Albert Durant (adurant@milo.com)'
        )
        await userEvent.click(
          screen.getByLabelText('Afficher la liste des bénéficiaires')
        )

        // When
        await userEvent.click(
          within(getEtape()).getByRole('button', {
            name: /Le conseiller n’apparaît pas dans la liste déroulante/,
          })
        )

        // Then
        expect(
          screen.getByText(
            /Vous ne trouvez pas le nom d’une conseillère ou d’un conseiller dans la liste/
          )
        ).toBeInTheDocument()
      })

      describe('conseiller initial établissement / conseiller destinataire établissement', () => {
        it('réaffecte les jeunes', async () => {
          // GIVEN
          await userEvent.type(
            conseillerInitialInput,
            'Albert Durant (adurant@milo.com)'
          )
          await userEvent.click(
            screen.getByLabelText('Afficher la liste des bénéficiaires')
          )
          await userEvent.click(getCheckboxJeune())
          await userEvent.type(
            getConseillerDestinataireInput(),
            'Claude Dupont'
          )

          // WHEN
          await userEvent.click(
            screen.getByRole('button', { name: 'Réaffecter les bénéficiaires' })
          )

          // THEN
          expect(reaffecter).toHaveBeenCalledWith(
            'id-albert-durant',
            'id-claude-dupont',
            ['jeune-2'],
            false
          )
        })
      })

      describe('conseiller initial mail / conseiller destinataire établissement', () => {
        it('réaffecte les jeunes', async () => {
          // GIVEN
          await userEvent.type(conseillerInitialInput, 'conseiller@mail.com')
          await userEvent.click(
            screen.getByLabelText('Afficher la liste des bénéficiaires')
          )
          await userEvent.click(getCheckboxJeune())
          await userEvent.type(
            getConseillerDestinataireInput(),
            'Claude Dupont'
          )

          // WHEN
          await userEvent.click(
            screen.getByRole('button', { name: 'Réaffecter les bénéficiaires' })
          )

          // THEN
          expect(reaffecter).toHaveBeenCalledWith(
            'id-conseiller-mail',
            'id-claude-dupont',
            ['jeune-2'],
            false
          )
        })
      })

      describe('conseiller initial établissement / conseiller destinataire mail', () => {
        it('réaffecte les jeunes', async () => {
          // GIVEN
          await userEvent.type(
            conseillerInitialInput,
            'Albert Durant (adurant@milo.com)'
          )
          await userEvent.click(
            screen.getByLabelText('Afficher la liste des bénéficiaires')
          )
          await userEvent.click(getCheckboxJeune())
          await userEvent.type(
            getConseillerDestinataireInput(),
            'conseiller@mail.com'
          )

          // WHEN
          await userEvent.click(
            screen.getByRole('button', { name: 'Réaffecter les bénéficiaires' })
          )

          // THEN
          expect(reaffecter).toHaveBeenCalledWith(
            'id-albert-durant',
            'id-conseiller-mail',
            ['jeune-2'],
            false
          )
        })
      })
    })

    describe('quand on modifie la recherche du conseiller initial', () => {
      it('reset le reste du formulaire', async () => {
        // GIVEN
        const conseillerInitialInput = screen.getByRole('combobox', {
          name: /conseiller initial/,
        })
        await userEvent.type(
          conseillerInitialInput,
          'Albert Durant (adurant@milo.com)'
        )
        await userEvent.click(
          screen.getByLabelText('Afficher la liste des bénéficiaires')
        )

        // WHEN
        await userEvent.type(conseillerInitialInput, 'whatever')

        // THEN
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
        expect(
          screen.queryByRole('combobox', { name: /conseiller de destination/ })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /réaffecter/ })
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('server side', () => {
    describe("quand le conseiller n'est pas superviseur", () => {
      it('renvoie une page 404', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          session: { user: { estSuperviseur: false } },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
        expect(actual).toEqual({ notFound: true })
      })
    })

    describe('quand le conseiller est superviseur', () => {
      it('prépare la page', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { estSuperviseur: true },
          },
        })
        ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
          conseillersEtablissement[0]
        )
        ;(getConseillersEtablissementServerSide as jest.Mock).mockResolvedValue(
          conseillersEtablissement
        )

        // When
        const actual = await getServerSideProps({
          req: { headers: { referer: '/etablissement' } },
        } as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            pageTitle: 'Réaffectation',
            returnTo: '/etablissement',
            withoutChat: true,
            conseillersEtablissement,
          },
        })
      })
    })
  })
})
