import { DateTime } from 'luxon'

import { apiDelete, apiGet, apiPatch, apiPost } from 'clients/api.client'
import {
  desConseillersBeneficiaire,
  desConseillersBeneficiaireJson,
  desIndicateursSemaine,
  desIndicateursSemaineJson,
  desItemsBeneficiaires,
  desItemsBeneficiairesJson,
  unDetailBeneficiaire,
  unDetailBeneficiaireJson,
  uneBaseBeneficiaire,
  uneBaseBeneficiaireJson,
  uneDemarcheJson,
  uneListeDeDemarches,
  uneMetadonneeFavoris,
  uneMetadonneeFavorisJson,
} from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import { desMotifsDeSuppression } from 'fixtures/referentiel'
import { CategorieSituation } from 'interfaces/beneficiaire'
import {
  StatutDemarche,
  SuppressionBeneficiaireFormData,
} from 'interfaces/json/beneficiaire'
import { MotifSuppressionBeneficiaire } from 'interfaces/referentiel'
import {
  archiverJeune,
  changerVisibiliteComptageHeures,
  getBeneficiairesDeLaStructureMilo,
  getBeneficiairesDeLEtablissementClientSide,
  getBeneficiairesDuConseillerClientSide,
  getBeneficiairesDuConseillerServerSide,
  getComptageHeuresFicheBeneficiaire,
  getComptageHeuresPortefeuille,
  getConseillersDuJeuneClientSide,
  getConseillersDuJeuneServerSide,
  getDemarchesBeneficiaire,
  getIdentitesBeneficiairesClientSide,
  getIdJeuneMilo,
  getIndicateursBeneficiaire,
  getJeuneDetails,
  getJeunesDuConseillerParId,
  getMetadonneesFavorisJeune,
  getMotifsSuppression,
  modifierDispositif,
  modifierIdentifiantPartenaire,
  reaffecter,
  rechercheBeneficiairesDeLEtablissement,
  supprimerJeuneInactif,
} from 'services/beneficiaires.service'
import { Periode } from 'types/dates'
import { ApiError } from 'utils/httpClient'

jest.mock('clients/api.client')

describe('JeunesApiService', () => {
  describe('.getJeunesDuConseillerClientSide', () => {
    it('renvoie les jeunes du conseiller', async () => {
      // Given
      const jeunesJson = desItemsBeneficiairesJson()
      ;(apiGet as jest.Mock).mockResolvedValue({ content: jeunesJson })

      // When
      const actual = await getBeneficiairesDuConseillerClientSide()

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        `/conseillers/id-conseiller-1/jeunes`,
        'accessToken'
      )
      expect(actual).toEqual(desItemsBeneficiaires())
    })
  })

  describe('.getJeunesDuConseillerParId', () => {
    it('renvoie les jeunes du conseiller', async () => {
      // Given
      const idConseiller = 'id-conseiller-1'
      const jeunesJson = desItemsBeneficiairesJson()
      ;(apiGet as jest.Mock).mockResolvedValue({ content: jeunesJson })

      // When
      const actual = await getJeunesDuConseillerParId(idConseiller)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        `/conseillers/id-conseiller-1/jeunes`,
        'accessToken'
      )
      expect(actual).toEqual(desItemsBeneficiaires())
    })
  })

  describe('.getJeunesDuConseillerServerSide', () => {
    it('renvoie les jeunes du conseiller', async () => {
      // Given
      const idConseiller = 'id-conseiller-1'
      const accessToken = 'accessToken'
      const jeunesJson = desItemsBeneficiairesJson()
      ;(apiGet as jest.Mock).mockResolvedValue({ content: jeunesJson })

      // When
      const actual = await getBeneficiairesDuConseillerServerSide(
        idConseiller,
        accessToken
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        `/conseillers/${idConseiller}/jeunes`,
        accessToken
      )
      expect(actual).toEqual(desItemsBeneficiaires())
    })
  })

  describe('.getJeuneDetails', () => {
    it('renvoie les détails du jeune', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unDetailBeneficiaireJson({
          urlDossier: 'url-dossier',
          dateFinCEJ: '2020-10-10',
        }),
      })

      // When
      const actual = await getJeuneDetails('id-beneficiaire-1', 'accessToken')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/jeunes/id-beneficiaire-1',
        'accessToken'
      )
      expect(actual).toEqual(
        unDetailBeneficiaire({
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
      const actual = await getJeuneDetails('id-beneficiaire-1', 'accessToken')

      // Then
      expect(actual).toEqual(undefined)
    })
  })

  describe('.getIdJeuneMilo', () => {
    it("renvoie l'id du jeune MiLo", async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: { id: 'id-beneficiaire-1' },
      })

      // When
      const actual = await getIdJeuneMilo('numero-dossier', 'accessToken')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/milo/jeunes/numero-dossier',
        'accessToken'
      )
      expect(actual).toEqual('id-beneficiaire-1')
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
      const idsJeunes = ['id-beneficiaire-1', 'id-beneficiaire-2']
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
      await supprimerJeuneInactif('id-beneficiaire-1')

      // Then
      expect(apiDelete).toHaveBeenCalledWith(
        '/jeunes/id-beneficiaire-1',
        accessToken
      )
    })
  })

  describe('.archiverJeune', () => {
    it('archive le jeune', async () => {
      // Given
      const payloadFormData: SuppressionBeneficiaireFormData = {
        motif: 'Radiation du CEJ',
        dateFinAccompagnement: '2020-04-12T12:00:00.000Z',
        commentaire: undefined,
      }
      const accessToken = 'accessToken'

      // When
      await archiverJeune('id-beneficiaire-1', payloadFormData)

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/jeunes/id-beneficiaire-1/archiver',
        {
          motif: 'Radiation du CEJ',
          dateFinAccompagnement: '2020-04-12T12:00:00.000Z',
          commentaire: undefined,
        },
        accessToken
      )
    })
  })

  describe('.getConseillersDuJeuneClientSide', () => {
    it('renvoie les conseillers du jeune', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: desConseillersBeneficiaireJson(),
      })

      // When
      const actual = await getConseillersDuJeuneClientSide('id-beneficiaire-1')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/jeunes/id-beneficiaire-1/conseillers',
        'accessToken'
      )
      expect(actual).toEqual(desConseillersBeneficiaire())
    })
  })

  describe('.getConseillersDuJeuneServerSide', () => {
    it('renvoie les conseillers du jeune', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: desConseillersBeneficiaireJson(),
      })

      // When
      const actual = await getConseillersDuJeuneServerSide(
        'id-beneficiaire-1',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/jeunes/id-beneficiaire-1/conseillers',
        'accessToken'
      )
      expect(actual).toEqual(desConseillersBeneficiaire())
    })
  })

  describe('.getMotifsSuppression', () => {
    it('renvoie les motifs de suppression', async () => {
      // Given
      const accessToken = 'accessToken'
      const motifs: MotifSuppressionBeneficiaire[] = desMotifsDeSuppression()

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
      const actual = await getMetadonneesFavorisJeune(
        'id-beneficiaire-1',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/jeunes/id-beneficiaire-1/favoris/metadonnees',
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
      expect(apiPatch).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1/jeunes/' + idJeune,
        { idPartenaire },
        'accessToken'
      )
    })
  })

  describe('.modifierDispositif', () => {
    it('modifie le dispositif d’un jeune', async function () {
      // Given
      const idJeune = 'idJeune'
      const dispositif = 'PACEA'

      // When
      await modifierDispositif(idJeune, dispositif)

      // Then
      expect(apiPatch).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1/jeunes/' + idJeune,
        { dispositif },
        'accessToken'
      )
    })
  })

  describe('.changerVisibiliteComptageHeures', () => {
    it('change la visibilité du comptage des heures pour un bénéficiaire', async function () {
      // Given
      const idJeune = 'idJeune'
      const peutVoirLeComptageDesHeures = true

      // When
      await changerVisibiliteComptageHeures(
        idJeune,
        peutVoirLeComptageDesHeures
      )

      // Then
      expect(apiPatch).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1/jeunes/' + idJeune,
        { peutVoirLeComptageDesHeures },
        'accessToken'
      )
    })
  })

  describe('.getIndicateursBeneficiaire', () => {
    it('renvoie les indicateurs complets du jeune entre une date de début et une date de fin', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: desIndicateursSemaineJson(),
      })
      const dateDebut = DateTime.fromISO('2022-10-10')
      const dateFin = DateTime.fromISO('2022-10-17')

      // When
      const actual = await getIndicateursBeneficiaire(
        'id-conseiller-1',
        'id-beneficiaire-1',
        dateDebut,
        dateFin
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1/jeunes/id-beneficiaire-1/indicateurs?dateDebut=2022-10-10T00%3A00%3A00.000%2B02%3A00&dateFin=2022-10-17T00%3A00%3A00.000%2B02%3A00',
        'accessToken'
      )
      expect(actual).toEqual(desIndicateursSemaine())
    })
  })

  describe('.getBeneficiairesDeLEtablissementClientSide', () => {
    it('retourne les bénéficiaires d’un établissement', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: [uneBaseBeneficiaireJson()],
      })

      // When
      const actual =
        await getBeneficiairesDeLEtablissementClientSide('id-etablissement')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/etablissements/id-etablissement/jeunes',
        'accessToken'
      )
      expect(actual).toEqual([uneBaseBeneficiaire()])
    })
  })

  describe('.getIdentitesBeneficiaires', () => {
    it('récupère les noms et prénoms des bénéficiaires demandés', async () => {
      // Given
      const basesJeunes = [uneBaseBeneficiaire(), uneBaseBeneficiaire()]
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: basesJeunes,
      })

      // When
      const actual = await getIdentitesBeneficiairesClientSide([
        'id-beneficiaire-1',
        'id-beneficiaire-2',
        'id-beneficiaire-3',
      ])

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1/jeunes/identites?ids=id-beneficiaire-1&ids=id-beneficiaire-2&ids=id-beneficiaire-3',
        'accessToken'
      )
      expect(actual).toEqual(basesJeunes)
    })
  })

  describe('.rechercheBeneficiairesDeLEtablissement', () => {
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
                id: 'id-beneficiaire-1',
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
      const actual = await rechercheBeneficiairesDeLEtablissement(
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
        beneficiaires: [
          {
            base: {
              id: 'id-beneficiaire-1',
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
                id: 'id-beneficiaire-1',
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
        beneficiaires: [
          {
            base: {
              id: 'id-beneficiaire-1',
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

  describe('.getDemarchesBeneficiaire', () => {
    let periode: Periode
    beforeEach(() => {
      periode = {
        debut: DateTime.fromISO('2024-09-10'),
        fin: DateTime.fromISO('2024-09-16'),
        label: 'periode du 10 au 16 septembre',
      }
    })
    it('renvoie les démarches du bénéficiaire à partir d’une date', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          queryModel: [
            uneDemarcheJson(),
            uneDemarcheJson({
              id: 'id-demarche-2',
              statut: StatutDemarche.A_FAIRE,
              attributs: [
                { cle: 'description', valeur: 'Démarche personnalisée' },
              ],
            }),
          ],
        },
      })

      // When
      const actual = await getDemarchesBeneficiaire(
        'id-beneficiaire-1',
        periode,
        'id-conseiller-1',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1/jeunes/id-beneficiaire-1/demarches?dateDebut=2024-09-10T00%3A00%3A00.000%2B02%3A00&dateFin=2024-09-16T00%3A00%3A00.000%2B02%3A00',
        'accessToken'
      )
      expect(actual).toEqual({ data: uneListeDeDemarches(), isStale: false })
    })

    it('renvoie les démarches pas fraiches', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          queryModel: [
            uneDemarcheJson(),
            uneDemarcheJson({
              id: 'id-demarche-2',
              statut: StatutDemarche.A_FAIRE,
              attributs: [
                { cle: 'description', valeur: 'Démarche personnalisée' },
              ],
            }),
          ],
          dateDuCache: '2024-04-12',
        },
      })

      // When
      const actual = await getDemarchesBeneficiaire(
        'id-beneficiaire-1',
        periode,
        'id-conseiller-1',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1/jeunes/id-beneficiaire-1/demarches?dateDebut=2024-09-10T00%3A00%3A00.000%2B02%3A00&dateFin=2024-09-16T00%3A00%3A00.000%2B02%3A00',
        'accessToken'
      )
      expect(actual).toEqual({ data: uneListeDeDemarches(), isStale: true })
    })

    it('renvoie un échec', async () => {
      // Given
      ;(apiGet as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Erreur lors de la récupération des démarches')
      )
      const dateDebut = DateTime.fromISO('2024-09-10')
      const dateFin = DateTime.fromISO('2024-09-16')
      const label = ''

      // When
      const actual = await getDemarchesBeneficiaire(
        'id-beneficiaire-1',
        {
          debut: dateDebut,
          fin: dateFin,
          label,
        },
        'id-conseiller-1',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1/jeunes/id-beneficiaire-1/demarches?dateDebut=2024-09-10T00%3A00%3A00.000%2B02%3A00&dateFin=2024-09-16T00%3A00%3A00.000%2B02%3A00',
        'accessToken'
      )
      expect(actual).toEqual(null)
    })
  })

  describe('.getComptageHeuresPortefeuille', () => {
    it('renvoie le comptage des heures du portefeuille', async () => {
      // Given
      const idConseiller = 'id-conseiller-1'
      const idJeune = 'id-beneficiaire-1'
      const nbHeuresDeclarees = 10
      const dateDerniereMiseAJour = '2024-04-12'
      const comptagesJson = [
        {
          idJeune: 'id-beneficiaire-1',
          nbHeuresDeclarees,
        },
      ]

      const comptages = [
        {
          idBeneficiaire: idJeune,
          nbHeuresDeclarees,
        },
      ]
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: { dateDerniereMiseAJour, comptages: comptagesJson },
      })

      // When
      const actual = await getComptageHeuresPortefeuille(idConseiller)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        `/conseillers/${idConseiller}/jeunes/comptage`,
        'accessToken'
      )
      expect(actual).toEqual({
        dateDerniereMiseAJour,
        comptages,
      })
    })
  })

  describe('.getComptageHeuresFicheBeneficiaire', () => {
    it('renvoie le comptage des heures pour la fiche bénéficiaire', async () => {
      // Given
      const idBeneficiaire = 'id-beneficiaire-1'
      const nbHeuresDeclarees = 10
      const nbHeuresValidees = 12
      const periode = {
        debut: DateTime.fromISO('2025-04-10'),
        fin: DateTime.fromISO('2025-04-16'),
        label: 'periode du 10 au 16 avril',
      }
      const dateDerniereMiseAJour = '2025-04-12'

      const dateDebut = periode.debut.toFormat('yyyy-MM-dd')
      const dateFin = periode.fin.toFormat('yyyy-MM-dd')

      ;(apiGet as jest.Mock).mockResolvedValue({
        content: { dateDerniereMiseAJour, nbHeuresDeclarees, nbHeuresValidees },
      })

      // When
      const actual = await getComptageHeuresFicheBeneficiaire(
        idBeneficiaire,
        periode
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        `/jeunes/${idBeneficiaire}/comptage?dateDebut=${dateDebut}&dateFin=${dateFin}`,
        'accessToken'
      )
      expect(actual).toEqual({
        dateDerniereMiseAJour,
        nbHeuresDeclarees,
        nbHeuresValidees,
      })
    })
  })
})
