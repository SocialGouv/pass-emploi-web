import {
  JourRdvAVenirItem,
  RdvAVenirItem,
  RdvItem,
  RdvListItem,
} from 'interfaces/rdv'
import { listeRdvAVenirItem } from 'presentation/MesRendezvousViewModel'

describe('mesRendezvousParJour', () => {
  it('quand ma liste de rendezvous est vide retourne un tableau vide', () => {
    // Given
    const mesRendezvous: RdvListItem[] = []

    // When
    const viewModel: RdvAVenirItem[] = listeRdvAVenirItem(mesRendezvous)

    // Then
    expect(viewModel.length).toBe(0)
  })

  it('quand une liste de rendezvous ne contient qu’un rendezvous retourne le jour du RDV et le RDV', () => {
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
    expect(viewModel[0]).toEqual(new JourRdvAVenirItem('mardi 1 janvier'))
    expect(viewModel[1]).toEqual(new RdvItem(rendezvous))
  })

  it('quand une liste de rendezvous contient 2 rendezvous de jours différents retourne les deux rendezvous avec les deux jours', () => {
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
    expect(viewModel[0]).toEqual(new JourRdvAVenirItem('mardi 1 janvier'))
    expect(viewModel[1]).toEqual(new RdvItem(rendezvous))
  })
})
