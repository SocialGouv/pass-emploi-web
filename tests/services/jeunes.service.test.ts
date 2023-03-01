import { DateTime } from 'luxon'

import { ApiClient } from 'clients/api.client'
import { unConseiller } from 'fixtures/conseiller'
import {
  desConseillersJeune,
  desConseillersJeuneJson,
  desIndicateursSemaine,
  desIndicateursSemaineJson,
  desItemsJeunes,
  desItemsJeunesJson,
  unDetailJeune,
  unDetailJeuneJson,
  uneBaseJeune,
  uneBaseJeuneJson,
  uneMetadonneeFavoris,
  uneMetadonneeFavorisJson,
} from 'fixtures/jeune'
import { desMotifsDeSuppression } from 'fixtures/referentiel'
import { JeuneFromListe } from 'interfaces/jeune'
import { SuppressionJeuneFormData } from 'interfaces/json/jeune'
import { MotifSuppressionJeune } from 'interfaces/referentiel'
import { JeunesApiService } from 'services/jeunes.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'
import { ApiError } from 'utils/httpClient'

describe('JeunesApiService', () => {
  let apiClient: ApiClient
  let jeunesService: JeunesApiService
  beforeEach(async () => {
    // Given
    apiClient = new FakeApiClient()
    jeunesService = new JeunesApiService(apiClient)
  })

  describe('.getJeunesDuConseillerClientSide', () => {
    it('renvoie les jeunes du conseiller', async () => {
      // Given
      const jeunesJson = desItemsJeunesJson()
      ;(apiClient.get as jest.Mock).mockResolvedValue({ content: jeunesJson })

      // When
      const actual = await jeunesService.getJeunesDuConseillerClientSide()

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        `/conseillers/idConseiller/jeunes`,
        'accessToken'
      )
      expect(actual).toEqual(desItemsJeunes())
    })
  })

  describe('.getJeunesDuConseillerServerSide', () => {
    it('renvoie les jeunes du conseiller', async () => {
      // Given
      const idConseiller = 'idConseiller'
      const accessToken = 'accessToken'
      const jeunesJson = desItemsJeunesJson()
      ;(apiClient.get as jest.Mock).mockResolvedValue({ content: jeunesJson })

      // When
      const actual = await jeunesService.getJeunesDuConseillerServerSide(
        idConseiller,
        accessToken
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        `/conseillers/${idConseiller}/jeunes`,
        accessToken
      )
      expect(actual).toEqual(desItemsJeunes())
    })
  })

  describe('.getJeunesDuConseillerParEmail', () => {
    const email = 'conseiller@email.com'
    const accessToken = 'accessToken'
    const conseiller = unConseiller({ id: 'conseiller-by-email' })
    const jeunes = desItemsJeunesJson()
    let actual: { idConseiller: string; jeunes: JeuneFromListe[] }
    beforeEach(async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockImplementation((url) => {
        if (url === `/conseillers?email=${email}`)
          return { content: conseiller }
        if (url === '/conseillers/conseiller-by-email/jeunes')
          return { content: jeunes }
      })

      // When
      actual = await jeunesService.getJeunesDuConseillerParEmail(email)
    })

    it('récupère le conseiller par son email', async () => {
      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        `/conseillers?email=${email}`,
        accessToken
      )
    })

    it('renvoie les jeunes du conseiller', async () => {
      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        `/conseillers/conseiller-by-email/jeunes`,
        accessToken
      )
      expect(actual).toEqual({
        idConseiller: 'conseiller-by-email',
        jeunes: desItemsJeunes(),
      })
    })
  })

  describe('.getJeuneDetails', () => {
    it('renvoie les détails du jeune', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: unDetailJeuneJson({
          urlDossier: 'url-dossier',
          dateFinCEJ: '2020-10-10',
        }),
      })

      // When
      const actual = await jeunesService.getJeuneDetails(
        'id-jeune',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/jeunes/id-jeune',
        'accessToken'
      )
      expect(actual).toEqual(
        unDetailJeune({
          urlDossier: 'url-dossier',
          dateFinCEJ: '2020-10-10',
        })
      )
    })

    it("renvoie undefined si le jeune n'existe pas", async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Jeune non trouvé')
      )

      // When
      const actual = await jeunesService.getJeuneDetails(
        'id-jeune',
        'accessToken'
      )

      // Then
      expect(actual).toEqual(undefined)
    })
  })

  describe('.getIdJeuneMilo', () => {
    it("renvoie l'id du jeune MiLo", async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: { id: 'id-jeune' },
      })

      // When
      const actual = await jeunesService.getIdJeuneMilo(
        'numero-dossier',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/conseillers/milo/jeunes/numero-dossier',
        'accessToken'
      )
      expect(actual).toEqual('id-jeune')
    })

    it("renvoie undefined si le jeune n'existe pas", async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Numero dossier non trouvé')
      )

      // When
      const actual = await jeunesService.getIdJeuneMilo(
        'numero-dossier',
        'accessToken'
      )

      // Then
      expect(actual).toEqual(undefined)
    })
  })

  describe('.reaffecter', () => {
    it('reaffecte les jeunes', async () => {
      // Given
      const idConseillerInitial = 'idConseillerInitial'
      const emailConseillerDestination = 'conseiller@email.com'
      const idConseillerDestination = 'idConseillerDestination'
      const idsJeunes = ['id-jeune-1', 'id-jeune-2']
      const estTemporaire = false
      ;(apiClient.get as jest.Mock).mockImplementation((url) => {
        if (url === `/conseillers?email=${emailConseillerDestination}`)
          return { content: unConseiller({ id: idConseillerDestination }) }
      })
      const accessToken = 'accessToken'

      // WHEN
      await jeunesService.reaffecter(
        idConseillerInitial,
        emailConseillerDestination,
        idsJeunes,
        estTemporaire
      )

      // THEN
      expect(apiClient.post).toHaveBeenCalledWith(
        `/jeunes/transferer`,
        {
          idConseillerSource: idConseillerInitial,
          idConseillerCible: idConseillerDestination,
          estTemporaire: false,
          idsJeune: idsJeunes,
        },
        accessToken
      )
    })
  })

  describe('.supprimerJeuneInactif', () => {
    it('supprime le jeune', async () => {
      // Given
      const accessToken = 'accessToken'

      // When
      await jeunesService.supprimerJeuneInactif('id-jeune')

      // Then
      expect(apiClient.delete).toHaveBeenCalledWith(
        `/jeunes/id-jeune`,
        accessToken
      )
    })
  })

  describe('.archiverJeune', () => {
    it('archive le jeune', async () => {
      // Given
      const payloadFormData: SuppressionJeuneFormData = {
        motif: 'Radiation du CEJ',
        commentaire: undefined,
      }
      const accessToken = 'accessToken'

      // When
      await jeunesService.archiverJeune('id-jeune', payloadFormData)

      // Then
      expect(apiClient.post).toHaveBeenCalledWith(
        '/jeunes/id-jeune/archiver',
        { motif: 'Radiation du CEJ', commentaire: undefined },
        accessToken
      )
    })
  })

  describe('.getConseillersDuJeuneClientSide', () => {
    it('renvoie les conseillers du jeune', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: desConseillersJeuneJson(),
      })

      // When
      const actual = await jeunesService.getConseillersDuJeuneClientSide(
        'id-jeune'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/jeunes/id-jeune/conseillers',
        'accessToken'
      )
      expect(actual).toEqual(desConseillersJeune())
    })
  })

  describe('.getConseillersDuJeuneServerSide', () => {
    it('renvoie les conseillers du jeune', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: desConseillersJeuneJson(),
      })

      // When
      const actual = await jeunesService.getConseillersDuJeuneServerSide(
        'id-jeune',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/jeunes/id-jeune/conseillers',
        'accessToken'
      )
      expect(actual).toEqual(desConseillersJeune())
    })
  })

  describe('.getMotifsSuppression', () => {
    it('renvoie les motifs de suppression', async () => {
      // Given
      const accessToken = 'accessToken'
      const motifs: MotifSuppressionJeune[] = desMotifsDeSuppression()

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: motifs,
      })

      // When
      const actual = await jeunesService.getMotifsSuppression()

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/referentiels/motifs-suppression-jeune',
        accessToken
      )
      expect(actual).toEqual(motifs)
    })
  })

  describe('.getMetadonneesFavorisJeune', () => {
    it('renvoie les métadonnées des recherches sauvegardées d’un bénéficiaire', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: { favoris: uneMetadonneeFavorisJson() },
      })

      // When
      const actual = await jeunesService.getMetadonneesFavorisJeune(
        'id-jeune',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/jeunes/id-jeune/favoris/metadonnees',
        'accessToken'
      )
      expect(actual).toEqual(uneMetadonneeFavoris())
    })
  })

  describe('.modifierIdentifiantPartenaire', () => {
    it('modifie l’idPartenaire d’un jeune', async function () {
      // Given
      const idJeune = 'idJeune'
      const idPartenaire = '123456789'

      // When
      await jeunesService.modifierIdentifiantPartenaire(idJeune, idPartenaire)

      // Then
      expect(apiClient.put).toHaveBeenCalledWith(
        '/conseillers/idConseiller/jeunes/' + idJeune,
        { idPartenaire: idPartenaire },
        'accessToken'
      )
    })
  })

  describe('.getIndicateursJeuneAlleges', () => {
    it('renvoie les indicateurs allégés du jeune entre une date de début et une date de fin', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: desIndicateursSemaineJson(),
      })
      const dateDebut = DateTime.fromISO('2022-10-10')
      const dateFin = DateTime.fromISO('2022-10-17')

      // When
      const actual = await jeunesService.getIndicateursJeuneAlleges(
        'id-conseiller',
        'id-jeune',
        dateDebut,
        dateFin
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/conseillers/id-conseiller/jeunes/id-jeune/indicateurs?dateDebut=2022-10-10T00%3A00%3A00.000%2B02%3A00&dateFin=2022-10-17T00%3A00%3A00.000%2B02%3A00&exclureOffresEtFavoris=true',
        'accessToken'
      )
      expect(actual).toEqual(desIndicateursSemaine())
    })
  })

  describe('.getIndicateursJeuneComplets', () => {
    it('renvoie les indicateurs complets du jeune entre une date de début et une date de fin', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: desIndicateursSemaineJson(),
      })
      const dateDebut = DateTime.fromISO('2022-10-10')
      const dateFin = DateTime.fromISO('2022-10-17')

      // When
      const actual = await jeunesService.getIndicateursJeuneComplets(
        'id-conseiller',
        'id-jeune',
        dateDebut,
        dateFin
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/conseillers/id-conseiller/jeunes/id-jeune/indicateurs?dateDebut=2022-10-10T00%3A00%3A00.000%2B02%3A00&dateFin=2022-10-17T00%3A00%3A00.000%2B02%3A00&exclureOffresEtFavoris=false',
        'accessToken'
      )
      expect(actual).toEqual(desIndicateursSemaine())
    })
  })

  describe('.getJeunesDeLEtablissement', () => {
    it('retourne les bénéficiaires d’un établissement', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: [uneBaseJeuneJson()],
      })

      // When
      const actual = await jeunesService.getJeunesDeLEtablissement(
        'id-etablissement'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/etablissements/id-etablissement/jeunes',
        'accessToken'
      )
      expect(actual).toEqual([uneBaseJeune()])
    })
  })

  describe('.getIdentitesBeneficiaires', () => {
    it('récupère les noms et prénoms des bénéficiaires demandés', async () => {
      // Given
      const basesJeunes = [uneBaseJeune(), uneBaseJeune()]
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: basesJeunes,
      })

      // When
      const actual = await jeunesService.getIdentitesBeneficiaires([
        'id-jeune-1',
        'id-jeune-2',
        'id-jeune-3',
      ])

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/conseillers/idConseiller/jeunes/identites?ids=id-jeune-1&ids=id-jeune-2&ids=id-jeune-3',
        'accessToken'
      )
      expect(actual).toEqual(basesJeunes)
    })
  })

  describe('.rechercheJeunesDeLEtablissement', () => {
    it('retourne le resultat de recherche des jeunes d’un etablissment', async () => {
      // Given
      const unJeune = uneBaseJeune()
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: { resultats: [{ jeune: unJeune }] },
      })

      // When
      const actual = await jeunesService.rechercheJeunesDeLEtablissement(
        'id-etablissement',
        'e'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/v2/etablissements/id-etablissement/jeunes?q=e',
        'accessToken'
      )
      expect(actual).toEqual([unJeune])
    })
  })
})
