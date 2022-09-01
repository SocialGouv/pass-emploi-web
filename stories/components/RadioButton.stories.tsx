import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import RadioButton from '../../components/action/RadioButton'

export default {
  title: 'Components/Form/RadioButton',
  component: RadioButton,
  argTypes: {
    isSelected: {
      control: { type: 'boolean' },
      description: '',
    },
    label: {
      control: { type: 'text' },
      description: 'Le label associé au radio button',
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
} as ComponentMeta<typeof RadioButton>

const Template: ComponentStory<typeof RadioButton> = (args) => (
  <RadioButton {...args} />
)

export const Default = Template.bind({})
Default.args = {
  isSelected: true,
  label: 'Commencée',
  disabled: false,
}
