import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import { Badge } from '../../components/ui/Indicateurs/Badge'

export default {
  title: 'Components/Indicateurs/Badge',
  component: Badge,
  argTypes: {
    count: {
      control: { type: 'number' },
      description: 'Le nombre ',
    },
    bgColor: {
      control: { type: 'text' },
      description: 'La couleur de fond du badge',
    },
  },
} as ComponentMeta<typeof Badge>

const Template: ComponentStory<typeof Badge> = (args) => <Badge {...args} />

export const Default = Template.bind({})
Default.args = {
  count: 2,
  size: 6,
  css: 'bg-primary_darken',
}
