import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import {
  BaseBeneficiaire,
  BeneficiaireEtablissement,
  BeneficiaireFromListe,
  CompteursPeriode,
  DetailBeneficiaire,
  IndicateursSemaine,
} from 'interfaces/beneficiaire'
import {
  BaseBeneficiaireJson,
  BeneficiaireEtablissementJson,
  BeneficiaireMiloFormData,
  CompteursPortefeuilleJson,
  DetailBeneficiaireJson,
  IndicateursSemaineJson,
  ItemBeneficiaireJson,
  jsonToBaseBeneficiaire,
  jsonToBeneficiaireEtablissement,
  jsonToDetailBeneficiaire,
  jsonToIndicateursSemaine,
  jsonToItemBeneficiaire,
  SuppressionBeneficiaireFormData,
} from 'interfaces/json/beneficiaire'
import { CACHE_TAGS, TAG_MILO_FIXME } from 'services/cache-tags'
import { MetadonneesPagination } from 'types/pagination'
import { ApiError } from 'utils/httpClient'

// ******* READ *******
export async function getIdentitesBeneficiairesServerSide(
  idsBeneficiaires: string[],
  idConseiller: string,
  accessToken: string
): Promise<BaseBeneficiaire[]> {
  return getIdentitesBeneficiaires(idsBeneficiaires, idConseiller, accessToken)
}

export async function getIdentitesBeneficiairesClientSide(
  idsBeneficiaires: string[]
): Promise<BaseBeneficiaire[]> {
  const session = await getSession()
  return getIdentitesBeneficiaires(
    idsBeneficiaires,
    session!.user.id,
    session!.accessToken
  )
}

export async function getBeneficiairesDuConseillerServerSide(
  idConseiller: string,
  accessToken: string
): Promise<BeneficiaireFromListe[]> {
  return getBeneficiairesDuConseiller(idConseiller, accessToken)
}

export async function getBeneficiairesDuConseillerClientSide(): Promise<
  BeneficiaireFromListe[]
> {
  const session = await getSession()
  return getBeneficiairesDuConseiller(session!.user.id, session!.accessToken)
}

export async function getJeunesDuConseillerParId(
  idConseiller: string
): Promise<BeneficiaireFromListe[]> {
  const session = await getSession()
  return getBeneficiairesDuConseiller(idConseiller, session!.accessToken)
}

export async function getJeuneDetails(
  idJeune: string,
  accessToken: string
): Promise<DetailBeneficiaire | undefined> {
  try {
    const { content: jeune } = await apiGet<DetailBeneficiaireJson>(
      `/jeunes/${idJeune}`,
      accessToken,
      CACHE_TAGS.BENEFICIAIRE.SINGLETON
    )
    return jsonToDetailBeneficiaire(jeune)
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) {
      return undefined
    }
    throw e
  }
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
      accessToken,
      TAG_MILO_FIXME
    )
    return id
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) {
      return undefined
    }
    throw e
  }
}

export async function getIndicateursJeuneAlleges(
  idConseiller: string,
  idBeneficiaire: string,
  dateDebut: DateTime,
  dateFin: DateTime
): Promise<IndicateursSemaine> {
  return getIndicateursBeneficiaire(
    idConseiller,
    idBeneficiaire,
    dateDebut,
    dateFin,
    true
  )
}

export async function getIndicateursJeuneComplets(
  idConseiller: string,
  idBeneficiaire: string,
  dateDebut: DateTime,
  dateFin: DateTime
): Promise<IndicateursSemaine> {
  return getIndicateursBeneficiaire(
    idConseiller,
    idBeneficiaire,
    dateDebut,
    dateFin,
    false
  )
}

export async function getBeneficiairesDeLEtablissementClientSide(
  idEtablissement: string
): Promise<BaseBeneficiaire[]> {
  const session = await getSession()
  return getBeneficiairesDeLEtablissement(idEtablissement, session!.accessToken)
}

export async function getBeneficiairesDeLaStructureMilo(
  idStructureMilo: string,
  accessToken: string
): Promise<{
  beneficiaires: BeneficiaireEtablissement[]
}> {
  let url = `/structures-milo/${idStructureMilo}/jeunes`

  const {
    content: { resultats },
  } = await apiGet<{
    resultats: BeneficiaireEtablissementJson[]
  }>(url, accessToken, CACHE_TAGS.BENEFICIAIRE.LISTE)

  return {
    beneficiaires: resultats.map(jsonToBeneficiaireEtablissement),
  }
}

export async function rechercheBeneficiairesDeLEtablissement(
  idEtablissement: string,
  recherche: string,
  page: number
): Promise<{
  beneficiaires: BeneficiaireEtablissement[]
  metadonnees: MetadonneesPagination
}> {
  const session = await getSession()
  const {
    content: { pagination, resultats },
  } = await apiGet<{
    pagination: { total: number; limit: number }
    resultats: BeneficiaireEtablissementJson[]
  }>(
    `/v2/etablissements/${idEtablissement}/jeunes?q=${recherche}&page=${page}`,
    session!.accessToken,
    CACHE_TAGS.BENEFICIAIRE.LISTE
  )

  return {
    metadonnees: {
      nombrePages: Math.ceil(pagination.total / pagination.limit),
      nombreTotal: pagination.total,
    },
    beneficiaires: resultats.map(jsonToBeneficiaireEtablissement),
  }
}

// FIXME move ?
export async function recupereCompteursBeneficiairesPortefeuilleMilo(
  idConseiller: string,
  dateDebut: DateTime,
  dateFin: DateTime,
  accessToken: string
): Promise<CompteursPeriode[]> {
  const dateDebutUrlEncoded = encodeURIComponent(dateDebut.toISO())
  const dateFinUrlEncoded = encodeURIComponent(dateFin.toISO())

  const { content: counts } = await apiGet<CompteursPortefeuilleJson[]>(
    `/conseillers/milo/${idConseiller}/compteurs-portefeuille?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}`,
    accessToken,
    [CACHE_TAGS.ACTION.LISTE, CACHE_TAGS.EVENEMENT.LISTE]
  )

  return counts.map(({ idBeneficiaire, actions, rdvs, sessions }) => {
    return {
      idBeneficiaire,
      actions,
      rdvs: Number(rdvs) + Number(sessions),
    }
  })
}

// ******* WRITE *******
export async function createCompteJeuneFranceTravail(newJeune: {
  firstName: string
  lastName: string
  email: string
}): Promise<BaseBeneficiaire> {
  const session = await getSession()
  const { content } = await apiPost<BaseBeneficiaireJson>(
    `/conseillers/pole-emploi/jeunes`,
    { ...newJeune, idConseiller: session!.user.id },
    session!.accessToken
  )
  return jsonToBaseBeneficiaire(content)
}

export async function createCompteJeuneMilo(
  newJeune: BeneficiaireMiloFormData,
  surcharge?: boolean
): Promise<BaseBeneficiaire> {
  const session = await getSession()
  const { content } = await apiPost<BaseBeneficiaire>(
    `/conseillers/milo/jeunes`,
    {
      ...newJeune,
      idConseiller: session!.user.id,
      surcharge,
    },
    session!.accessToken
  )
  return content
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

export async function recupererBeneficiaires(): Promise<void> {
  const session = await getSession()
  await apiPost(
    `/conseillers/${session!.user.id}/recuperer-mes-jeunes`,
    {},
    session!.accessToken
  )
}

export async function supprimerJeuneInactif(idJeune: string): Promise<void> {
  const session = await getSession()
  await apiDelete(`/jeunes/${idJeune}`, session!.accessToken)
}

export async function archiverJeune(
  idJeune: string,
  payload: SuppressionBeneficiaireFormData
): Promise<void> {
  const session = await getSession()
  await apiPost(`/jeunes/${idJeune}/archiver`, payload, session!.accessToken)
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

// ******* PRIVATE *******
async function getIdentitesBeneficiaires(
  idsBeneficiaires: string[],
  idConseiller: string,
  accessToken: string
): Promise<BaseBeneficiaire[]> {
  if (!idsBeneficiaires.length) return []
  const queryParam = idsBeneficiaires.map((id) => 'ids=' + id).join('&')

  const { content: beneficiaires } = await apiGet<BaseBeneficiaire[]>(
    `/conseillers/${idConseiller}/jeunes/identites?${queryParam}`,
    accessToken,
    CACHE_TAGS.BENEFICIAIRE.LISTE
  )

  return beneficiaires
}

async function getBeneficiairesDeLEtablissement(
  idEtablissement: string,
  accessToken: string
): Promise<BaseBeneficiaire[]> {
  const { content: beneficiaires } = await apiGet<BaseBeneficiaireJson[]>(
    `/etablissements/${idEtablissement}/jeunes`,
    accessToken,
    CACHE_TAGS.BENEFICIAIRE.LISTE
  )
  return beneficiaires.map(jsonToBaseBeneficiaire)
}

async function getBeneficiairesDuConseiller(
  idConseiller: string,
  accessToken: string
): Promise<BeneficiaireFromListe[]> {
  const { content: beneficiaires } = await apiGet<ItemBeneficiaireJson[]>(
    `/conseillers/${idConseiller}/jeunes`,
    accessToken,
    CACHE_TAGS.BENEFICIAIRE.LISTE
  )
  return beneficiaires.map(jsonToItemBeneficiaire)
}

// FIXME move ?
async function getIndicateursBeneficiaire(
  idConseiller: string,
  idBeneficiaire: string,
  dateDebut: DateTime,
  dateFin: DateTime,
  exclureOffresEtFavoris: boolean
): Promise<IndicateursSemaine> {
  const session = await getSession()
  const dateDebutUrlEncoded = encodeURIComponent(dateDebut.toISO())
  const dateFinUrlEncoded = encodeURIComponent(dateFin.toISO())

  const { content: indicateurs } = await apiGet<IndicateursSemaineJson>(
    `/conseillers/${idConseiller}/jeunes/${idBeneficiaire}/indicateurs?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}&exclureOffresEtFavoris=${exclureOffresEtFavoris}`,
    session!.accessToken,
    [CACHE_TAGS.ACTION.LISTE, CACHE_TAGS.EVENEMENT.LISTE]
  )
  return jsonToIndicateursSemaine(indicateurs)
}
