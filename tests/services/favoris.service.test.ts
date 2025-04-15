import { DateTime } from 'luxon'

import { apiGet } from 'clients/api.client'
import { uneListeDOffres, uneListeDOffresJson } from 'fixtures/favoris'
import { getOffres } from 'services/favoris.service'

jest.mock('clients/api.client')

describe('FavorisApiService', () => {
  describe('.getOffres', () => {
    it('renvoie les offres du jeune', async () => {
      // Given
      const periode = {
        debut: DateTime.fromISO('2025-04-07'),
        fin: DateTime.fromISO('2025-04-13'),
        label: 'Semaine du 7 au 13 avril 2025',
      }
      const idBeneficiaire = 'id-beneficiaire'
      const expectedURL = `/jeunes/${idBeneficiaire}/favoris?dateDebut=${encodeURIComponent(periode.debut.toISO())}&dateFin=${encodeURIComponent(periode.fin.toISO())}`

      ;(apiGet as jest.Mock).mockImplementation((url: string) => {
        if (url === expectedURL) return { content: uneListeDOffresJson() }
      })

      // When
      const actual = await getOffres(idBeneficiaire, periode)

      // Then
      expect(actual).toStrictEqual(uneListeDOffres())
    })
  })
})
