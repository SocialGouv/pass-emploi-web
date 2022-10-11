import { Commune, Localite } from 'interfaces/referentiel'

export function uneListeDAgencesMILO() {
  return [
    {
      id: '443',
      nom: 'MLS3F SAINT-LOUIS',
    },
    {
      id: '444',
      nom: 'PEIPS MISSION LOCALE DU SENONAIS',
    },
    {
      id: '445',
      nom: 'REUSSIR EN SAMBRE AVESNOIS',
    },
    {
      id: '446',
      nom: 'ROMORANTIN',
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
