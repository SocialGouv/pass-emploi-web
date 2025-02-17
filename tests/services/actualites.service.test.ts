import { ActualitesRaw, ArticleJson, TagJson } from 'interfaces/actualites'
import { structureMilo } from 'interfaces/structure'
import { getActualites } from 'services/actualites.service'
import { fetchJson } from 'utils/httpClient'

jest.mock('utils/httpClient')

describe('ActualitesService', () => {
  describe('.getActualites', () => {
    it('récupère les actualites', async () => {
      //Given
      const tagsJson: TagJson[] = [
        { id: 7, name: 'Primaire', description: 'primary' },
        { id: 12, name: 'Secondaire', description: 'secondary' },
      ]
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({
        content: tagsJson,
      })

      const articlesJson: ArticleJson[] = [
        {
          id: 1,
          modified: '2024-11-20T15:38:54',
          title: {
            rendered: 'Invitation à la journée présentiel du 31 octobre 2024',
          },
          tags: [7],
          content: {
            rendered: 'Cette journée aura lieu au 35 rue de la République.',
          },
          sticky: false,
        },
        {
          id: 2,
          modified: '2024-11-19T15:38:54',
          title: { rendered: 'Infolettre de novembre 2024' },
          tags: [],
          content: { rendered: 'Retrouvez notre dernière note sur le blog.' },
          sticky: true,
        },
        {
          id: 3,
          modified: '2024-12-03T16:38:54',
          title: { rendered: 'Ceci est un article de test' },
          tags: [],
          content: { rendered: 'Lorem ipsum dolor sit amet' },
          sticky: true,
        },
      ]
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({
        content: articlesJson,
      })

      //When
      const output = await getActualites(structureMilo)

      //Then
      const actualites: ActualitesRaw = {
        articles: [
          {
            id: 3,
            titre: 'Ceci est un article de test',
            etiquettes: [],
            contenu: 'Lorem ipsum dolor sit amet',
          },
          {
            id: 2,
            titre: 'Infolettre de novembre 2024',
            etiquettes: [],
            contenu: 'Retrouvez notre dernière note sur le blog.',
          },
          {
            id: 1,
            titre: 'Invitation à la journée présentiel du 31 octobre 2024',
            etiquettes: [{ couleur: 'primary', id: 7, nom: 'Primaire' }],
            contenu: 'Cette journée aura lieu au 35 rue de la République.',
          },
        ],
        dateDerniereModification: '2024-12-03T16:38:54',
      }
      expect(output).toEqual(actualites)
    })
  })
})
