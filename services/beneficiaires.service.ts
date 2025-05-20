import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { apiDelete, apiGet, apiPatch, apiPost } from 'clients/api.client'
import {
  BeneficiaireEtablissement,
  BeneficiaireFromListe,
  CompteurHeuresFicheBeneficiaire,
  CompteurHeuresPortefeuille,
  ConseillerHistorique,
  Demarche,
  DetailBeneficiaire,
  IdentiteBeneficiaire,
  IndicateursSemaine,
  MetadonneesFavoris,
} from 'interfaces/beneficiaire'
import {
  BaseBeneficiaireJson,
  BeneficiaireEtablissementJson,
  CompteurHeuresFicheBeneficiaireJson,
  CompteursHeuresDeclareesPortefeuilleJson,
  DemarcheJson,
  DetailBeneficiaireJson,
  IndicateursSemaineJson,
  ItemBeneficiaireJson,
  jsonToBaseBeneficiaire,
  jsonToBeneficiaireEtablissement,
  jsonToComptageHeuresPortefeuille,
  jsonToDemarche,
  jsonToDetailBeneficiaire,
  jsonToIndicateursSemaine,
  jsonToItemBeneficiaire,
  jsonToMetadonneesFavoris,
  MetadonneesFavorisJson,
  SuppressionBeneficiaireFormData,
} from 'interfaces/json/beneficiaire'
import {
  ConseillerHistoriqueJson,
  toConseillerHistorique,
} from 'interfaces/json/conseiller'
import { MotifSuppressionBeneficiaire } from 'interfaces/referentiel'
import { Periode } from 'types/dates'
import { MetadonneesPagination } from 'types/pagination'
import { ApiError } from 'utils/httpClient'

export async function getIdentitesBeneficiairesServerSide(
  idsBeneficiaires: string[],
  idConseiller: string,
  accessToken: string
): Promise<IdentiteBeneficiaire[]> {
  return getIdentitesBeneficiaires(idsBeneficiaires, idConseiller, accessToken)
}

export async function getIdentitesBeneficiairesClientSide(
  idsBeneficiaires: string[]
): Promise<IdentiteBeneficiaire[]> {
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
      accessToken
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
  return getConseillersDuBeneficiaire(idJeune, accessToken)
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
}): Promise<IdentiteBeneficiaire> {
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

export async function modifierDispositif(
  idJeune: string,
  dispositif: string
): Promise<void> {
  const session = await getSession()
  const idConseiller = session?.user.id

  return apiPatch(
    `/conseillers/${idConseiller}/jeunes/${idJeune}`,
    { dispositif },
    session!.accessToken
  )
}

export async function modifierIdentifiantPartenaire(
  idJeune: string,
  idPartenaire: string
): Promise<void> {
  const session = await getSession()
  const idConseiller = session?.user.id

  return apiPatch(
    `/conseillers/${idConseiller}/jeunes/${idJeune}`,
    { idPartenaire },
    session!.accessToken
  )
}

export async function getIndicateursBeneficiaire(
  idConseiller: string,
  idBeneficiaire: string,
  dateDebut: DateTime,
  dateFin: DateTime
): Promise<IndicateursSemaine> {
  const session = await getSession()
  const dateDebutUrlEncoded = encodeURIComponent(dateDebut.toISO())
  const dateFinUrlEncoded = encodeURIComponent(dateFin.toISO())

  const { content: indicateurs } = await apiGet<IndicateursSemaineJson>(
    `/conseillers/${idConseiller}/jeunes/${idBeneficiaire}/indicateurs?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}`,
    session!.accessToken
  )
  return jsonToIndicateursSemaine(indicateurs)
}

export async function getBeneficiairesDeLEtablissementClientSide(
  idEtablissement: string
): Promise<IdentiteBeneficiaire[]> {
  const session = await getSession()
  return getBeneficiairesDeLEtablissement(idEtablissement, session!.accessToken)
}

async function getBeneficiairesDeLEtablissement(
  idEtablissement: string,
  accessToken: string
) {
  const { content: beneficiaires } = await apiGet<BaseBeneficiaireJson[]>(
    `/etablissements/${idEtablissement}/jeunes`,
    accessToken
  )
  return beneficiaires.map(jsonToBaseBeneficiaire)
}

export async function getBeneficiairesDeLaStructureMilo(
  idStructureMilo: string,
  accessToken: string
): Promise<{
  beneficiaires: BeneficiaireEtablissement[]
}> {
  const url = `/structures-milo/${idStructureMilo}/jeunes`

  const {
    content: { resultats },
  } = await apiGet<{
    resultats: BeneficiaireEtablissementJson[]
  }>(url, accessToken)

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
    session!.accessToken
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
    accessToken
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

async function getIdentitesBeneficiaires(
  idsBeneficiaires: string[],
  idConseiller: string,
  accessToken: string
): Promise<IdentiteBeneficiaire[]> {
  if (!idsBeneficiaires.length) return []
  const queryParam = idsBeneficiaires.map((id) => 'ids=' + id).join('&')

  const { content: beneficiaires } = await apiGet<IdentiteBeneficiaire[]>(
    `/conseillers/${idConseiller}/jeunes/identites?${queryParam}`,
    accessToken
  )

  return beneficiaires
}

export async function getDemarchesBeneficiaireClientSide(
  idBeneficiaire: string,
  semaine: Periode,
  idConseiller: string
) {
  const session = await getSession()
  return getDemarchesBeneficiaire(
    idBeneficiaire,
    semaine,
    idConseiller,
    session!.accessToken
  )
}

export async function getDemarchesBeneficiaire(
  idBeneficiaire: string,
  semaine: Periode,
  idConseiller: string,
  accessToken: string
): Promise<{ data: Demarche[]; isStale: boolean } | null> {
  const dateDebutUrlEncoded = encodeURIComponent(semaine.debut.toISO())
  const dateFinUrlEncoded = encodeURIComponent(semaine.fin.toISO())
  try {
    const {
      content: { queryModel: demarchesJson, dateDuCache },
    } = await apiGet<{ queryModel: DemarcheJson[]; dateDuCache?: string }>(
      `/conseillers/${idConseiller}/jeunes/${idBeneficiaire}/demarches?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}`,
      accessToken
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

export async function getComptageHeuresPortefeuille(
  idConseiller: string
): Promise<{
  comptages: CompteurHeuresPortefeuille[]
  dateDerniereMiseAJour: string
} | null> {
  const session = await getSession()
  try {
    const {
      content: { comptages, dateDerniereMiseAJour },
    } = await apiGet<CompteursHeuresDeclareesPortefeuilleJson>(
      `/conseillers/${idConseiller}/jeunes/comptage`,
      session!.accessToken
    )
    return {
      comptages: comptages.map(jsonToComptageHeuresPortefeuille),
      dateDerniereMiseAJour,
    }
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) return null
    throw e
  }
}

export async function getComptageHeuresFicheBeneficiaire(
  idBeneficiaire: string,
  periode: Periode,
  accessToken: string
): Promise<CompteurHeuresFicheBeneficiaire | null> {
  const dateDebut = periode.debut.toFormat('yyyy-MM-dd')
  const dateFin = periode.fin.toFormat('yyyy-MM-dd')

  try {
    const {
      content: { nbHeuresDeclarees, nbHeuresValidees, dateDerniereMiseAJour },
    } = await apiGet<CompteurHeuresFicheBeneficiaireJson>(
      `/jeunes/${idBeneficiaire}/comptage?dateDebut=${dateDebut}&dateFin=${dateFin}`,
      accessToken
    )
    return {
      nbHeuresDeclarees,
      nbHeuresValidees,
      dateDerniereMiseAJour,
    }
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) return null
    throw e
  }
}
