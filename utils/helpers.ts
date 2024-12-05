export function getPreviousItemId<T extends { id: string }>(
  idCible: string,
  list: T[]
): string | undefined {
  const indexItem = list.findIndex(({ id }) => id === idCible)
  if (indexItem === -1) return undefined // item non trouvé
  if (indexItem > 0) return list[indexItem - 1].id // item précédent
  if (list.length > 1) return list[1].id // item suivant
}

export function isEmailValid(email: string) {
  // https://sonarcloud.io/organizations/socialgouv/rules?open=typescript%3AS5852&rule_key=typescript%3AS5852
  // https://www.regular-expressions.info/email.html
  const mailRegExp =
    /^[A-Z0-9._%+\-’']{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i
  return mailRegExp.test(email)
}

export function redirectedFromHome(referer: string): boolean {
  return referer.split('?')[0].endsWith('/')
}

export function unsafeRandomId(): string {
  return Math.random().toString().slice(2)
}

const TYPE_NODE_TEXT = 3
const TYPE_NODE_ELEMENT = 1
export function getVisibleText(nodes: Node | Node[]): string | null {
  if (Object.prototype.hasOwnProperty.call(nodes, 'length'))
    return (
      (nodes as Node[])
        .map(getVisibleText)
        .filter((visibleText) => visibleText !== null)
        .join(' ')
        .trim() || null
    )

  const node = nodes as Node
  if (node.nodeType === TYPE_NODE_TEXT) return node.nodeValue?.trim() || null
  if (node.nodeType !== TYPE_NODE_ELEMENT) return null

  const element = node as Element
  if (element.classList.contains('sr-only')) return null
  if (element.nodeName.toUpperCase() === 'SVG') return null

  if (element.nodeName.toUpperCase() === 'SELECT') {
    const selectedOptions = (element as HTMLSelectElement).selectedOptions
    return getVisibleText(Array.from(selectedOptions))
  }

  if (element.hasChildNodes())
    return getVisibleText(Array.from(node.childNodes))

  return null
}
