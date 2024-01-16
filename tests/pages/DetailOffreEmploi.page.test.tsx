import { act, screen, within } from '@testing-library/react'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unDetailOffreEmploi } from 'fixtures/offre'
import { DetailOffreEmploi } from 'interfaces/offre'
import DetailOffre, {
  getServerSideProps,
} from 'pages/offres/[offre_type]/[offre_id]'
import { getOffreEmploiServerSide } from 'services/offres-emploi.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/offres-emploi.service')
jest.mock('components/PageActionsPortal')

describe('Page Détail Offre Emploi', () => {
  describe('client side', () => {
    let offre: DetailOffreEmploi

    beforeEach(async () => {
      // Given
      offre = unDetailOffreEmploi()

      // When
      await act(() => {
        renderWithContexts(
          <DetailOffre offre={offre} pageTitle={'Détail de l’offre'} />
        )
      })
    })

    it("permet de partager l'offre", () => {
      // Then
      expect(
        screen.getByRole('link', { name: `Partager offre ${offre.titre}` })
      ).toHaveAttribute('href', `/offres/emploi/${offre.id}/partage`)
    })

    it("affiche la date d'actualisation de l'offre", () => {
      // Then
      expect(
        screen.getByText('Actualisée le vendredi 30 septembre')
      ).toBeInTheDocument()
    })

    it('affiche le titre de l’offre', () => {
      // Then
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: offre.titre,
        })
      ).toBeInTheDocument()
    })

    it("affiche les informations principales de l'offre", () => {
      const section = screen.getByRole('region', {
        name: "Informations de l'offre",
      })
      expect(
        within(section).getByRole('heading', { level: 3 })
      ).toHaveAccessibleName("Informations de l'offre")

      expect(getByDescriptionTerm('Entreprise', section)).toHaveTextContent(
        offre.nomEntreprise!
      )
      expect(getByDescriptionTerm('Localisation', section)).toHaveTextContent(
        offre.localisation!
      )
      expect(
        getByDescriptionTerm('Type de contrat', section)
      ).toHaveTextContent(offre.typeContratLibelle)
      expect(getByDescriptionTerm('Salaire', section)).toHaveTextContent(
        offre.salaire!
      )
      expect(getByDescriptionTerm('Horaires', section)).toHaveTextContent(
        offre.horaires!
      )
    })

    it("affiche le détail de l'offre", () => {
      const section = screen.getByRole('region', { name: 'Détail de l’offre' })
      expect(section).toBeInTheDocument()
      expect(
        within(section).getByRole('heading', { level: 3 })
      ).toHaveAccessibleName('Détail de l’offre')

      expect(getByDescriptionTerm('Description', section)).toHaveTextContent(
        offre.description!
      )
      expect(
        within(getByDescriptionTerm('Lien offre', section)).getByRole('link', {
          name: "Voir l'offre détaillée (nouvelle fenêtre)",
        })
      ).toHaveAttribute('href', offre.urlPostulation)
    })

    it('affiche le profil souhaité', () => {
      const section = screen.getByRole('region', { name: 'Profil souhaité' })
      expect(section).toBeInTheDocument()
      expect(
        within(section).getByRole('heading', { level: 3 })
      ).toHaveAccessibleName('Profil souhaité')

      expect(getByDescriptionTerm('Expériences', section)).toHaveTextContent(
        offre.experience!.libelle!
      )
      expect(getByDescriptionTerm('Expériences', section)).toContainElement(
        screen.getByLabelText('Expérience exigée')
      )
      expect(
        getByDescriptionTerm('Savoir et savoir faire', section)
      ).toHaveTextContent(offre.competences.join(''))
      expect(
        getByDescriptionTerm('Savoir être professionnel', section)
      ).toHaveTextContent(offre.competencesProfessionnelles.join(''))
      expect(getByDescriptionTerm('Formation', section)).toHaveTextContent(
        offre.formations.join('')
      )
      expect(getByDescriptionTerm('Langue', section)).toHaveTextContent(
        offre.langues.join('')
      )
      expect(getByDescriptionTerm('Permis', section)).toHaveTextContent(
        offre.permis.join('')
      )
    })

    it("affiche les informations de l'entreprise", () => {
      const section = screen.getByRole('region', {
        name: "Informations de l' Entreprise",
      })
      expect(section).toBeInTheDocument()
      expect(
        within(section).getByRole('heading', { level: 3 })
      ).toHaveAccessibleName("Informations de l' Entreprise")

      expect(
        within(getByDescriptionTerm('Lien site', section)).getByRole('link', {
          name: "Site de l'entreprise (nouvelle fenêtre)",
        })
      ).toHaveAttribute('href', offre.infoEntreprise!.lien)
      expect(() =>
        getByDescriptionTerm('Entreprise adaptée', section)
      ).toThrow()
      expect(
        getByDescriptionTerm('Entreprise handi-bienveillante', section)
      ).toHaveTextContent('OUI')
      expect(
        getByDescriptionTerm("Détail de l'entreprise", section)
      ).toHaveTextContent(offre.infoEntreprise!.detail!)
    })
  })

  describe('server side', () => {
    const detailOffreEmploi = unDetailOffreEmploi()
    beforeEach(() => {
      ;(getOffreEmploiServerSide as jest.Mock).mockResolvedValue(
        detailOffreEmploi
      )
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: {
          accessToken: 'accessToken',
        },
      })
    })

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

    it('charge la page avec les détails de l’offre', async () => {
      // When
      const actual = await getServerSideProps({
        query: { offre_type: 'emploi', offre_id: 'id-offre' },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(getOffreEmploiServerSide).toHaveBeenCalledWith(
        'id-offre',
        'accessToken'
      )
      expect(actual).toEqual({
        props: {
          offre: detailOffreEmploi,
          pageTitle: `Détail de l’offre n° ${detailOffreEmploi.id} - Recherche d\'offres`,
          pageHeader: 'Offre d’emploi',
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
  })
})
