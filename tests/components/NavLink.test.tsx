import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'

import NavLink from 'components/ui/Form/NavLink'
import { IconName } from 'components/ui/IconComponent'

describe('<NavLink/>', () => {
  const badgeLabel = 'Vous avez une action en attente'
  const label = 'Un super lien'
  const href = '/whatever'

  it('affiche un lien avec un badge', () => {
    //When
    render(
      <NavLink
        label={label}
        href={href}
        badgeLabel={badgeLabel}
        iconName={IconName.Warning}
        showLabelOnSmallScreen={false}
      />
    )

    //Then
    const lien = screen.getByRole('link', {
      name: 'Un super lien Vous avez une action en attente',
    })
    expect(lien).toHaveAttribute('href', href)
    expect(screen.getByText(badgeLabel)).toBeInTheDocument()
  })

  it('affiche un lien avec un badge avec label sur petit écran', () => {
    //When
    render(
      <NavLink
        label={label}
        href={href}
        badgeLabel={badgeLabel}
        iconName={IconName.Warning}
        showLabelOnSmallScreen={true}
      />
    )

    //Then
    const lien = screen.getByRole('link', {
      name: 'Un super lien Vous avez une action en attente',
    })
    expect(lien).toHaveAttribute('href', href)
    expect(screen.getByText(badgeLabel)).toBeInTheDocument()
  })
})
