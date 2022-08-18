import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import { Switch } from '../../components/ui/Form/Switch'

export default {
  title: 'Components/Switch',
  component: Switch,
  argTypes: {
    checkedLabel: {
      control: { type: 'text' },
    },
    uncheckedLabel: {
      control: { type: 'text' },
    },
    checked: {
      control: { type: 'boolean' },
    },
    onChange: { action: 'changed' },
  },
} as ComponentMeta<typeof Switch>

const Template: ComponentStory<typeof Switch> = (args) => <Switch {...args} />

export const Default = Template.bind({})
Default.args = {
  checkedLabel: 'Activé',
  uncheckedLabel: 'Désactivé',
  checked: false,
}
