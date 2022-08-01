import { queryHelpers } from '@testing-library/dom'
import { screen } from '@testing-library/react'

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
