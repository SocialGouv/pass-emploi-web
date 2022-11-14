import { DateTime } from 'luxon'

import { insertIntercalaires } from 'presentation/Intercalaires'

const mardiMatin = '2030-01-01T10:00:00.000Z'
const mardiApresMidi = '2030-01-01T16:00:00.000Z'
const mercredi = '2030-01-02T10:00:00.000Z'

describe('insertIntercalaires', () => {
  type WithDate = { date: string }

  it('quand la liste est vide retourne un tableau vide', () => {
    // Given
    const listeBase: WithDate[] = []

    // When
    const items = insertIntercalaires(listeBase, ({ date }) =>
      DateTime.fromISO(date)
    )

    // Then
    expect(items.length).toBe(0)
  })

  it('quand la liste ne contient qu’un rendez-vous, retourne le jour du rendez-vous, la plage horaire et le rendez-vous.', () => {
    // Given
    const withDate = { date: mardiMatin }

    // When
    const items = insertIntercalaires([withDate], ({ date }) =>
      DateTime.fromISO(date)
    )

    // Then
    expect(items.length).toBe(3)
    expect(items[0]).toHaveProperty('label', 'mardi 1 janvier')
    expect(items[1]).toHaveProperty('label', 'Matin')
    expect(items[2]).toEqual(withDate)
  })

  it('quand la liste contient un élément aujourd’hui, retourne "aujourd’hui", la plage horaire et l’élément.', () => {
    // Given
    const aujourdhuiApresmidi = DateTime.now().set({ hour: 15 }).toISO()
    const withDate = { date: aujourdhuiApresmidi }

    // When
    const items = insertIntercalaires([withDate], ({ date }) =>
      DateTime.fromISO(date)
    )

    // Then
    expect(items.length).toBe(3)
    expect(items[0]).toHaveProperty('label', 'aujourd’hui')
    expect(items[1]).toHaveProperty('label', 'Après-midi')
    expect(items[2]).toEqual(withDate)
  })

  it('quand la liste contient 2 éléments de jours différents, retourne les deux éléments avec les deux jours et leurs plages horaires.', () => {
    // Given
    const withDateMardi = { date: mardiMatin }
    const withDateMercredi = { date: mercredi }

    // When
    const items = insertIntercalaires(
      [withDateMercredi, withDateMardi],
      ({ date }) => DateTime.fromISO(date)
    )

    // Then
    expect(items.length).toBe(6)
    expect(items[0]).toHaveProperty('label', 'mardi 1 janvier')
    expect(items[1]).toHaveProperty('label', 'Matin')
    expect(items[2]).toEqual(withDateMardi)
    expect(items[3]).toHaveProperty('label', 'mercredi 2 janvier')
    expect(items[4]).toHaveProperty('label', 'Matin')
    expect(items[5]).toEqual(withDateMercredi)
  })

  it('quand la liste contient 2 éléments le même jour(matin/ après-midi), retourne les deux éléments avec le même jour et les deux plages horaires.', () => {
    // Given
    const withDateMardi = { date: mardiMatin }
    const withAutreDateMardi = { date: mardiApresMidi }

    // When
    const items = insertIntercalaires(
      [withDateMardi, withAutreDateMardi],
      ({ date }) => DateTime.fromISO(date)
    )

    // Then
    expect(items.length).toBe(5)
    expect(items[0]).toHaveProperty('label', 'mardi 1 janvier')
    expect(items[1]).toHaveProperty('label', 'Matin')
    expect(items[2]).toEqual(withDateMardi)
    expect(items[3]).toHaveProperty('label', 'Après-midi')
    expect(items[4]).toEqual(withAutreDateMardi)
  })
})
