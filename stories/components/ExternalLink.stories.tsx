import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import ExternalLink from 'components/ui/Navigation/ExternalLink'

export default {
  title: 'Components/External Link',
  component: ExternalLink,
  argTypes: {
    href: {},
    label: {
      control: { type: 'text' },
    },
    onClick: { action: 'clicked' },
  },
} as ComponentMeta<typeof ExternalLink>

const Template: ComponentStory<typeof ExternalLink> = (args) => (
  <ExternalLink {...args} />
)

export const Default = Template.bind({})
Default.args = {
  label: 'Un lien externe',
}
