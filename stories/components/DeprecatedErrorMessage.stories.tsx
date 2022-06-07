import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import { DeprecatedErrorMessage } from 'components/ui/DeprecatedErrorMessage'

export default {
  title: 'Components/Form/DeprecatedErrorMessage',
  component: DeprecatedErrorMessage,
  argTypes: {
    children: {
      control: { type: 'text' },
      description: 'Le message contenu',
    },
  },
} as ComponentMeta<typeof DeprecatedErrorMessage>

const Template: ComponentStory<typeof DeprecatedErrorMessage> = (args) => (
  <DeprecatedErrorMessage {...args} />
)

export const Default_with_icon = Template.bind({})
Default_with_icon.args = {
  children: "Message d'erreur",
}
