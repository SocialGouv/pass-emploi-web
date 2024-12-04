import { ActualitesRaw, ArticleJson, TagJson } from 'interfaces/actualites'
import { StructureConseiller } from 'interfaces/conseiller'
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
          content: {
            rendered: 'Cette journée aura lieu au 35 rue de la République.',
          },
          id: 1,
          title: {
            rendered: 'Invitation à la journée présentiel du 31 octobre 2024',
          },
          modified: '2024-11-20T15:38:54',
          tags: [7],
        },
        {
          content: { rendered: 'Retrouvez notre dernière note sur le blog.' },
          id: 2,
          title: { rendered: 'Infolettre de novembre 2024' },
          modified: '2024-11-19T15:38:54',
          tags: [],
        },
      ]
      ;(fetchJson as jest.Mock).mockResolvedValueOnce({
        content: articlesJson,
      })

      //When
      const output = await getActualites(StructureConseiller.MILO)

      //Then
      const actualites: ActualitesRaw = {
        articles: [
          {
            id: 1,
            titre: 'Invitation à la journée présentiel du 31 octobre 2024',
            etiquettes: [{ couleur: 'primary', id: 7, nom: 'Primaire' }],
            contenu: 'Cette journée aura lieu au 35 rue de la République.',
          },
          {
            id: 2,
            titre: 'Infolettre de novembre 2024',
            etiquettes: [],
            contenu: 'Retrouvez notre dernière note sur le blog.',
          },
        ],
        dateDerniereModification: '2024-11-20T15:38:54',
      }
      expect(output).toEqual(actualites)
    })
  })
})
