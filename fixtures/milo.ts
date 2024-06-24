import { DossierMilo } from 'interfaces/beneficiaire'

export const unDossierMilo = (
  overrides: Partial<DossierMilo> = {}
): DossierMilo =>
  ({
    id: '1234',
    prenom: 'Kenji',
    nom: 'GIRAC',
    email: 'kenji-faux-mail@mail.com',
    codePostal: '13000',
    dateDeNaissance: '1997-12-17',
    ...overrides,
  } as DossierMilo)
