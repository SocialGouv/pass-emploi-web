import { DateTime } from 'luxon'

import { buildAgenda } from 'presentation/Intercalaires'

const lundi = DateTime.fromISO('2029-12-31')
const mardi = DateTime.fromISO('2030-01-01')
const mercredi = DateTime.fromISO('2030-01-02')
const vendredi = DateTime.fromISO('2030-01-04')
const periode = { debut: lundi, fin: vendredi }

describe('buildAgenda', () => {
  type WithDate = { date: DateTime }

  it('construit un agenda vide', () => {
    // Given
    const listeBase: WithDate[] = []

    // When
    const agenda = buildAgenda(listeBase, periode, ({ date }) => date)

    // Then
    expect(agenda).toEqual({
      'lundi 31 décembre': undefined,
      'mardi 1 janvier': undefined,
      'mercredi 2 janvier': undefined,
      'jeudi 3 janvier': undefined,
      'vendredi 4 janvier': undefined,
    })
  })

  it('construit un agenda avec un seul item', () => {
    // Given
    const withDate = { date: mardi.set({ hour: 8 }) }

    // When
    const agenda = buildAgenda([withDate], periode, ({ date }) => date)

    // Then
    expect(agenda).toEqual({
      'lundi 31 décembre': undefined,
      'mardi 1 janvier': { matin: [withDate], apresMidi: [] },
      'mercredi 2 janvier': undefined,
      'jeudi 3 janvier': undefined,
      'vendredi 4 janvier': undefined,
    })
  })

  it('construit un agenda avec plusieurs items', () => {
    // Given
    const withDateLundi = { date: lundi.set({ hour: 16 }) }
    const withDateMardiMatin = { date: mardi.set({ hour: 8 }) }
    const withDateMardiApresMidi = { date: mardi.set({ hour: 16 }) }
    const withDateMercredi = { date: mercredi.set({ hour: 8 }) }
    const withDateVendredi = { date: vendredi.set({ hour: 16 }) }
    const withDateVendredi2 = { date: vendredi.set({ hour: 17 }) }
    const items = [
      withDateLundi,
      withDateMardiMatin,
      withDateMardiApresMidi,
      withDateMercredi,
      withDateVendredi,
      withDateVendredi2,
    ]

    // When
    const agenda = buildAgenda(items, periode, ({ date }) => date)

    // Then
    expect(agenda).toEqual({
      'lundi 31 décembre': { matin: [], apresMidi: [withDateLundi] },
      'mardi 1 janvier': {
        matin: [withDateMardiMatin],
        apresMidi: [withDateMardiApresMidi],
      },
      'mercredi 2 janvier': { matin: [withDateMercredi], apresMidi: [] },
      'jeudi 3 janvier': undefined,
      'vendredi 4 janvier': {
        matin: [],
        apresMidi: [withDateVendredi, withDateVendredi2],
      },
    })
  })
})
