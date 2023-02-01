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
    textColor: {
      control: { type: 'text' },
      description: 'La couleur du texte du badge',
    },
    size: {
      control: { type: 'text' },
      description: 'La taille du badge',
    },
    style: {
      control: { type: 'text' },
      description: 'Le style supplémentaire',
    },
  },
} as ComponentMeta<typeof Badge>

const Template: ComponentStory<typeof Badge> = (args) => <Badge {...args} />

export const Default = Template.bind({})
Default.args = {
  count: 2,
  size: 6,
  bgColor: 'primary_darken',
  textColor: 'blanc',
  style: '',
}
