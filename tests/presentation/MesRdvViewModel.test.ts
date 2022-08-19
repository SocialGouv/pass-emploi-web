import { JourRdvAVenirItem, RdvListItem } from 'interfaces/rdv'
import { listeRdvAVenirItem } from 'presentation/MesRdvViewModel'

const mardi = '2030-01-01T10:00:00.000Z'
const mercredi = '2030-01-02T10:00:00.000Z'

describe('listeRdvAVenirItem', () => {
  it('quand la liste de rendez-vous est vide retourne un tableau vide', () => {
    // Given
    const mesRendezvous: RdvListItem[] = []

    // When
    const items = listeRdvAVenirItem(mesRendezvous)

    // Then
    expect(items.length).toBe(0)
  })

  it('quand la liste de rendez-vous ne contient qu’un rendez-vous retourne le jour du rendez-vous et le rendez-vous', () => {
    // Given
    const rendezvous = unRendezvousItem(mardi)

    // When
    const items = listeRdvAVenirItem([rendezvous])

    // Then
    expect(items.length).toBe(2)
    expect((items[0] as JourRdvAVenirItem).label).toEqual('mardi 1 janvier')
    expect(items[1]).toEqual(rendezvous)
  })

  it('quand la liste de rendez-vous contient un rendez-vous aujourd’hui retourne aujourd’hui et le rendez-vous', () => {
    // Given
    const aujourdhui = new Date().toISOString()
    const rendezvous = unRendezvousItem(aujourdhui)

    // When
    const items = listeRdvAVenirItem([rendezvous])

    // Then
    expect(items.length).toBe(2)
    expect((items[0] as JourRdvAVenirItem).label).toEqual('aujourd’hui')
    expect(items[1]).toEqual(rendezvous)
  })

  it('quand la liste de rendez-vous contient 2 rendez-vous de jours différents retourne les deux rendez-vous avec les deux jours', () => {
    // Given
    const rendezvousMardi = unRendezvousItem(mardi)
    const rendezvousMercredi = unRendezvousItem(mercredi)

    // When
    const items = listeRdvAVenirItem([rendezvousMercredi, rendezvousMardi])

    // Then
    expect(items.length).toBe(4)
    expect((items[0] as JourRdvAVenirItem).label).toEqual('mardi 1 janvier')
    expect(items[1]).toEqual(rendezvousMardi)
    expect((items[2] as JourRdvAVenirItem).label).toEqual('mercredi 2 janvier')
    expect(items[3]).toEqual(rendezvousMercredi)
  })

  it('quand la liste de rendezvous contient 2 rendez-vous le même jour retourne les deux rendez-vous avec le même jour', () => {
    // Given
    const unRendezvousMardi = unRendezvousItem(mardi)
    const unAutreRendezvousMardi = unRendezvousItem(mardi)

    // When
    const items = listeRdvAVenirItem([
      unRendezvousMardi,
      unAutreRendezvousMardi,
    ])

    // Then
    expect(items.length).toBe(3)
    expect((items[0] as JourRdvAVenirItem).label).toEqual('mardi 1 janvier')
    expect(items[1]).toEqual(unRendezvousMardi)
    expect(items[2]).toEqual(unAutreRendezvousMardi)
  })
})

function unRendezvousItem(date: string) {
  return {
    id: '1',
    beneficiaires: '',
    type: '',
    modality: '',
    date: date,
    duration: 0,
    idCreateur: '1',
  }
}
