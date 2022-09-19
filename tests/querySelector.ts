import { queryHelpers } from '@testing-library/dom'
import { screen, within } from '@testing-library/react'

//FIXME: https://github.com/testing-library/dom-testing-library/issues/140#issuecomment-1113146869
export default function getByDefinitionTerm(accessibleName: string) {
  const termElement = screen.getByRole('term', { name: accessibleName })
  const definitionElement = termElement.nextElementSibling

  if (!definitionElement || definitionElement.tagName !== 'DD')
    throw queryHelpers.getElementError(
      `No <dd /> element found for term "${accessibleName}"`,
      document.body
    )

  return definitionElement
}

export function getByTextContent(
  text: string,
  parent?: HTMLElement
): HTMLElement {
  const root = parent ? within(parent) : screen
  return root.getByText((_, element) => {
    const hasText = (element: Element | null) => element?.textContent === text
    const elementHasText = hasText(element)
    const childrenDontHaveText = Array.from(element?.children || []).every(
      (child) => !hasText(child)
    )
    return elementHasText && childrenDontHaveText
  })
}
