import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'
import SuccessMessage from 'components/SuccessMessage'

export default {
  title: 'Components/Notifications/SuccessMessage',
  component: SuccessMessage,
  argTypes: {
    label: {
      control: { type: 'text' },
    },
    onAcknowledge: { action: "j'ai compris" },
  },
} as ComponentMeta<typeof SuccessMessage>

const Template: ComponentStory<typeof SuccessMessage> = (args) => (
  <SuccessMessage {...args} />
)

export const Default = Template.bind({})
Default.args = {
  label: "L'action a bien été supprimée",
}
