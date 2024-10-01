import { getPreviousItemId } from 'utils/algo'

describe('getPreviousItemId', () => {
  const idATrouver = 'idATrouver'

  it('renvoie undefined si l’élément n’existe pas', async () => {
    expect(getPreviousItemId(idATrouver, [])).toEqual(undefined)
    expect(
      getPreviousItemId(idATrouver, [{ id: 'id2' }, { id: 'id3' }])
    ).toEqual(undefined)
  })

  it('renvoie l’élément précédent', async () => {
    expect(
      getPreviousItemId(idATrouver, [
        { id: 'id-precedent' },
        { id: idATrouver },
      ])
    ).toEqual('id-precedent')
  })

  it('renvoie l’élément suivant', async () => {
    expect(
      getPreviousItemId(idATrouver, [{ id: idATrouver }, { id: 'id-suivant' }])
    ).toEqual('id-suivant')
  })

  it('renvoie undefined si seul élément de la liste', async () => {
    expect(getPreviousItemId(idATrouver, [{ id: idATrouver }])).toEqual(
      undefined
    )
  })
})
