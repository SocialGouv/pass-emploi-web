import { StructureConseiller } from 'interfaces/conseiller'

export function getUrlSiteRessource(structure: StructureConseiller): string {
  switch (structure) {
    case StructureConseiller.MILO:
      return process.env.NEXT_PUBLIC_FAQ_MILO_EXTERNAL_LINK as string
    case StructureConseiller.POLE_EMPLOI:
      return process.env.NEXT_PUBLIC_FAQ_PE_EXTERNAL_LINK as string
    case StructureConseiller.POLE_EMPLOI_BRSA:
    case StructureConseiller.POLE_EMPLOI_AIJ:
    case StructureConseiller.AVENIR_PRO:
      return process.env.NEXT_PUBLIC_FAQ_PASS_EMPLOI_EXTERNAL_LINK as string
    case StructureConseiller.CONSEIL_DEPT:
      return process.env.NEXT_PUBLIC_FAQ_CD_BRSA_EXTERNAL_LINK as string
  }
}

export function getUrlContact(structure: StructureConseiller): string {
  const urlSiteRessource = getUrlSiteRessource(structure)

  switch (structure) {
    case StructureConseiller.MILO:
    case StructureConseiller.POLE_EMPLOI_BRSA:
    case StructureConseiller.POLE_EMPLOI_AIJ:
    case StructureConseiller.CONSEIL_DEPT:
    case StructureConseiller.AVENIR_PRO:
      return urlSiteRessource + 'assistance/'
    case StructureConseiller.POLE_EMPLOI:
      return urlSiteRessource + 'formuler-une-demande/'
  }
}
