import { screen } from '@testing-library/dom'
import { usePathname } from 'next/navigation'
import React from 'react'

import TableauEvenementsConseiller from 'components/rdv/TableauEvenementsConseiller'
import { desEvenementsListItems } from 'fixtures/evenement'
import renderWithContexts from 'tests/renderWithContexts'

describe('<TableauRdvsConseiller>', () => {
  beforeEach(async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/mes-jeunes')
  })

  describe('Quand il y a des rendez-vous', () => {
    const listeRdv = desEvenementsListItems()
    beforeEach(async () => {
      // When
      await renderWithContexts(
        <TableauEvenementsConseiller
          evenements={listeRdv}
          labelPeriode='du dd/mm/yyyy au dd/mm/yyyy'
        />
      )
    })

    it('affiche les informations des rendez-vous', () => {
      // Then
      const rdv1 = listeRdv[0]
      expect(screen.getByText(`${rdv1.labelBeneficiaires}`)).toBeInTheDocument()
      expect(screen.getByText(rdv1.type)).toBeInTheDocument()
      expect(screen.getByText(rdv1.modality!)).toBeInTheDocument()
      expect(
        screen.getByRole('cell', {
          name: '21 octobre 2021 12 heure 0 durée 2 heure 5',
        })
      ).toBeInTheDocument()

      const rdv2 = listeRdv[1]
      expect(screen.getByText(`${rdv2.labelBeneficiaires}`)).toBeInTheDocument()
      expect(screen.getByText(rdv2.type)).toBeInTheDocument()
      expect(screen.getByText(rdv2.modality!)).toBeInTheDocument()
      expect(
        screen.getByRole('cell', {
          name: '25 octobre 2021 14 heure 0 durée 25 minutes',
        })
      ).toBeInTheDocument()
    })

    it('permet la modification des rendez-vous', () => {
      expect(
        screen.getByRole('link', {
          name: 'Consulter l’événement du 21 octobre 2021 12:00 - 2h05 Jirac Kenji Autre par téléphone créé par Vous 1 inscrit',
        })
      ).toHaveAttribute(
        'href',
        '/mes-jeunes/edition-rdv?idRdv=' + listeRdv[0].id
      )
      expect(
        screen.getByRole('link', {
          name: 'Consulter l’événement du 25 octobre 2021 14:00 - 25 min Jirac Raja Atelier En agence créé par -- 1 inscrit',
        })
      ).toHaveAttribute(
        'href',
        '/mes-jeunes/edition-rdv?idRdv=' + listeRdv[1].id
      )
    })
  })
})
