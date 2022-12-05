import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'

export interface ListesDeDiffusionService {
  getListesDeDiffusion(
    idConseiller: string,
    accessToken: string
  ): Promise<ListeDeDiffusion[]>
}

export class ListesDeDiffusionApiService implements ListesDeDiffusionService {
  async getListesDeDiffusion(
    idConseiller: string,
    accessToken: string
  ): Promise<ListeDeDiffusion[]> {
    throw new Error('Not implemented')
  }
}
