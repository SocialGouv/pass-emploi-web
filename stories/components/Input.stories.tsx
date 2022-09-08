import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Input from 'components/ui/Form/Input'

export default {
  title: 'Components/Form/Input',
  component: Input,
  argTypes: {
    type: {
      control: {
        type: 'text',
        description: "Défini le type d'input souhaité",
      },
    },
    invalid: {
      control: {
        type: 'boolean',
        description:
          "Modifie le style d'un champ invalide et le lie à la description de l'erreur,",
      },
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
} as ComponentMeta<typeof Input>

const Template: ComponentStory<typeof Input> = (args) => <Input {...args} />

export const Default = Template.bind({})
Default.args = {
  type: 'text',
  required: true,
  disabled: false,
  invalid: false,
}
