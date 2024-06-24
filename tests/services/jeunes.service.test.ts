import { DateTime } from 'luxon'

import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
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
import { CategorieSituation } from 'interfaces/beneficiaire'
import { SuppressionJeuneFormData } from 'interfaces/json/jeune'
import { MotifSuppressionJeune } from 'interfaces/referentiel'
import {
  archiverJeune,
  getConseillersDuJeuneClientSide,
  getConseillersDuJeuneServerSide,
  getIdJeuneMilo,
  getIdentitesBeneficiairesClientSide,
  getIndicateursJeuneAlleges,
  getIndicateursJeuneComplets,
  getJeuneDetails,
  getJeunesDeLEtablissementClientSide,
  getJeunesDuConseillerClientSide,
  getJeunesDuConseillerParId,
  getJeunesDuConseillerServerSide,
  getMetadonneesFavorisJeune,
  getMotifsSuppression,
  modifierIdentifiantPartenaire,
  reaffecter,
  rechercheJeunesDeLEtablissement,
  getBeneficiairesDeLaStructureMilo,
  supprimerJeuneInactif,
} from 'services/jeunes.service'
import { ApiError } from 'utils/httpClient'

jest.mock('clients/api.client')

describe('JeunesApiService', () => {
  describe('.getJeunesDuConseillerClientSide', () => {
    it('renvoie les jeunes du conseiller', async () => {
      // Given
      const jeunesJson = desItemsJeunesJson()
      ;(apiGet as jest.Mock).mockResolvedValue({ content: jeunesJson })

      // When
      const actual = await getJeunesDuConseillerClientSide()

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        `/conseillers/idConseiller/jeunes`,
        'accessToken'
      )
      expect(actual).toEqual(desItemsJeunes())
    })
  })

  describe('.getJeunesDuConseillerParId', () => {
    it('renvoie les jeunes du conseiller', async () => {
      // Given
      const idConseiller = 'idConseiller'
      const jeunesJson = desItemsJeunesJson()
      ;(apiGet as jest.Mock).mockResolvedValue({ content: jeunesJson })

      // When
      const actual = await getJeunesDuConseillerParId(idConseiller)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
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
      ;(apiGet as jest.Mock).mockResolvedValue({ content: jeunesJson })

      // When
      const actual = await getJeunesDuConseillerServerSide(
        idConseiller,
        accessToken
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        `/conseillers/${idConseiller}/jeunes`,
        accessToken
      )
      expect(actual).toEqual(desItemsJeunes())
    })
  })

  describe('.getJeuneDetails', () => {
    it('renvoie les détails du jeune', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unDetailJeuneJson({
          urlDossier: 'url-dossier',
          dateFinCEJ: '2020-10-10',
        }),
      })

      // When
      const actual = await getJeuneDetails('id-jeune', 'accessToken')

      // Then
      expect(apiGet).toHaveBeenCalledWith('/jeunes/id-jeune', 'accessToken')
      expect(actual).toEqual(
        unDetailJeune({
          urlDossier: 'url-dossier',
          dateFinCEJ: '2020-10-10',
        })
      )
    })

    it("renvoie undefined si le jeune n'existe pas", async () => {
      // Given
      ;(apiGet as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Jeune non trouvé')
      )

      // When
      const actual = await getJeuneDetails('id-jeune', 'accessToken')

      // Then
      expect(actual).toEqual(undefined)
    })
  })

  describe('.getIdJeuneMilo', () => {
    it("renvoie l'id du jeune MiLo", async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: { id: 'id-jeune' },
      })

      // When
      const actual = await getIdJeuneMilo('numero-dossier', 'accessToken')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/milo/jeunes/numero-dossier',
        'accessToken'
      )
      expect(actual).toEqual('id-jeune')
    })

    it("renvoie undefined si le jeune n'existe pas", async () => {
      // Given
      ;(apiGet as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Numero dossier non trouvé')
      )

      // When
      const actual = await getIdJeuneMilo('numero-dossier', 'accessToken')

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
      ;(apiGet as jest.Mock).mockImplementation((url) => {
        if (url === `/conseillers?email=${emailConseillerDestination}`)
          return { content: unConseiller({ id: idConseillerDestination }) }
      })
      const accessToken = 'accessToken'

      // WHEN
      await reaffecter(
        idConseillerInitial,
        idConseillerDestination,
        idsJeunes,
        estTemporaire
      )

      // THEN
      expect(apiPost).toHaveBeenCalledWith(
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
      await supprimerJeuneInactif('id-jeune')

      // Then
      expect(apiDelete).toHaveBeenCalledWith(`/jeunes/id-jeune`, accessToken)
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
      await archiverJeune('id-jeune', payloadFormData)

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/jeunes/id-jeune/archiver',
        { motif: 'Radiation du CEJ', commentaire: undefined },
        accessToken
      )
    })
  })

  describe('.getConseillersDuJeuneClientSide', () => {
    it('renvoie les conseillers du jeune', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: desConseillersJeuneJson(),
      })

      // When
      const actual = await getConseillersDuJeuneClientSide('id-jeune')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/jeunes/id-jeune/conseillers',
        'accessToken'
      )
      expect(actual).toEqual(desConseillersJeune())
    })
  })

  describe('.getConseillersDuJeuneServerSide', () => {
    it('renvoie les conseillers du jeune', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: desConseillersJeuneJson(),
      })

      // When
      const actual = await getConseillersDuJeuneServerSide(
        'id-jeune',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
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

      ;(apiGet as jest.Mock).mockResolvedValue({
        content: motifs,
      })

      // When
      const actual = await getMotifsSuppression()

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/referentiels/motifs-suppression-jeune',
        accessToken
      )
      expect(actual).toEqual(motifs)
    })
  })

  describe('.getMetadonneesFavorisJeune', () => {
    it('renvoie les métadonnées des recherches sauvegardées d’un bénéficiaire', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: { favoris: uneMetadonneeFavorisJson() },
      })

      // When
      const actual = await getMetadonneesFavorisJeune('id-jeune', 'accessToken')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
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
      await modifierIdentifiantPartenaire(idJeune, idPartenaire)

      // Then
      expect(apiPut).toHaveBeenCalledWith(
        '/conseillers/idConseiller/jeunes/' + idJeune,
        { idPartenaire: idPartenaire },
        'accessToken'
      )
    })
  })

  describe('.getIndicateursJeuneAlleges', () => {
    it('renvoie les indicateurs allégés du jeune entre une date de début et une date de fin', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: desIndicateursSemaineJson(),
      })
      const dateDebut = DateTime.fromISO('2022-10-10')
      const dateFin = DateTime.fromISO('2022-10-17')

      // When
      const actual = await getIndicateursJeuneAlleges(
        'id-conseiller',
        'id-jeune',
        dateDebut,
        dateFin
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/id-conseiller/jeunes/id-jeune/indicateurs?dateDebut=2022-10-10T00%3A00%3A00.000%2B02%3A00&dateFin=2022-10-17T00%3A00%3A00.000%2B02%3A00&exclureOffresEtFavoris=true',
        'accessToken'
      )
      expect(actual).toEqual(desIndicateursSemaine())
    })
  })

  describe('.getIndicateursJeuneComplets', () => {
    it('renvoie les indicateurs complets du jeune entre une date de début et une date de fin', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: desIndicateursSemaineJson(),
      })
      const dateDebut = DateTime.fromISO('2022-10-10')
      const dateFin = DateTime.fromISO('2022-10-17')

      // When
      const actual = await getIndicateursJeuneComplets(
        'id-conseiller',
        'id-jeune',
        dateDebut,
        dateFin
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/id-conseiller/jeunes/id-jeune/indicateurs?dateDebut=2022-10-10T00%3A00%3A00.000%2B02%3A00&dateFin=2022-10-17T00%3A00%3A00.000%2B02%3A00&exclureOffresEtFavoris=false',
        'accessToken'
      )
      expect(actual).toEqual(desIndicateursSemaine())
    })
  })

  describe('.getJeunesDeLEtablissementClientSide', () => {
    it('retourne les bénéficiaires d’un établissement', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: [uneBaseJeuneJson()],
      })

      // When
      const actual = await getJeunesDeLEtablissementClientSide(
        'id-etablissement'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
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
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: basesJeunes,
      })

      // When
      const actual = await getIdentitesBeneficiairesClientSide([
        'id-jeune-1',
        'id-jeune-2',
        'id-jeune-3',
      ])

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/idConseiller/jeunes/identites?ids=id-jeune-1&ids=id-jeune-2&ids=id-jeune-3',
        'accessToken'
      )
      expect(actual).toEqual(basesJeunes)
    })
  })

  describe('.rechercheJeunesDeLEtablissement', () => {
    it('retourne le resultat de recherche des jeunes d’un etablissement', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          pagination: {
            page: 3,
            limit: 10,
            total: 51,
          },
          resultats: [
            {
              jeune: {
                id: 'jeune-1',
                nom: 'Reportaire',
                prenom: 'Albert',
              },
              referent: {
                id: 'conseiller-1',
                nom: 'Tavernier',
                prenom: 'Nils',
              },
              situation: 'Emploi',
              dateDerniereActivite: '2023-03-01T14:11:38.040Z',
            },
          ],
        },
      })

      // When
      const actual = await rechercheJeunesDeLEtablissement(
        'id-etablissement',
        'e',
        3
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/v2/etablissements/id-etablissement/jeunes?q=e&page=3',
        'accessToken'
      )
      expect(actual).toEqual({
        metadonnees: {
          nombrePages: 6,
          nombreTotal: 51,
        },
        jeunes: [
          {
            base: {
              id: 'jeune-1',
              nom: 'Reportaire',
              prenom: 'Albert',
            },
            referent: {
              id: 'conseiller-1',
              nom: 'Tavernier',
              prenom: 'Nils',
            },
            situation: CategorieSituation.EMPLOI,
            dateDerniereActivite: '2023-03-01T14:11:38.040Z',
          },
        ],
      })
    })
  })

  describe('.getBeneficiairesDeLaStructureMilo', () => {
    it('retourne le resultat de recherche des jeunes d’une structure Milo', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          pagination: {
            page: 3,
            limit: 10,
            total: 51,
          },
          resultats: [
            {
              jeune: {
                id: 'jeune-1',
                nom: 'Reportaire',
                prenom: 'Albert',
              },
              referent: {
                id: 'conseiller-1',
                nom: 'Tavernier',
                prenom: 'Nils',
              },
              situation: 'Emploi',
              dateDerniereActivite: '2023-03-01T14:11:38.040Z',
            },
          ],
        },
      })

      // When
      const actual = await getBeneficiairesDeLaStructureMilo(
        'id-structure',
        'tok'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/structures-milo/id-structure/jeunes',
        'tok'
      )
      expect(actual).toEqual({
        jeunes: [
          {
            base: {
              id: 'jeune-1',
              nom: 'Reportaire',
              prenom: 'Albert',
            },
            referent: {
              id: 'conseiller-1',
              nom: 'Tavernier',
              prenom: 'Nils',
            },
            situation: CategorieSituation.EMPLOI,
            dateDerniereActivite: '2023-03-01T14:11:38.040Z',
          },
        ],
      })
    })
  })
})
