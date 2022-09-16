import { DateTime } from 'luxon'

import { RdvListItem } from 'interfaces/rdv'
import { rdvsWithIntercalaires } from 'presentation/MesRdvViewModel'

const mardiMatin = '2030-01-01T10:00:00.000Z'
const mardiApresMidi = '2030-01-01T16:00:00.000Z'
const mercredi = '2030-01-02T10:00:00.000Z'

describe('listeRdvAVenirItem', () => {
  it('quand la liste de rendez-vous est vide retourne un tableau vide', () => {
    // Given
    const mesRendezvous: RdvListItem[] = []

    // When
    const items = rdvsWithIntercalaires(mesRendezvous)

    // Then
    expect(items.length).toBe(0)
  })

  it('quand la liste de rendez-vous ne contient qu’un rendez-vous, retourne le jour du rendez-vous, la plage horaire et le rendez-vous.', () => {
    // Given
    const rendezvous = unRendezvousItem(mardiMatin)

    // When
    const items = rdvsWithIntercalaires([rendezvous])

    // Then
    expect(items.length).toBe(3)
    expect(items[0]).toHaveProperty('label', 'mardi 1 janvier')
    expect(items[1]).toHaveProperty('label', 'Matin')
    expect(items[2]).toEqual(rendezvous)
  })

  it('quand la liste de rendez-vous contient un rendez-vous aujourd’hui, retourne "aujourd’hui", la plage horaire et le rendez-vous.', () => {
    // Given
    const aujourdhuiApresmidi = DateTime.now().set({ hour: 15 }).toISO()
    const rendezvous = unRendezvousItem(aujourdhuiApresmidi)

    // When
    const items = rdvsWithIntercalaires([rendezvous])

    // Then
    expect(items.length).toBe(3)
    expect(items[0]).toHaveProperty('label', 'aujourd’hui')
    expect(items[1]).toHaveProperty('label', 'Après-midi')
    expect(items[2]).toEqual(rendezvous)
  })

  it('quand la liste de rendez-vous contient 2 rendez-vous de jours différents, retourne les deux rendez-vous avec les deux jours et leurs plages horaires.', () => {
    // Given
    const rendezvousMardi = unRendezvousItem(mardiMatin)
    const rendezvousMercredi = unRendezvousItem(mercredi)

    // When
    const items = rdvsWithIntercalaires([rendezvousMercredi, rendezvousMardi])

    // Then
    expect(items.length).toBe(6)
    expect(items[0]).toHaveProperty('label', 'mardi 1 janvier')
    expect(items[1]).toHaveProperty('label', 'Matin')
    expect(items[2]).toEqual(rendezvousMardi)
    expect(items[3]).toHaveProperty('label', 'mercredi 2 janvier')
    expect(items[4]).toHaveProperty('label', 'Matin')
    expect(items[5]).toEqual(rendezvousMercredi)
  })

  it('quand la liste de rendezvous contient 2 rendez-vous le même jour(matin/ après-midi), retourne les deux rendez-vous avec le même jour et les deux plages horaires.', () => {
    // Given
    const unRendezvousMardi = unRendezvousItem(mardiMatin)
    const unAutreRendezvousMardi = unRendezvousItem(mardiApresMidi)

    // When
    const items = rdvsWithIntercalaires([
      unRendezvousMardi,
      unAutreRendezvousMardi,
    ])

    // Then
    expect(items.length).toBe(5)
    expect(items[0]).toHaveProperty('label', 'mardi 1 janvier')
    expect(items[1]).toHaveProperty('label', 'Matin')
    expect(items[2]).toEqual(unRendezvousMardi)
    expect(items[3]).toHaveProperty('label', 'Après-midi')
    expect(items[4]).toEqual(unAutreRendezvousMardi)
  })
})

function unRendezvousItem(date: string) {
  return {
    id: '1',
    beneficiaires: '',
    type: '',
    modality: '',
    date,
    duration: 0,
    idCreateur: '1',
  }
}
