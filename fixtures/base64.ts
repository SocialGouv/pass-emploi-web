import { desCriteresDeRecherchesOffreEmploi } from 'fixtures/searchQueries'
import { encodeBase64 } from 'utils/encoding/base64-enconding'

export const desCriteresDeRecherchesOffreEmploiEnBase64 = (): string => {
  const json = JSON.stringify(desCriteresDeRecherchesOffreEmploi())
  return encodeBase64(json)
}
