import {
  Commune,
  Departement,
  Localite,
  Metier,
  MotifSuppressionBeneficiaire,
} from 'interfaces/referentiel'

export function uneListeDAgencesMILO() {
  return [
    {
      id: '443',
      nom: 'MLS3F SAINT-LOUIS',
      codeDepartement: '1',
    },
    {
      id: '444',
      nom: 'PEIPS MISSION LOCALE DU SENONAIS',
      codeDepartement: '2',
    },
    {
      id: '445',
      nom: 'REUSSIR EN SAMBRE AVESNOIS',
      codeDepartement: '3',
    },
    {
      id: '446',
      nom: 'ROMORANTIN',
      codeDepartement: '4',
    },
  ]
}

export function uneListeDAgencesFranceTravail() {
  return [
    {
      id: '457',
      nom: 'Agence France Travail CLERMONT PRE LA REINE',
      codeDepartement: '1',
    },
    {
      id: '458',
      nom: 'Agence France Travail CLERMONT JOUHAUX',
      codeDepartement: '2',
    },
    {
      id: '459',
      nom: 'Agence France Travail THIERS',
      codeDepartement: '3',
    },
    {
      id: '460',
      nom: 'Agence France Travail ISSOIRE',
      codeDepartement: '4',
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
    libelle: 'PARIS 14 (75)',
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
      libelle: 'PARIS 14 (75)',
      code: '75114',
      type: 'COMMUNE',
      longitude: 2.323026,
      latitude: 48.830108,
    },
    {
      libelle: 'PARIS 19 (75)',
      code: '75119',
      type: 'COMMUNE',
      longitude: 2.387708,
      latitude: 48.887252,
    },
    {
      libelle: 'PARIS 07 (75)',
      code: '75107',
      type: 'COMMUNE',
      longitude: 2.347,
      latitude: 48.859,
    },
    {
      libelle: 'PARIS 09 (75)',
      code: '75109',
      type: 'COMMUNE',
      longitude: 2.347,
      latitude: 48.859,
    },
  ]
}

export function desLocalitesJson(): Localite[] {
  return [
    {
      libelle: 'Paris',
      code: '75',
      type: 'DEPARTEMENT',
    },
    ...desCommunesJson(),
  ]
}

export function desCommunesJson(): Commune[] {
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

export function desMotifsDeSuppression(): MotifSuppressionBeneficiaire[] {
  return [
    {
      motif: 'Emploi durable (plus de 6 mois)',
      description:
        'CDI, CDD de plus de 6 mois dont alternance, titularisation dans la fonction publique',
    },
    { motif: 'Emploi court (moins de 6 mois)' },
    { motif: 'Contrat arrivé à échéance' },
    {
      motif: 'Limite d’âge atteinte',
      description:
        'Motif valable uniquement à partir de la fin du premier mois des 26 ans. À noter : dans le cas oû le jeune est considéré en tant que travailleur handicapé, l’âge passe à 30 ans.',
    },
    { motif: 'Demande du jeune de sortir du dispositif' },
    { motif: 'Non respect des engagements ou abandon' },
    { motif: 'Déménagement' },
    { motif: 'Changement de conseiller' },
    { motif: 'Autre', description: 'Champ libre' },
  ]
}
