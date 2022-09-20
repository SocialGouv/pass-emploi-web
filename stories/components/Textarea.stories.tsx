import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Textarea from 'components/ui/Form/Textarea'

export default {
  title: 'Components/Form/Textarea',
  component: Textarea,
  argTypes: {
    rows: {
      control: { type: 'number', description: 'Nombre de ligne visibles' },
    },
    maxLength: {
      control: { type: 'number', description: 'Nombre maximum de caractères' },
    },
    invalid: {
      type: 'boolean',
      description:
        "Modifie le style d'un champ invalide et le lie à la description de l'erreur,",
    },
    required: {
      control: {
        type: 'boolean',
        description: 'Défini si le champ est requis ou non',
      },
    },
    disabled: {
      control: {
        type: 'boolean',
        description: 'Défini si le champ est actif ou non',
      },
    },
  },
} as ComponentMeta<typeof Textarea>

const Template: ComponentStory<typeof Textarea> = (args) => (
  <Textarea {...args} />
)

export const Default = Template.bind({})
Default.args = {
  rows: 3,
  maxLength: 120,
  required: true,
  disabled: false,
  invalid: false,
}
