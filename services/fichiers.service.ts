import { getSession } from 'next-auth/react'

import { apiDelete, apiPostFile } from 'clients/api.client'
import { InfoFichier } from 'interfaces/fichier'

export async function uploadFichier(
  idsJeunes: string[],
  idsListes: string[],
  fichier: File
): Promise<InfoFichier> {
  const session = await getSession()

  const formData = new FormData()
  idsJeunes.forEach((idJeune) => {
    formData.append('jeunesIds', idJeune)
  })
  idsListes.forEach((idListe) => {
    formData.append('listesDeDiffusionIds', idListe)
  })
  formData.append('fichier', fichier)
  formData.append('nom', fichier.name)

  return apiPostFile(`/fichiers`, formData, session!.accessToken)
}

export async function deleteFichier(idFichier: string): Promise<void> {
  const session = await getSession()
  return apiDelete(`/fichiers/${idFichier}`, session!.accessToken)
}
