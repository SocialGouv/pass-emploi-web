import { queryHelpers } from '@testing-library/dom'
import { screen } from '@testing-library/react'

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
