import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import {
  BaseBeneficiaire,
  ConseillerHistorique,
  DetailBeneficiaire,
  IndicateursSemaine,
  BeneficiaireEtablissement,
  BeneficiaireFromListe,
  MetadonneesFavoris,
} from 'interfaces/beneficiaire'
import {
  ConseillerHistoriqueJson,
  toConseillerHistorique,
} from 'interfaces/json/conseiller'
import {
  BaseJeuneJson,
  DetailJeuneJson,
  IndicateursSemaineJson,
  ItemJeuneJson,
  JeuneEtablissementJson,
  jsonToBaseJeune,
  jsonToDetailJeune,
  jsonToIndicateursSemaine,
  jsonToItemJeune,
  jsonToJeuneEtablissement,
  jsonToMetadonneesFavoris,
  MetadonneesFavorisJson,
  SuppressionJeuneFormData,
} from 'interfaces/json/jeune'
import { MotifSuppressionJeune } from 'interfaces/referentiel'
import { MetadonneesPagination } from 'types/pagination'
import { ApiError } from 'utils/httpClient'

export async function getIdentitesBeneficiairesServerSide(
  idsJeunes: string[],
  idConseiller: string,
  accessToken: string
): Promise<BaseBeneficiaire[]> {
  return getIdentitesBeneficiaires(idsJeunes, idConseiller, accessToken)
}

export async function getIdentitesBeneficiairesClientSide(
  idsJeunes: string[]
): Promise<BaseBeneficiaire[]> {
  const session = await getSession()
  return getIdentitesBeneficiaires(
    idsJeunes,
    session!.user.id,
    session!.accessToken
  )
}

export async function getJeunesDuConseillerServerSide(
  idConseiller: string,
  accessToken: string
): Promise<BeneficiaireFromListe[]> {
  return getJeunesDuConseiller(idConseiller, accessToken)
}

export async function getJeunesDuConseillerClientSide(): Promise<
  BeneficiaireFromListe[]
> {
  const session = await getSession()
  return getJeunesDuConseiller(session!.user.id, session!.accessToken)
}

export async function getJeunesDuConseillerParId(
  idConseiller: string
): Promise<BeneficiaireFromListe[]> {
  const session = await getSession()
  return getJeunesDuConseiller(idConseiller, session!.accessToken)
}

export async function getJeuneDetails(
  idJeune: string,
  accessToken: string
): Promise<DetailBeneficiaire | undefined> {
  try {
    const { content: jeune } = await apiGet<DetailJeuneJson>(
      `/jeunes/${idJeune}`,
      accessToken
    )
    return jsonToDetailJeune(jeune)
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) {
      return undefined
    }
    throw e
  }
}

export async function getConseillersDuJeuneServerSide(
  idJeune: string,
  accessToken: string
): Promise<ConseillerHistorique[]> {
  {
    return getConseillersDuJeune(idJeune, accessToken)
  }
}

export async function getConseillersDuJeuneClientSide(
  idJeune: string
): Promise<ConseillerHistorique[]> {
  {
    const session = await getSession()
    return getConseillersDuJeune(idJeune, session!.accessToken)
  }
}

export async function createCompteJeunePoleEmploi(newJeune: {
  firstName: string
  lastName: string
  email: string
}): Promise<BaseBeneficiaire> {
  const session = await getSession()
  const { content } = await apiPost<BaseJeuneJson>(
    `/conseillers/pole-emploi/jeunes`,
    { ...newJeune, idConseiller: session!.user.id },
    session!.accessToken
  )
  return jsonToBaseJeune(content)
}

export async function getIdJeuneMilo(
  numeroDossier: string,
  accessToken: string
): Promise<string | undefined> {
  try {
    const {
      content: { id },
    } = await apiGet<{ id: string }>(
      `/conseillers/milo/jeunes/${numeroDossier}`,
      accessToken
    )
    return id
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) {
      return undefined
    }
    throw e
  }
}

export async function reaffecter(
  idConseillerInitial: string,
  idConseillerDestination: string,
  idsJeunes: string[],
  estTemporaire: boolean
): Promise<void> {
  const session = await getSession()
  await apiPost(
    '/jeunes/transferer',
    {
      idConseillerSource: idConseillerInitial,
      idConseillerCible: idConseillerDestination,
      idsJeune: idsJeunes,
      estTemporaire: estTemporaire,
    },
    session!.accessToken
  )
}

export async function supprimerJeuneInactif(idJeune: string): Promise<void> {
  const session = await getSession()
  await apiDelete(`/jeunes/${idJeune}`, session!.accessToken)
}

export async function archiverJeune(
  idJeune: string,
  payload: SuppressionJeuneFormData
): Promise<void> {
  const session = await getSession()
  await apiPost(`/jeunes/${idJeune}/archiver`, payload, session!.accessToken)
}

export async function getMotifsSuppression(): Promise<MotifSuppressionJeune[]> {
  const session = await getSession()
  const { content: motifs } = await apiGet<MotifSuppressionJeune[]>(
    '/referentiels/motifs-suppression-jeune',
    session!.accessToken
  )
  return motifs
}

export async function getMetadonneesFavorisJeune(
  idJeune: string,
  accessToken: string
): Promise<MetadonneesFavoris | undefined> {
  try {
    const { content: metadonneesFavoris } = await apiGet<{
      favoris: MetadonneesFavorisJson
    }>(`/jeunes/${idJeune}/favoris/metadonnees`, accessToken)
    return jsonToMetadonneesFavoris(metadonneesFavoris)
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) {
      return undefined
    }

    throw e
  }
}

export async function modifierIdentifiantPartenaire(
  idJeune: string,
  idPartenaire: string
): Promise<void> {
  const session = await getSession()
  const idConseiller = session?.user.id

  return apiPut(
    `/conseillers/${idConseiller}/jeunes/${idJeune}`,
    { idPartenaire },
    session!.accessToken
  )
}

export async function getIndicateursJeuneAlleges(
  idConseiller: string,
  idJeune: string,
  dateDebut: DateTime,
  dateFin: DateTime
): Promise<IndicateursSemaine> {
  return getIndicateursJeune(idConseiller, idJeune, dateDebut, dateFin, true)
}

export async function getIndicateursJeuneComplets(
  idConseiller: string,
  idJeune: string,
  dateDebut: DateTime,
  dateFin: DateTime
): Promise<IndicateursSemaine> {
  return getIndicateursJeune(idConseiller, idJeune, dateDebut, dateFin, false)
}

export async function getJeunesDeLEtablissementClientSide(
  idEtablissement: string
): Promise<BaseBeneficiaire[]> {
  const session = await getSession()
  return getJeunesDeLEtablissement(idEtablissement, session!.accessToken)
}

async function getJeunesDeLEtablissement(
  idEtablissement: string,
  accessToken: string
) {
  const { content: jeunes } = await apiGet<BaseJeuneJson[]>(
    `/etablissements/${idEtablissement}/jeunes`,
    accessToken
  )
  return jeunes.map(jsonToBaseJeune)
}

export async function getBeneficiairesDeLaStructureMilo(
  idStructureMilo: string,
  accessToken: string
): Promise<{
  jeunes: BeneficiaireEtablissement[]
}> {
  let url = `/structures-milo/${idStructureMilo}/jeunes`

  const {
    content: { resultats },
  } = await apiGet<{
    resultats: JeuneEtablissementJson[]
  }>(url, accessToken)

  return {
    jeunes: resultats.map(jsonToJeuneEtablissement),
  }
}

export async function rechercheJeunesDeLEtablissement(
  idEtablissement: string,
  recherche: string,
  page: number
): Promise<{
  jeunes: BeneficiaireEtablissement[]
  metadonnees: MetadonneesPagination
}> {
  const session = await getSession()
  const {
    content: { pagination, resultats },
  } = await apiGet<{
    pagination: { total: number; limit: number }
    resultats: JeuneEtablissementJson[]
  }>(
    `/v2/etablissements/${idEtablissement}/jeunes?q=${recherche}&page=${page}`,
    session!.accessToken
  )

  return {
    metadonnees: {
      nombrePages: Math.ceil(pagination.total / pagination.limit),
      nombreTotal: pagination.total,
    },
    jeunes: resultats.map(jsonToJeuneEtablissement),
  }
}

async function getJeunesDuConseiller(
  idConseiller: string,
  accessToken: string
) {
  const { content: jeunes } = await apiGet<ItemJeuneJson[]>(
    `/conseillers/${idConseiller}/jeunes`,
    accessToken
  )
  return jeunes.map(jsonToItemJeune)
}

async function getConseillersDuJeune(
  idJeune: string,
  accessToken: string
): Promise<ConseillerHistorique[]> {
  {
    try {
      const { content: historique } = await apiGet<ConseillerHistoriqueJson[]>(
        `/jeunes/${idJeune}/conseillers`,
        accessToken
      )
      return historique.map(toConseillerHistorique)
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 404) {
        return []
      }
      throw e
    }
  }
}

async function getIndicateursJeune(
  idConseiller: string,
  idJeune: string,
  dateDebut: DateTime,
  dateFin: DateTime,
  exclureOffresEtFavoris: boolean
): Promise<IndicateursSemaine> {
  const session = await getSession()
  const dateDebutUrlEncoded = encodeURIComponent(dateDebut.toISO())
  const dateFinUrlEncoded = encodeURIComponent(dateFin.toISO())

  const { content: indicateurs } = await apiGet<IndicateursSemaineJson>(
    `/conseillers/${idConseiller}/jeunes/${idJeune}/indicateurs?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}&exclureOffresEtFavoris=${exclureOffresEtFavoris}`,
    session!.accessToken
  )
  return jsonToIndicateursSemaine(indicateurs)
}

async function getIdentitesBeneficiaires(
  idsJeunes: string[],
  idConseiller: string,
  accessToken: string
): Promise<BaseBeneficiaire[]> {
  if (!idsJeunes.length) return []
  const queryParam = idsJeunes.map((id) => 'ids=' + id).join('&')

  const { content: beneficiaires } = await apiGet<BaseBeneficiaire[]>(
    `/conseillers/${idConseiller}/jeunes/identites?${queryParam}`,
    accessToken
  )

  return beneficiaires
}
