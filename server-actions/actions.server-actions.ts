'use server'

import { apiPost, apiPut } from 'clients/api.client'
import {
  ActionFormData,
  actionStatusToJson,
  QualificationActionJson,
} from 'interfaces/json/action'
import { ACTION_CACHE_TAG } from 'services/actions.service'
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

  await apiPut(
    `/actions/${idAction}`,
    actionModifiee,
    session!.accessToken,
    Object.values(ACTION_CACHE_TAG)
  )
}

export async function qualifier(
  idAction: string,
  type: string,
  options?: {
    dateFinModifiee?: string
    commentaire?: string
  }
) {
  const session = await getSessionServerSide()

  const payload: {
    codeQualification: string
    dateFinReelle?: string
    commentaireQualification?: string
  } = { codeQualification: type }

  if (options?.dateFinModifiee) payload.dateFinReelle = options.dateFinModifiee
  if (options?.commentaire)
    payload.commentaireQualification = options.commentaire

  await apiPost<QualificationActionJson>(
    `/actions/${idAction}/qualifier`,
    payload,
    session!.accessToken,
    Object.values(ACTION_CACHE_TAG)
  )
}
