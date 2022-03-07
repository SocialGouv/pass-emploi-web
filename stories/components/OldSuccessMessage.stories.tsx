import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'
import OldSuccessMessage from 'components/OldSuccessMessage'

export default {
  title: 'Components/Notifications/OldSuccessMessage',
  component: OldSuccessMessage,
  argTypes: {
    label: {
      control: { type: 'text' },
    },
    onAcknowledge: { action: "j'ai compris" },
  },
} as ComponentMeta<typeof OldSuccessMessage>

const Template: ComponentStory<typeof OldSuccessMessage> = (args) => (
  <OldSuccessMessage {...args} />
)

export const Default = Template.bind({})
Default.args = {
  label: "L'action a bien été supprimée",
}
