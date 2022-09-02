import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Select from 'components/ui/Form/Select'

export default {
  title: 'Components/Form/Select',
  component: Select,
  argTypes: {
    required: {
      control: {
        type: 'boolean',
        description: 'Défini si une valeur est requise ou non',
      },
    },
    disabled: {
      control: {
        type: 'boolean',
        description: 'Défini si la liste est active ou non',
      },
    },
  },
} as ComponentMeta<typeof Select>

const Template: ComponentStory<typeof Select> = (args) => (
  <Select {...args}>
    <option>Option 1</option>
    <option>Option 2</option>
    <option>Option 3</option>
  </Select>
)

export const Default = Template.bind({})
Default.args = {
  required: true,
  disabled: false,
}
