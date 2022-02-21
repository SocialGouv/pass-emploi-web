import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'
import { ErrorMessage } from 'components/ui/ErrorMessage'

export default {
  title: 'Components/Form/ErrorMessage',
  component: ErrorMessage,
  argTypes: {
    children: {
      control: { type: 'text' },
      description: 'Le message contenu',
    },
  },
} as ComponentMeta<typeof ErrorMessage>

const Template: ComponentStory<typeof ErrorMessage> = (args) => (
  <ErrorMessage {...args} />
)

export const Default_with_icon = Template.bind({})
Default_with_icon.args = {
  children: "Message d'erreur",
}
