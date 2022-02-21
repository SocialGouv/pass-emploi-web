import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'
import ResettableTextInput from 'components/ResettableTextInput'

export default {
  title: 'Components/Form/ResettableTextInput',
  component: ResettableTextInput,
  argTypes: {
    id: { description: "Id de l'input" },
    value: {
      control: { type: 'text' },
    },
    disabled: { type: 'boolean' },
    type: {
      options: ['text', 'email'],
      control: { type: 'radio' },
      description: "Le type de l'input",
    },
    onReset: { description: 'Efface le champ de saisie' },
    onChange: {},
    roundedRight: {
      type: 'boolean',
      description: 'La forme du border right du bouton de reset',
    },
  },
} as ComponentMeta<typeof ResettableTextInput>

const Template: ComponentStory<typeof ResettableTextInput> = (args) => (
  <ResettableTextInput {...args} />
)

export const Default = Template.bind({})
Default.args = {}
