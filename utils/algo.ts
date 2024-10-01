export function getPreviousItemId<T extends { id: string }>(
  idCible: string,
  list: T[]
): string | undefined {
  const indexItem = list.findIndex(({ id }) => id === idCible)
  if (indexItem === -1) return undefined // item non trouvé
  if (indexItem > 0) return list[indexItem - 1].id // item précédent
  if (list.length > 1) return list[1].id // item suivant
}
