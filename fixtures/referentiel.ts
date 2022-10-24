import { Commune, Departement, Localite, Metier } from 'interfaces/referentiel'

export function uneListeDAgencesMILO() {
  return [
    {
      id: '443',
      nom: 'MLS3F SAINT-LOUIS',
      codeDepartement: '1'
    },
    {
      id: '444',
      nom: 'PEIPS MISSION LOCALE DU SENONAIS',
      codeDepartement: '2'
    },
    {
      id: '445',
      nom: 'REUSSIR EN SAMBRE AVESNOIS',
      codeDepartement: '3'
    },
    {
      id: '446',
      nom: 'ROMORANTIN',
      codeDepartement: '4'
    },
  ]
}

export function uneListeDAgencesPoleEmploi() {
  return [
    {
      id: '457',
      nom: 'Agence Pôle emploi CLERMONT PRE LA REINE',
    },
    {
      id: '458',
      nom: 'Agence Pôle emploi CLERMONT JOUHAUX',
    },
    {
      id: '459',
      nom: 'Agence Pôle emploi THIERS',
    },
    {
      id: '460',
      nom: 'Agence Pôle emploi ISSOIRE',
    },
  ]
}

export function desLocalites(): Localite[] {
  return [
    {
      libelle: 'Paris',
      code: '75',
      type: 'DEPARTEMENT',
    },
    ...desCommunes(),
  ]
}

export function uneCommune(overrides: Partial<Commune> = {}): Commune {
  const defaults: Commune = {
    libelle: 'PARIS 14',
    code: '75114',
    type: 'COMMUNE',
    longitude: 2.323026,
    latitude: 48.830108,
  }
  return { ...defaults, ...overrides }
}

export function unDepartement(
  overrides: Partial<Departement> = {}
): Departement {
  const defaults: Departement = {
    libelle: 'Paris',
    code: '75',
    type: 'DEPARTEMENT',
  }
  return { ...defaults, ...overrides }
}

export function desCommunes(): Commune[] {
  return [
    {
      libelle: 'PARIS 14',
      code: '75114',
      type: 'COMMUNE',
      longitude: 2.323026,
      latitude: 48.830108,
    },
    {
      libelle: 'PARIS 19',
      code: '75119',
      type: 'COMMUNE',
      longitude: 2.387708,
      latitude: 48.887252,
    },
    {
      libelle: 'PARIS 07',
      code: '75107',
      type: 'COMMUNE',
      longitude: 2.347,
      latitude: 48.859,
    },
    {
      libelle: 'PARIS 09',
      code: '75109',
      type: 'COMMUNE',
      longitude: 2.347,
      latitude: 48.859,
    },
  ]
}

export function unMetier(overrides: Partial<Metier> = {}): Metier {
  const defaults: Metier = {
    libelle: 'Développeur / Développeuse web',
    code: 'M1805',
  }
  return { ...defaults, ...overrides }
}

export function desMetiers(): Metier[] {
  return [
    {
      libelle: 'Développeur / Développeuse web',
      code: 'M1805',
    },
    {
      libelle: 'Développeur / Développeuse économique',
      code: 'K1802',
    },
    {
      libelle: 'Développeur / Développeuse de photographies',
      code: 'E1203',
    },
    {
      libelle: 'Développeur / Développeuse back-end',
      code: 'M1805',
    },
  ]
}
