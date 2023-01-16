import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import RadioBox from 'components/action/RadioBox'

export default {
  title: 'Components/Form/RadioButton',
  component: RadioBox,
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
} as ComponentMeta<typeof RadioBox>

const Template: ComponentStory<typeof RadioBox> = (args) => (
  <RadioBox {...args} />
)

export const Default = Template.bind({})
Default.args = {
  isSelected: true,
  label: 'Commencée',
  disabled: false,
}
