import { Structure } from 'interfaces/structure'

export function getUrlSiteRessource(structure: Structure): string {
  switch (structure) {
    case 'MILO':
      return process.env.NEXT_PUBLIC_FAQ_MILO_EXTERNAL_LINK as string
    case 'POLE_EMPLOI':
      return process.env.NEXT_PUBLIC_FAQ_PE_EXTERNAL_LINK as string
    case 'POLE_EMPLOI_BRSA':
    case 'POLE_EMPLOI_AIJ':
    case 'AVENIR_PRO':
    case 'FT_ACCOMPAGNEMENT_INTENSIF':
    case 'FT_ACCOMPAGNEMENT_GLOBAL':
    case 'FT_EQUIP_EMPLOI_RECRUT':
      return process.env.NEXT_PUBLIC_FAQ_PASS_EMPLOI_EXTERNAL_LINK as string
    case 'CONSEIL_DEPT':
      return process.env.NEXT_PUBLIC_FAQ_CD_BRSA_EXTERNAL_LINK as string
  }
}

export function getUrlContact(structure: Structure): string {
  const urlSiteRessource = getUrlSiteRessource(structure)

  switch (structure) {
    case 'MILO':
    case 'POLE_EMPLOI_BRSA':
    case 'POLE_EMPLOI_AIJ':
    case 'CONSEIL_DEPT':
    case 'AVENIR_PRO':
    case 'FT_ACCOMPAGNEMENT_INTENSIF':
    case 'FT_ACCOMPAGNEMENT_GLOBAL':
    case 'FT_EQUIP_EMPLOI_RECRUT':
      return urlSiteRessource + 'assistance/'
    case 'POLE_EMPLOI':
      return urlSiteRessource + 'formuler-une-demande/'
  }
}
