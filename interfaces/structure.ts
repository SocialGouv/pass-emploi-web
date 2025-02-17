/*** Constantes ***/

export const structureMilo = 'MILO'
export const structureFTCej = 'POLE_EMPLOI'
const structureFTBrsa = 'POLE_EMPLOI_BRSA'
const structureAvenirPro = 'AVENIR_PRO'
const structureConseilDepartemental = 'CONSEIL_DEPT'

const structuresCEJ = [structureMilo, structureFTCej] as const

const structuresFTConnect = [
  structureFTCej,
  structureFTBrsa,
  'POLE_EMPLOI_AIJ',
  'FT_ACCOMPAGNEMENT_INTENSIF',
  'FT_ACCOMPAGNEMENT_GLOBAL',
  'FT_EQUIP_EMPLOI_RECRUT',
  structureAvenirPro,
] as const

export const structuresReaffectation = structuresFTConnect.filter(
  (structure) => structure !== structureAvenirPro
)

/*** Types ***/

type StructureCEJ = (typeof structuresCEJ)[number]

type StructureFTConnect = (typeof structuresFTConnect)[number]

export type StructureReaffectation = (typeof structuresReaffectation)[number]

export type Structure =
  | StructureFTConnect
  | typeof structureMilo
  | typeof structureConseilDepartemental

/*** Outils ***/

export function estMilo(structure: string): structure is typeof structureMilo {
  return structure === structureMilo
}

export function estConseilDepartemental(
  structure: string
): structure is typeof structureConseilDepartemental {
  return structure === structureConseilDepartemental
}

export function estBRSA(
  structure: string
): structure is typeof structureFTBrsa {
  return structure === structureFTBrsa
}

export function estPassEmploi(
  structure: string
): structure is Exclude<Structure, StructureCEJ> {
  return !([...structuresCEJ] as string[]).includes(structure)
}

export function estFTConnect(
  structure: string
): structure is StructureFTConnect {
  return ([...structuresFTConnect] as string[]).includes(structure)
}
