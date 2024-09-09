'use server'

import { revalidateTag } from 'next/cache'

import { apiPut } from 'clients/api.client'
import { ActionFormData, actionStatusToJson } from 'interfaces/json/action'
import { getSessionServerSide } from 'utils/auth/auth'

export async function modifierAction(
  idAction: string,
  modifications: Partial<ActionFormData>
): Promise<void> {
  const session = await getSessionServerSide()

  const actionModifiee = {
    status: modifications.statut
      ? actionStatusToJson(modifications.statut)
      : undefined,
    contenu: modifications.titre,
    description: modifications.description,
    dateEcheance: modifications.dateEcheance,
    dateFinReelle: modifications.dateFinReelle,
    codeQualification: modifications.codeCategorie,
  }

  await apiPut(`/actions/${idAction}`, actionModifiee, session!.accessToken)
  revalidateTag('action-' + idAction)
}
