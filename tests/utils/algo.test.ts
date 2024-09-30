import { getPreviousItemId } from 'utils/algo'

describe('getPreviousItemId', () => {
  const item = { id: 'idATrouver' }

  it('renvoie undefined si l’élément n’existe pas', async () => {
    expect(getPreviousItemId(item, [])).toEqual(undefined)
    expect(getPreviousItemId(item, [{ id: 'id2' }, { id: 'id3' }])).toEqual(
      undefined
    )
  })

  it('renvoie l’élément précédent', async () => {
    expect(
      getPreviousItemId(item, [{ id: 'id-precedent' }, { id: 'idATrouver' }])
    ).toEqual('id-precedent')
  })

  it('renvoie l’élément suivant', async () => {
    expect(
      getPreviousItemId(item, [{ id: 'idATrouver' }, { id: 'id-suivant' }])
    ).toEqual('id-suivant')
  })

  it('renvoie undefined si seul élément de la liste', async () => {
    expect(getPreviousItemId(item, [{ id: 'idATrouver' }])).toEqual(undefined)
  })
})
