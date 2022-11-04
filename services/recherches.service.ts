import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import {
  dureeToQueryParam,
  SearchOffresEmploiQuery,
} from 'services/offres-emploi.service'

type CriteresRechercheOffreEmploi = {
  titre: string
  metier?: string
  localisation?: string
  criteres: JsonCriteresRechercheOffreEmploi
}

type JsonCriteresRechercheOffreEmploi = {
  q?: string
  departement?: string
  alternance?: boolean
  experience?: string[]
  debutantAccepte?: boolean
  contrat?: string[]
  duree?: string[]
  commune?: string
  rayon?: number
}

export interface RecherchesService {
  postCriteresRechercheOffreEmploi(
    jeuneIds: string[],
    critereDeRecherche: SearchOffresEmploiQuery,
    titre: string,
    localiteLabel?: string
  ): Promise<void>
}

export class RecherchesApiService implements RecherchesService {
  constructor(private readonly apiClient: ApiClient) {}

  async postCriteresRechercheOffreEmploi(
    jeuneIds: string[],
    critereDeRecherche: SearchOffresEmploiQuery,
    titre: string,
    localiteLabel?: string
  ): Promise<void> {
    const session = await getSession()
    const accessToken = session!.accessToken

    const formatedQuery = formatSearchOffreEmploiQuery(
      critereDeRecherche,
      titre,
      localiteLabel
    )

    await Promise.all([
      jeuneIds.map((jeuneId) => {
        this.postCriteresRechercheOffreEmploiPourUnJeune(
          accessToken,
          jeuneId,
          formatedQuery
        )
      }),
    ])
  }

  async postCriteresRechercheOffreEmploiPourUnJeune(
    accessToken: string,
    jeuneId: string,
    formatedQuery: CriteresRechercheOffreEmploi
  ): Promise<void> {
    //TODO-1027 est-ce qu'on veut try-catcher ? Si oui, on retourne qyoi
    await this.apiClient.post(
      `/jeunes/${jeuneId}/recherches/offres-emploi`,
      formatedQuery,
      accessToken
    )
  }
}

function formatSearchOffreEmploiQuery(
  criteres: SearchOffresEmploiQuery,
  titre: string,
  localiteLabel?: string
): CriteresRechercheOffreEmploi {
  return {
    titre: titre,
    metier: criteres.motsCles,
    localisation: localiteLabel,
    criteres: {
      q: criteres.motsCles,
      departement: criteres.departement?.code,
      debutantAccepte: criteres.debutantAccepte,
      contrat: criteres.typesContrats,
      duree: criteres.durees?.map((duree) => dureeToQueryParam(duree)),
      commune: criteres.commune?.code,
      rayon: criteres.rayon,
    },
  }
}
