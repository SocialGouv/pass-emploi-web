import { Jeune } from 'interfaces/jeune'

export enum UserStructure {
  MILO = 'MILO',
  POLE_EMPLOI = 'POLE EMPLOI',
  PASS_EMPLOI = 'PASS EMPLOI',
}

//TODO delete?

export type Conseiller = {
  isLoggedIn?: boolean
  id: string
  firstName: string
  lastName: string
  jeunes: Jeune[]
  userStructure?: UserStructure
}
