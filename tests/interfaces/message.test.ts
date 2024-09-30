import { DateTime } from 'luxon'

import { getPreviousItemId } from 'interfaces/message'

describe('getPreviousIndices', () => {
  const date = DateTime.now()
  const item = { id: 'idATrouver' }

  it('renvoie undefined pour les contenus vides', async () => {
    expect(getPreviousItemId(item, [])).toEqual(undefined)
    expect(getPreviousItemId(item, [{ date, messages: [] }])).toEqual(undefined)
    expect(
      getPreviousItemId(item, [
        { date, messages: [] },
        { date, messages: [] },
      ])
    ).toEqual(undefined)
  })

  it('renvoie undefined si l’élément n’existe pas', async () => {
    expect(
      getPreviousItemId(item, [{ date, messages: [{ id: 'id2' }] }])
    ).toEqual(undefined)
    expect(
      getPreviousItemId(item, [
        { date, messages: [{ id: 'id2' }, { id: 'id3' }] },
        { date, messages: [] },
        { date, messages: [{ id: 'id4' }] },
      ])
    ).toEqual(undefined)
  })

  it('renvoie l’élément précédent du même jour', async () => {
    expect(
      getPreviousItemId(item, [
        {
          date,
          messages: [{ id: 'id2' }, { id: 'id3' }, { id: 'idATrouver' }],
        },
      ])
    ).toEqual('id3')
  })

  it('renvoie le dernier élément du jour précédent', async () => {
    expect(
      getPreviousItemId(item, [
        { date, messages: [{ id: 'id2' }] },
        {
          date,
          messages: [{ id: 'idATrouver' }, { id: 'id3' }, { id: 'id4' }],
        },
      ])
    ).toEqual('id2')
  })

  it('renvoie le dernier élément du 1er jour précédent avec des éléments', async () => {
    expect(
      getPreviousItemId(item, [
        { date, messages: [{ id: 'id2' }] },
        { date, messages: [] },
        { date, messages: [] },
        {
          date,
          messages: [{ id: 'idATrouver' }, { id: 'id3' }, { id: 'id4' }],
        },
      ])
    ).toEqual('id2')
  })

  it('renvoie l’élément suivant du même si aucun élément précédent', async () => {
    expect(
      getPreviousItemId(item, [
        { date, messages: [] },
        { date, messages: [] },
        {
          date,
          messages: [{ id: 'idATrouver' }, { id: 'id3' }, { id: 'id4' }],
        },
      ])
    ).toEqual('id3')
  })

  it('renvoie le premier élément du jour suivant si aucun élément précédent', async () => {
    expect(
      getPreviousItemId(item, [
        { date, messages: [] },
        { date, messages: [{ id: 'idATrouver' }] },
        { date, messages: [{ id: 'id2' }, { id: 'id3' }] },
      ])
    ).toEqual('id2')
  })

  it('renvoie le premier élément du 1er jour suivant avec des éléments si aucun élément précédent', async () => {
    expect(
      getPreviousItemId(item, [
        { date, messages: [] },
        { date, messages: [{ id: 'idATrouver' }] },
        { date, messages: [] },
        { date, messages: [{ id: 'id2' }, { id: 'id3' }] },
      ])
    ).toEqual('id2')
  })

  it('renvoie undefined si seul élément', async () => {
    expect(
      getPreviousItemId(item, [
        { date, messages: [] },
        { date, messages: [] },
        { date, messages: [{ id: 'idATrouver' }] },
      ])
    ).toEqual(undefined)
  })
})
