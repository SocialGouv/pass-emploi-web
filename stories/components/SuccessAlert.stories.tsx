import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import SuccessAlert from '../../components/ui/Notifications/SuccessAlert'

export default {
  title: 'Components/Notifications/SuccessAlert',
  component: SuccessAlert,
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Le titre de l’alerte de succès',
    },
    onAcknowledge: {
      control: { type: 'boolean' },
      description:
        'L’alerte peut être fixe ou avoir un bouton permettant de la fermer',
    },
    children: {
      control: { type: 'text' },
      description: '',
    },
  },
} as ComponentMeta<typeof SuccessAlert>

const Template: ComponentStory<typeof SuccessAlert> = (args) => (
  <SuccessAlert {...args} />
)

export const Default_without_children = Template.bind({})
Default_without_children.args = {
  label: 'Message de succès',
}

export const with_children = Template.bind({})
with_children.args = {
  label: 'Message de succès',
  children: <p>Un message de description de l’alerte</p>,
}
