import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'
import { OldErrorMessage } from 'components/ui/OldErrorMessage'

export default {
  title: 'Components/Form/ErrorMessage',
  component: OldErrorMessage,
  argTypes: {
    children: {
      control: { type: 'text' },
      description: 'Le message contenu',
    },
  },
} as ComponentMeta<typeof OldErrorMessage>

const Template: ComponentStory<typeof OldErrorMessage> = (args) => (
  <OldErrorMessage {...args} />
)

export const Default_with_icon = Template.bind({})
Default_with_icon.args = {
  children: "Message d'erreur",
}
