import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'
import DeprecatedSuccessMessage from 'components/DeprecatedSuccessMessage'

export default {
  title: 'Components/Notifications/OldSuccessMessage',
  component: DeprecatedSuccessMessage,
  argTypes: {
    label: {
      control: { type: 'text' },
    },
    onAcknowledge: { action: "j'ai compris" },
  },
} as ComponentMeta<typeof DeprecatedSuccessMessage>

const Template: ComponentStory<typeof DeprecatedSuccessMessage> = (args) => (
  <DeprecatedSuccessMessage {...args} />
)

export const Default = Template.bind({})
Default.args = {
  label: "L'action a bien été supprimée",
}
