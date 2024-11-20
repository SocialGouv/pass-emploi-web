import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import {
  BaseBeneficiaire,
  BeneficiaireEtablissement,
  BeneficiaireFromListe,
  CompteursPeriode,
  ConseillerHistorique,
  Demarche,
  DetailBeneficiaire,
  IndicateursSemaine,
} from 'interfaces/beneficiaire'
import {
  BaseBeneficiaireJson,
  BeneficiaireEtablissementJson,
  CompteursPortefeuilleJson,
  DemarcheJson,
  DetailBeneficiaireJson,
  IndicateursSemaineJson,
  ItemBeneficiaireJson,
  jsonToBaseBeneficiaire,
  jsonToBeneficiaireEtablissement,
  jsonToDemarche,
  jsonToDetailBeneficiaire,
  jsonToIndicateursSemaine,
  jsonToItemBeneficiaire,
  SuppressionBeneficiaireFormData,
} from 'interfaces/json/beneficiaire'
import {
  ConseillerHistoriqueJson,
  toConseillerHistorique,
} from 'interfaces/json/conseiller'
import { MotifSuppressionBeneficiaire } from 'interfaces/referentiel'
import { MetadonneesPagination } from 'types/pagination'
import { ApiError } from 'utils/httpClient'

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
      'beneficiaire'
    )
    return jsonToDetailBeneficiaire(jeune)
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
    return getConseillersDuBeneficiaire(idJeune, accessToken)
  }
}

export async function getConseillersDuJeuneClientSide(
  idJeune: string
): Promise<ConseillerHistorique[]> {
  {
    const session = await getSession()
    return getConseillersDuBeneficiaire(idJeune, session!.accessToken)
  }
}

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
      'milo'
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
  payload: SuppressionBeneficiaireFormData
): Promise<void> {
  const session = await getSession()
  await apiPost(`/jeunes/${idJeune}/archiver`, payload, session!.accessToken)
}

export async function getMotifsSuppression(): Promise<
  MotifSuppressionBeneficiaire[]
> {
  const session = await getSession()
  const { content: motifs } = await apiGet<MotifSuppressionBeneficiaire[]>(
    '/referentiels/motifs-suppression-jeune',
    session!.accessToken,
    'referentiel'
  )
  return motifs
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

async function getBeneficiairesDeLEtablissement(
  idEtablissement: string,
  accessToken: string
): Promise<BaseBeneficiaire[]> {
  const { content: beneficiaires } = await apiGet<BaseBeneficiaireJson[]>(
    `/etablissements/${idEtablissement}/jeunes`,
    accessToken,
    'beneficiaires'
  )
  return beneficiaires.map(jsonToBaseBeneficiaire)
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
  }>(url, accessToken, 'portefeuille')

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
    'portefeuille'
  )

  return {
    metadonnees: {
      nombrePages: Math.ceil(pagination.total / pagination.limit),
      nombreTotal: pagination.total,
    },
    beneficiaires: resultats.map(jsonToBeneficiaireEtablissement),
  }
}

async function getBeneficiairesDuConseiller(
  idConseiller: string,
  accessToken: string
): Promise<BeneficiaireFromListe[]> {
  const { content: beneficiaires } = await apiGet<ItemBeneficiaireJson[]>(
    `/conseillers/${idConseiller}/jeunes`,
    accessToken,
    'portefeuille'
  )
  return beneficiaires.map(jsonToItemBeneficiaire)
}

async function getConseillersDuBeneficiaire(
  idBeneficiaire: string,
  accessToken: string
): Promise<ConseillerHistorique[]> {
  {
    try {
      const { content: historique } = await apiGet<ConseillerHistoriqueJson[]>(
        `/jeunes/${idBeneficiaire}/conseillers`,
        accessToken,
        'conseillers'
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
    'agenda'
  )
  return jsonToIndicateursSemaine(indicateurs)
}

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
    'actions'
  )

  return counts.map(({ idBeneficiaire, actions, rdvs, sessions }) => {
    return {
      idBeneficiaire,
      actions,
      rdvs: Number(rdvs) + Number(sessions),
    }
  })
}

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
    'beneficiaires'
  )

  return beneficiaires
}

export async function getDemarchesBeneficiaire(
  idBeneficiaire: string,
  dateDebut: DateTime,
  idConseiller: string,
  accessToken: string
): Promise<{ data: Demarche[]; isStale: boolean } | null> {
  const dateDebutUrlEncoded = encodeURIComponent(dateDebut.toISO())
  try {
    const {
      content: { queryModel: demarchesJson, dateDuCache },
    } = await apiGet<{ queryModel: DemarcheJson[]; dateDuCache?: string }>(
      `/conseillers/${idConseiller}/jeunes/${idBeneficiaire}/demarches?dateDebut=${dateDebutUrlEncoded}`,
      accessToken,
      'actions'
    )

    return {
      data: demarchesJson.map(jsonToDemarche),
      isStale: Boolean(dateDuCache),
    }
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) return null
    throw e
  }
}
