import { DateTime } from 'luxon'

import { buildAgendaData } from 'components/AgendaRows'

const lundi = DateTime.fromISO('2029-12-31')
const mardi = DateTime.fromISO('2030-01-01')
const mercredi = DateTime.fromISO('2030-01-02')
const vendredi = DateTime.fromISO('2030-01-04')
const periode = { debut: lundi, fin: vendredi.plus({ day: 2 }) }

describe('buildAgendaData', () => {
  type WithDate = { id: string; date: DateTime }

  it('construit un agenda vide', () => {
    // Given
    const listeBase: WithDate[] = []

    // When
    const agenda = buildAgendaData(listeBase, periode, ({ date }) => date)

    // Then
    expect(agenda).toStrictEqual(
      new Map([
        ['2029-12-31', undefined],
        ['2030-01-01', undefined],
        ['2030-01-02', undefined],
        ['2030-01-03', undefined],
        ['2030-01-04', undefined],
        ['2030-01-05', undefined],
        ['2030-01-06', undefined],
      ])
    )
  })

  it('construit un agenda avec un seul item', () => {
    // Given
    const withDate = { id: 'mardi', date: mardi.set({ hour: 8 }) }

    // When
    const agenda = buildAgendaData([withDate], periode, ({ date }) => date)

    // Then
    expect(agenda).toStrictEqual(
      new Map<string, any>([
        ['2029-12-31', undefined],
        ['2030-01-01', { matin: [withDate], apresMidi: [] }],
        ['2030-01-02', undefined],
        ['2030-01-03', undefined],
        ['2030-01-04', undefined],
        ['2030-01-05', undefined],
        ['2030-01-06', undefined],
      ])
    )
  })

  it('construit un agenda avec plusieurs items', () => {
    // Given
    const withDateLundi = { id: 'lundi', date: lundi.set({ hour: 16 }) }
    const withDateMardiMatin = {
      id: 'mardiMatin',
      date: mardi.set({ hour: 8 }),
    }
    const withDateMardiApresMidi = {
      id: 'mardiApresMidi',
      date: mardi.set({ hour: 16 }),
    }
    const withDateMercredi = { id: 'mercredi', date: mercredi.set({ hour: 8 }) }
    const withDateVendredi = {
      id: 'vendredi',
      date: vendredi.set({ hour: 16 }),
    }
    const withDateVendredi2 = {
      id: 'vendredi2',
      date: vendredi.set({ hour: 17 }),
    }
    const items = [
      withDateLundi,
      withDateMardiMatin,
      withDateMardiApresMidi,
      withDateMercredi,
      withDateVendredi,
      withDateVendredi2,
    ]

    // When
    const agenda = buildAgendaData(items, periode, ({ date }) => date)

    // Then
    expect(agenda).toStrictEqual(
      new Map<string, any>([
        ['2029-12-31', { matin: [], apresMidi: [withDateLundi] }],
        [
          '2030-01-01',
          {
            matin: [withDateMardiMatin],
            apresMidi: [withDateMardiApresMidi],
          },
        ],
        ['2030-01-02', { matin: [withDateMercredi], apresMidi: [] }],
        ['2030-01-03', undefined],
        [
          '2030-01-04',
          {
            matin: [],
            apresMidi: [withDateVendredi, withDateVendredi2],
          },
        ],
        ['2030-01-05', undefined],
        ['2030-01-06', undefined],
      ])
    )
  })
})
