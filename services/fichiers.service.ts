import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import { InfoFichier } from 'interfaces/fichier'

export interface FichiersService {
  uploadFichier(
    idsJeunes: string[],
    idsListesDeDiffusion: string[],
    fichier: File
  ): Promise<InfoFichier>

  deleteFichier(idFichier: string): Promise<void>
}

export class FichiersApiService implements FichiersService {
  constructor(private readonly apiClient: ApiClient) {}

  async uploadFichier(
    idsJeunes: string[],
    idsListesDeDiffusion: string[],
    fichier: File
  ): Promise<InfoFichier> {
    const session = await getSession()

    const formData = new FormData()
    idsJeunes.forEach((idJeune) => {
      formData.append('jeunesIds', idJeune)
    })
    idsListesDeDiffusion.forEach((idListe) => {
      formData.append('listesDeDiffusionIds', idListe)
    })
    formData.append('fichier', fichier)
    formData.append('nom', fichier.name)

    return this.apiClient.postFile(`/fichiers`, formData, session!.accessToken)
  }

  async deleteFichier(idFichier: string): Promise<void> {
    const session = await getSession()
    return this.apiClient.delete(`/fichiers/${idFichier}`, session!.accessToken)
  }
}
