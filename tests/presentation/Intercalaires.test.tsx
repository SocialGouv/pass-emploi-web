import { DateTime } from 'luxon'

import { buildAgenda } from 'presentation/Intercalaires'

const lundi = DateTime.fromISO('2029-12-31')
const mardi = DateTime.fromISO('2030-01-01')
const mercredi = DateTime.fromISO('2030-01-02')
const vendredi = DateTime.fromISO('2030-01-04')
const periode = { debut: lundi, fin: vendredi.plus({ day: 2 }) }

describe('initAgenda', () => {
  type WithDate = { date: DateTime }

  it('construit un agenda vide', () => {
    // Given
    const listeBase: WithDate[] = []

    // When
    const agenda = buildAgenda(listeBase, periode, ({ date }) => date, [0, 1])

    // Then
    expect(agenda).toStrictEqual({
      '2029-12-31': 'NO_DATA',
      '2030-01-01': 'NO_DATA',
      '2030-01-02': undefined,
      '2030-01-03': undefined,
      '2030-01-04': undefined,
      '2030-01-05': undefined,
      '2030-01-06': undefined,
    })
  })

  it('construit un agenda avec un seul item', () => {
    // Given
    const withDate = { date: mardi.set({ hour: 8 }) }

    // When
    const agenda = buildAgenda([withDate], periode, ({ date }) => date, [0, 1])

    // Then
    expect(agenda).toStrictEqual({
      '2029-12-31': 'NO_DATA',
      '2030-01-01': { matin: [withDate], apresMidi: [] },
      '2030-01-02': undefined,
      '2030-01-03': undefined,
      '2030-01-04': undefined,
      '2030-01-05': undefined,
      '2030-01-06': undefined,
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
    expect(agenda).toStrictEqual({
      '2029-12-31': { matin: [], apresMidi: [withDateLundi] },
      '2030-01-01': {
        matin: [withDateMardiMatin],
        apresMidi: [withDateMardiApresMidi],
      },
      '2030-01-02': { matin: [withDateMercredi], apresMidi: [] },
      '2030-01-03': 'NO_DATA',
      '2030-01-04': {
        matin: [],
        apresMidi: [withDateVendredi, withDateVendredi2],
      },
      '2030-01-05': 'NO_DATA',
      '2030-01-06': 'NO_DATA',
    })
  })
})
