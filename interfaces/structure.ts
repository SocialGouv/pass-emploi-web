/*** Constantes ***/

export const structureMilo = 'MILO'
export const structureFTCej = 'POLE_EMPLOI'
export const structureBrsa = 'POLE_EMPLOI_BRSA'
export const structureAvenirPro = 'AVENIR_PRO'
export const structureAij = 'POLE_EMPLOI_AIJ'
export const structureAccompagnementIntensif = 'FT_ACCOMPAGNEMENT_INTENSIF'
export const structureAccompagnementGlobal = 'FT_ACCOMPAGNEMENT_GLOBAL'
export const structureEquipEmploiRecrut = 'FT_EQUIP_EMPLOI_RECRUT'
const structureConseilDepartemental = 'CONSEIL_DEPT'

const structuresCEJ = [structureMilo, structureFTCej] as const

const structuresFTConnect = [
  structureFTCej,
  structureBrsa,
  structureAij,
  structureAccompagnementIntensif,
  structureAccompagnementGlobal,
  structureEquipEmploiRecrut,
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

export function estBRSA(structure: string): structure is typeof structureBrsa {
  return structure === structureBrsa
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

export function labelStructure(structure: StructureFTConnect): string {
  switch (structure) {
    case structureFTCej:
      return 'CEJ'
    case structureBrsa:
      return 'RSA rénové'
    case structureAij:
      return 'AIJ'
    case structureAccompagnementIntensif:
      return 'Accompagnement intensif'
    case structureAccompagnementGlobal:
      return 'Accompagnement global'
    case structureEquipEmploiRecrut:
      return 'Equip’emploi / Equip’recrut'
    case structureAvenirPro:
      return 'Avenir pro'
  }
}
