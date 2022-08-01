import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import { Conseiller } from 'interfaces/conseiller'
import {
  ConseillerHistorique,
  DetailJeune,
  JeuneFromListe,
  RecherchesSauvegardees,
} from 'interfaces/jeune'
import {
  ConseillerHistoriqueJson,
  toConseillerHistorique,
} from 'interfaces/json/conseiller'
import {
  DetailJeuneJson,
  ItemJeuneJson,
  jsonToDetailJeune,
  jsonToItemJeune,
  jsonToRecherchesSauvegardees,
  RecherchesSauvegardeesJson,
  SuppressionJeuneFormData,
} from 'interfaces/json/jeune'
import { ApiError } from 'utils/httpClient'

export interface JeunesService {
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

  getMotifsSuppression(): Promise<string[]>

  getJeuneRecherchesSauvegardees(
    idConseiller: string,
    idJeune: string,
    accessToken: string
  ): Promise<RecherchesSauvegardees | undefined>
}

export class JeunesApiService implements JeunesService {
  constructor(private readonly apiClient: ApiClient) {}

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

  async getMotifsSuppression(): Promise<string[]> {
    const session = await getSession()
    const { content: motifs } = await this.apiClient.get<string[]>(
      '/referentiels/motifs-suppression-jeune',
      session!.accessToken
    )
    return motifs
  }

  async getJeuneRecherchesSauvegardees(
    idConseiller: string,
    idJeune: string,
    accessToken: string
  ): Promise<RecherchesSauvegardees | undefined> {
    try {
      const { content: recherchesSauvegardees } = await this.apiClient.get<{
        favoris: RecherchesSauvegardeesJson
      }>(
        `/conseillers/${idConseiller}/jeunes/${idJeune}/metadonnees`,
        accessToken
      )
      return jsonToRecherchesSauvegardees(recherchesSauvegardees)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return undefined
      }

      throw e
    }
  }
}
