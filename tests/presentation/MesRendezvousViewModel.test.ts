import { RdvListItem } from 'interfaces/rdv'
import { mesRendezvousParJour } from 'presentation/MesRendezvousViewModel'

describe('mesRendezvousParJour', () => {
  it('quand ma liste de rendezvous est vide retourne une map vide', () => {
    // Given
    const mesRendezvous: RdvListItem[] = []

    // When
    const viewModel: Map<string, RdvListItem[]> =
      mesRendezvousParJour(mesRendezvous)

    // Then
    expect(viewModel.size).toBe(0)
  })

  it('quand ma liste de rendezvous ne contient qu’un élément retourne une map avec une seule entrée', () => {
    // Given
    const rendezvous = {
      id: '1',
      beneficiaires: '',
      type: '',
      modality: '',
      date: '2030-01-01T10:00:00.000Z',
      duration: 0,
      idCreateur: '1',
    }

    // When
    const viewModel: Map<string, RdvListItem[]> = mesRendezvousParJour([
      rendezvous,
    ])

    // Then
    expect(viewModel.size).toBe(1)
    expect(viewModel.get('mardi 1 janvier')).toBe([rendezvous])
  })
})
