import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import InformationMessage from 'components/ui/InformationMessage'

export default {
  title: 'Components/Notifications/InformationMessage',
  component: InformationMessage,
  argTypes: {
    content: {
      control: { type: 'text' },
      description: 'Le message d’information',
    },
    children: {
      control: { type: 'text' },
      description:
        'La notification avec une description. Facultatif, le composant permet d’encapsuler n’importe quel `children`',
    },
  },
} as ComponentMeta<typeof InformationMessage>

const Template: ComponentStory<typeof InformationMessage> = (args) => (
  <InformationMessage {...args} />
)

export const Default_with_children = Template.bind({})
Default_with_children.args = {
  content: 'Un message',
  children: 'Je suis une description d’un message d’information',
}
