import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import EchecMessage from 'components/EchecMessage'

export default {
  title: 'Components/Notifications/EchecMessage',
  component: EchecMessage,
  argTypes: {
    label: {
      control: { type: 'text' },
    },
    onAcknowledge: { action: "j'ai compris" },
  },
} as ComponentMeta<typeof EchecMessage>

const Template: ComponentStory<typeof EchecMessage> = (args) => (
  <EchecMessage {...args} />
)

export const Default = Template.bind({})
Default.args = {
  label: "Une erreur s'est produite",
}
