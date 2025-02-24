import { screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import React from 'react'

import AidePage from 'app/(connected)/(with-sidebar)/(without-chat-full-screen)/aide/AidePage'
import { unConseiller } from 'fixtures/conseiller'
import { Conseiller } from 'interfaces/conseiller'
import { structureFTCej, structureMilo } from 'interfaces/structure'
import renderWithContexts from 'tests/renderWithContexts'

describe('Aide client side', () => {
  let container: HTMLElement
  describe('conseiller Milo', () => {
    let conseiller: Conseiller
    beforeEach(async () => {
      conseiller = unConseiller({
        id: 'id-conseiller',
        structure: structureMilo,
        agence: { nom: 'Agence', id: 'id-test' },
        structureMilo: { nom: 'Agence', id: 'id-test' },
      })
      ;({ container } = await renderWithContexts(<AidePage />, {
        customConseiller: conseiller,
      }))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('affiche un lien vers le site ressources', () => {
      expect(
        screen.getByRole('link', { name: /Voir le site ressources/ })
      ).toHaveAttribute('href', 'http://perdu.com/')
    })

    it('affiche un lien vers pour nous contacter', () => {
      expect(
        screen.getByRole('link', { name: /Nous contacter/ })
      ).toHaveAttribute('href', 'http://perdu.com/assistance/')
    })

    it('affiche un lien vers pour en savoir plus sur les clubs utilisateurs', () => {
      expect(
        screen.getByRole('link', { name: /En savoir plus/ })
      ).toHaveAttribute(
        'href',
        'http://perdu.com/club-utilisateur-et-demandes-devolution/'
      )
    })

    it('affiche un lien vers pour embarquer les bénéficiaires', () => {
      expect(
        screen.getByRole('link', { name: /Voir les ressources/ })
      ).toHaveAttribute('href', 'http://perdu.com/embarquer-vos-jeunes/')
    })

    it('affiche un lien vers pour consulter le guide d’utilisation', () => {
      expect(
        screen.getByRole('link', { name: /Voir le guide/ })
      ).toHaveAttribute(
        'href',
        'http://perdu.com/ressources-documentaires/guides-dutilisation/'
      )
    })

    it('affiche un lien vers pour consulter les tutos vidéo', () => {
      expect(
        screen.getByRole('link', { name: /Voir les vidéos/ })
      ).toHaveAttribute('href', 'http://perdu.com/videos/')
    })

    it('affiche un lien vers pour consulter les FAQ', () => {
      expect(
        screen.getByRole('link', { name: /Voir les FAQ/ })
      ).toHaveAttribute('href', 'http://perdu.com/faq/')
    })

    it('affiche un wording CEJ', () => {
      expect(() => screen.getByText('pass emploi')).toThrow()
    })
  })

  describe('conseiller France Travail', () => {
    beforeEach(async () => {
      ;({ container } = await renderWithContexts(<AidePage />, {
        customConseiller: { structure: structureFTCej },
      }))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('affiche un lien vers pour nous contacter', () => {
      expect(
        screen.getByRole('link', { name: /Nous contacter/ })
      ).toHaveAttribute('href', 'http://perdu.com/formuler-une-demande/')
    })

    it('affiche un texte lié à l’aide pour la réaffectation', () => {
      expect(
        screen.getByText(
          'Vous aider dans la réaffectation de vos bénéficiaires'
        )
      ).toBeInTheDocument()
    })

    it('affiche un wording CEJ', () => {
      expect(() => screen.getByText('pass emploi')).toThrow()
    })
  })

  describe('conseiller France Travail BRSA', () => {
    beforeEach(async () => {
      ;({ container } = await renderWithContexts(<AidePage />, {
        customConseiller: { structure: 'POLE_EMPLOI_BRSA' },
      }))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('affiche un lien vers pour nous contacter', () => {
      expect(
        screen.getByRole('link', { name: /Nous contacter/ })
      ).toHaveAttribute('href', 'http://perdu.com/assistance/')
    })

    it('affiche un texte lié à l’aide pour la réaffectation', () => {
      expect(
        screen.getByText(
          'Vous aider dans la réaffectation de vos bénéficiaires'
        )
      ).toBeInTheDocument()
    })

    it('affiche un wording pass emploi', () => {
      expect(() => screen.getByText('CEJ')).toThrow()
    })
  })
})
