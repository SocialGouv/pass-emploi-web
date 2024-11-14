import { StructureConseiller } from 'interfaces/conseiller'
import { getActualites } from 'services/actualites.service'
import { fetchJson } from 'utils/httpClient'

jest.mock('utils/httpClient')

describe('ActualitesService', () => {
  describe('.getActualites', () => {
    it('récupère les actualites', async () => {
      //Given
      const html = 'du html'
      const derniereModification = '2024-01-01'

      ;(fetchJson as jest.Mock).mockResolvedValueOnce({
        content: {
          modified: derniereModification,
          content: { rendered: html },
        },
      })

      //When
      const output = await getActualites(StructureConseiller.MILO)

      //Then
      expect(output).toEqual({
        contenu: html,
        dateDerniereModification: derniereModification,
      })
    })
  })
})
