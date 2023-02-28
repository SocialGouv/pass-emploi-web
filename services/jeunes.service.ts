import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import { Conseiller } from 'interfaces/conseiller'
import {
  BaseJeune,
  ConseillerHistorique,
  DetailJeune,
  IndicateursSemaine,
  JeuneFromListe,
  MetadonneesFavoris,
} from 'interfaces/jeune'
import {
  ConseillerHistoriqueJson,
  toConseillerHistorique,
} from 'interfaces/json/conseiller'
import {
  BaseJeuneJson,
  DetailJeuneJson,
  IndicateursSemaineJson,
  ItemJeuneJson,
  jsonToBaseJeune,
  jsonToDetailJeune,
  jsonToIndicateursSemaine,
  jsonToItemJeune,
  jsonToMetadonneesFavoris,
  MetadonneesFavorisJson,
  SuppressionJeuneFormData,
} from 'interfaces/json/jeune'
import { MotifSuppressionJeune } from 'interfaces/referentiel'
import { ApiError } from 'utils/httpClient'

export interface JeunesService {
  getIdentitesBeneficiaires(idsJeunes: string[]): Promise<BaseJeune[]>

  getJeunesDuConseillerServerSide(
    idConseiller: string,
    accessToken: string
  ): Promise<JeuneFromListe[]>

  getJeunesDuConseillerClientSide(): Promise<JeuneFromListe[]>

  getConseillersDuJeuneServerSide(
    idConseiller: string,
    accessToken: string
  ): Promise<ConseillerHistorique[]>

  getConseillersDuJeuneClientSide(
    idConseiller: string
  ): Promise<ConseillerHistorique[]>

  getJeunesDuConseillerParEmail(
    emailConseiller: string
  ): Promise<{ idConseiller: string; jeunes: JeuneFromListe[] }>

  getJeuneDetails(
    idJeune: string,
    accessToken: string
  ): Promise<DetailJeune | undefined>

  getIdJeuneMilo(
    numeroDossier: string,
    accessToken: string
  ): Promise<string | undefined>

  createCompteJeunePoleEmploi(newJeune: {
    firstName: string
    lastName: string
    email: string
  }): Promise<{ id: string }>

  reaffecter(
    idConseillerInitial: string,
    emailConseillerDestination: string,
    idsJeunes: string[],
    estTemporaire: boolean
  ): Promise<void>

  supprimerJeuneInactif(idJeune: string): Promise<void>

  archiverJeune(
    idJeune: string,
    payload: SuppressionJeuneFormData
  ): Promise<void>

  getMotifsSuppression(): Promise<MotifSuppressionJeune[]>

  getMetadonneesFavorisJeune(
    idJeune: string,
    accessToken: string
  ): Promise<MetadonneesFavoris | undefined>

  modifierIdentifiantPartenaire(
    idJeune: string,
    idPartenaire: string
  ): Promise<void>

  getIndicateursJeuneAlleges(
    idConseiller: string,
    idJeune: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<IndicateursSemaine>

  getIndicateursJeuneComplets(
    idConseiller: string,
    idJeune: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<IndicateursSemaine>

  getJeunesDeLEtablissement(idEtablissement: string): Promise<BaseJeune[]>

  rechercheJeunesDeLEtablissement(
    idEtablissement: string,
    recherche: string
  ): Promise<BaseJeune[]>
}

export class JeunesApiService implements JeunesService {
  constructor(private readonly apiClient: ApiClient) {}

  async getIdentitesBeneficiaires(idsJeunes: string[]): Promise<BaseJeune[]> {
    if (!idsJeunes.length) return []
    const queryParam = idsJeunes.map((id) => 'ids=' + id).join('&')

    const session = await getSession()
    const { content: beneficiaires } = await this.apiClient.get<BaseJeune[]>(
      `/conseillers/${session!.user.id}/jeunes/identites?${queryParam}`,
      session!.accessToken
    )

    return beneficiaires
  }

  async getJeunesDuConseillerServerSide(
    idConseiller: string,
    accessToken: string
  ): Promise<JeuneFromListe[]> {
    return this.getJeunesDuConseiller(idConseiller, accessToken)
  }

  async getJeunesDuConseillerClientSide(): Promise<JeuneFromListe[]> {
    const session = await getSession()
    return this.getJeunesDuConseiller(session!.user.id, session!.accessToken)
  }

  async getJeuneDetails(
    idJeune: string,
    accessToken: string
  ): Promise<DetailJeune | undefined> {
    try {
      const { content: jeune } = await this.apiClient.get<DetailJeuneJson>(
        `/jeunes/${idJeune}`,
        accessToken
      )
      return jsonToDetailJeune(jeune)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return undefined
      }
      throw e
    }
  }

  async getConseillersDuJeuneServerSide(
    idJeune: string,
    accessToken: string
  ): Promise<ConseillerHistorique[]> {
    {
      return this.getConseillersDuJeune(idJeune, accessToken)
    }
  }

  async getConseillersDuJeuneClientSide(
    idJeune: string
  ): Promise<ConseillerHistorique[]> {
    {
      const session = await getSession()
      return this.getConseillersDuJeune(idJeune, session!.accessToken)
    }
  }

  async createCompteJeunePoleEmploi(newJeune: {
    firstName: string
    lastName: string
    email: string
  }): Promise<{ id: string }> {
    const session = await getSession()
    const {
      content: { id },
    } = await this.apiClient.post<{ id: string }>(
      `/conseillers/pole-emploi/jeunes`,
      { ...newJeune, idConseiller: session!.user.id },
      session!.accessToken
    )
    return { id }
  }

  async getJeunesDuConseillerParEmail(
    emailConseiller: string
  ): Promise<{ idConseiller: string; jeunes: JeuneFromListe[] }> {
    const session = await getSession()
    const { content: conseiller } = await this.apiClient.get<Conseiller>(
      `/conseillers?email=${emailConseiller}`,
      session!.accessToken
    )
    const jeunesDuConseiller = await this.getJeunesDuConseillerServerSide(
      conseiller.id,
      session!.accessToken
    )
    return { idConseiller: conseiller.id, jeunes: jeunesDuConseiller }
  }

  async getIdJeuneMilo(
    numeroDossier: string,
    accessToken: string
  ): Promise<string | undefined> {
    try {
      const {
        content: { id },
      } = await this.apiClient.get<{ id: string }>(
        `/conseillers/milo/jeunes/${numeroDossier}`,
        accessToken
      )
      return id
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return undefined
      }
      throw e
    }
  }

  async reaffecter(
    idConseillerInitial: string,
    emailConseillerDestination: string,
    idsJeunes: string[],
    estTemporaire: boolean
  ): Promise<void> {
    const session = await getSession()
    const { content: conseillerDestination } =
      await this.apiClient.get<Conseiller>(
        `/conseillers?email=${emailConseillerDestination}`,
        session!.accessToken
      )
    await this.apiClient.post(
      '/jeunes/transferer',
      {
        idConseillerSource: idConseillerInitial,
        idConseillerCible: conseillerDestination.id,
        idsJeune: idsJeunes,
        estTemporaire: estTemporaire,
      },
      session!.accessToken
    )
  }

  async supprimerJeuneInactif(idJeune: string): Promise<void> {
    const session = await getSession()
    await this.apiClient.delete(`/jeunes/${idJeune}`, session!.accessToken)
  }

  async archiverJeune(
    idJeune: string,
    payload: SuppressionJeuneFormData
  ): Promise<void> {
    const session = await getSession()
    await this.apiClient.post(
      `/jeunes/${idJeune}/archiver`,
      payload,
      session!.accessToken
    )
  }

  async getMotifsSuppression(): Promise<MotifSuppressionJeune[]> {
    const session = await getSession()
    const { content: motifs } = await this.apiClient.get<
      MotifSuppressionJeune[]
    >('/referentiels/motifs-suppression-jeune', session!.accessToken)
    return motifs
  }

  async getMetadonneesFavorisJeune(
    idJeune: string,
    accessToken: string
  ): Promise<MetadonneesFavoris | undefined> {
    try {
      const { content: metadonneesFavoris } = await this.apiClient.get<{
        favoris: MetadonneesFavorisJson
      }>(`/jeunes/${idJeune}/favoris/metadonnees`, accessToken)
      return jsonToMetadonneesFavoris(metadonneesFavoris)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return undefined
      }

      throw e
    }
  }

  async modifierIdentifiantPartenaire(
    idJeune: string,
    idPartenaire: string
  ): Promise<void> {
    const session = await getSession()
    const idConseiller = session?.user.id

    return this.apiClient.put(
      `/conseillers/${idConseiller}/jeunes/${idJeune}`,
      { idPartenaire },
      session!.accessToken
    )
  }

  async getIndicateursJeuneAlleges(
    idConseiller: string,
    idJeune: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<IndicateursSemaine> {
    return this.getIndicateursJeune(
      idConseiller,
      idJeune,
      dateDebut,
      dateFin,
      true
    )
  }

  async getIndicateursJeuneComplets(
    idConseiller: string,
    idJeune: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<IndicateursSemaine> {
    return this.getIndicateursJeune(
      idConseiller,
      idJeune,
      dateDebut,
      dateFin,
      false
    )
  }

  async getJeunesDeLEtablissement(
    idEtablissement: string
  ): Promise<BaseJeune[]> {
    const session = await getSession()
    const { content: jeunes } = await this.apiClient.get<BaseJeuneJson[]>(
      `/etablissements/${idEtablissement}/jeunes`,
      session!.accessToken
    )
    return jeunes.map(jsonToBaseJeune)
  }

  async rechercheJeunesDeLEtablissement(
    idEtablissement: string,
    recherche: string
  ): Promise<BaseJeune[]> {
    const session = await getSession()
    const {
      content: { resultats },
    } = await this.apiClient.get<{
      resultats: Array<{
        jeune: BaseJeune
      }>
    }>(
      `/v2/etablissements/${idEtablissement}/jeunes?q=${recherche}`,
      session!.accessToken
    )

    return resultats.map(({ jeune }) => jeune)
  }

  private async getJeunesDuConseiller(
    idConseiller: string,
    accessToken: string
  ) {
    const { content: jeunes } = await this.apiClient.get<ItemJeuneJson[]>(
      `/conseillers/${idConseiller}/jeunes`,
      accessToken
    )
    return jeunes.map(jsonToItemJeune)
  }

  private async getConseillersDuJeune(
    idJeune: string,
    accessToken: string
  ): Promise<ConseillerHistorique[]> {
    {
      try {
        const { content: historique } = await this.apiClient.get<
          ConseillerHistoriqueJson[]
        >(`/jeunes/${idJeune}/conseillers`, accessToken)
        return historique.map(toConseillerHistorique)
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) {
          return []
        }
        throw e
      }
    }
  }

  private async getIndicateursJeune(
    idConseiller: string,
    idJeune: string,
    dateDebut: DateTime,
    dateFin: DateTime,
    exclureOffresEtFavoris: boolean
  ): Promise<IndicateursSemaine> {
    const session = await getSession()
    const dateDebutUrlEncoded = encodeURIComponent(dateDebut.toISO())
    const dateFinUrlEncoded = encodeURIComponent(dateFin.toISO())

    const { content: indicateurs } =
      await this.apiClient.get<IndicateursSemaineJson>(
        `/conseillers/${idConseiller}/jeunes/${idJeune}/indicateurs?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}&exclureOffresEtFavoris=${exclureOffresEtFavoris}`,
        session!.accessToken
      )
    return jsonToIndicateursSemaine(indicateurs)
  }
}
