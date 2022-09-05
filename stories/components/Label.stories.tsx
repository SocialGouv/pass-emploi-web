import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Label from 'components/ui/Form/Label'

export default {
  title: 'Components/Form/Label',
  component: Label,
  argTypes: {
    inputRequired: {
      control: {
        type: 'boolean',
        description: "Indique si l'input lié est requis",
      },
    },
  },
} as ComponentMeta<typeof Label>

const Template: ComponentStory<typeof Label> = (args) => (
  <Label {...args}>Le contenu du label</Label>
)

export const Default = Template.bind({})
Default.args = {
  inputRequired: true,
}
