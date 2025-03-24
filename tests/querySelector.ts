import { getNodeText, queryHelpers } from '@testing-library/dom'
import { screen, within } from '@testing-library/react'

export default function getByDescriptionTerm(
  descriptionTerm: string,
  parent?: HTMLElement
): HTMLElement {
  function isHTMLElement(element: any): element is HTMLElement {
    return element instanceof HTMLElement
  }
  function isDescriptionTerm(node: HTMLElement): boolean {
    return node.tagName === 'DT'
  }
  function hasText(node: HTMLElement): boolean {
    return (
      getNodeText(node) === descriptionTerm ||
      Array.from(node.children).some(
        (child) => isHTMLElement(child) && hasText(child)
      )
    )
  }

  const container = parent ? within(parent) : screen
  const matches = container
    .getAllByRole('definition')
    .filter(
      (node) =>
        node.tagName === 'DD' &&
        isHTMLElement(node.previousElementSibling) &&
        isDescriptionTerm(node.previousElementSibling) &&
        hasText(node?.previousElementSibling)
    )

  if (!matches.length)
    throw queryHelpers.getElementError(
      `No <dt /> or <dd /> element found with term "${descriptionTerm}"`,
      parent ?? document.body
    )
  if (matches.length > 1)
    throw queryHelpers.getElementError(
      `Multiple <dt /> elements found with term "${descriptionTerm}"`,
      parent ?? document.body
    )

  return matches[0]
}

export function getByTextContent(
  text: string,
  parent?: HTMLElement
): HTMLElement {
  const root = parent ? within(parent) : screen
  return root.getByText((_, element) => {
    const hasText = (el: Element | null) => el?.textContent === text
    const elementHasText = hasText(element)
    const childrenDontHaveText = Array.from(element?.children || []).every(
      (child) => !hasText(child)
    )
    return elementHasText && childrenDontHaveText
  })
}
