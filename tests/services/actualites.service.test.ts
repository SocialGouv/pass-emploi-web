import { StructureConseiller } from 'interfaces/conseiller'
import { getActualites } from 'services/actualites.service'
import { fetchJson } from 'utils/httpClient'

jest.mock('utils/httpClient')

describe('ActualitesService', () => {
  describe('.getActualites', () => {
    it('récupère les actualites', async () => {
      //Given
      const html = [
        {
          content: {
            rendered: 'Cette journée aura lieu au 35 rue de la République.',
          },
          id: 'id-article-1',
          title: {
            rendered: 'Invitation à la journée présentiel du 31 octobre 2024',
          },
          modified: '2024-11-20T15:38:54',
        },
        {
          content: { rendered: 'Retrouvez notre dernière note sur le blog.' },
          id: 'id-article-2',
          title: { rendered: 'Infolettre de novembre 2024' },
          modified: '2024-11-19T15:38:54',
        },
      ]

      ;(fetchJson as jest.Mock).mockResolvedValueOnce({
        content: html,
      })

      //When
      const output = await getActualites(StructureConseiller.MILO)

      //Then
      expect(output).toEqual({
        articles: [
          {
            contenu: 'Cette journée aura lieu au 35 rue de la République.',
            id: 'id-article-1',
            titre: 'Invitation à la journée présentiel du 31 octobre 2024',
          },
          {
            contenu: 'Retrouvez notre dernière note sur le blog.',
            id: 'id-article-2',
            titre: 'Infolettre de novembre 2024',
          },
        ],
        dateDerniereModification: '2024-11-20T15:38:54',
      })
    })
  })
})
