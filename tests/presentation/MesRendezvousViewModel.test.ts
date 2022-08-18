import { RdvAVenirItem, RdvListItem } from 'interfaces/rdv'
import { listeRdvAVenirItem } from 'presentation/MesRendezvousViewModel'

describe('mesRendezvousParJour', () => {
  it('quand ma liste de rendezvous est vide retourne une map vide', () => {
    // Given
    const mesRendezvous: RdvListItem[] = []

    // When
    const viewModel: RdvAVenirItem[] = listeRdvAVenirItem(mesRendezvous)

    // Then
    expect(viewModel.length).toBe(0)
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
    const viewModel: RdvAVenirItem[] = listeRdvAVenirItem([rendezvous])

    // Then
    expect(viewModel.length).toBe(2)
    expect(viewModel[0]).toEqual({ label: 'mardi 1 janvier' })
    expect(viewModel[1]).toEqual({ rdvListItem: rendezvous })
  })
})
