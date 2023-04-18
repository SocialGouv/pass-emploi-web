import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import IconCheckbox from 'components/ui/Form/IconCheckbox'
import { IconName } from 'components/ui/IconComponent'

export default {
  title: 'Components/IconCheckbox',
  component: IconCheckbox,
  argTypes: {
    checkedIconName: {
      control: { type: 'text' },
    },
    uncheckedIconName: {
      control: { type: 'text' },
    },
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
} as ComponentMeta<typeof IconCheckbox>

const Template: ComponentStory<typeof IconCheckbox> = (args) => (
  <IconCheckbox className='w-8 h-8' {...args} />
)

export const Default = Template.bind({})
Default.args = {
  checkedIconName: IconName.Flag,
  uncheckedIconName: IconName.Flag,
  checkedLabel: 'Désactiver',
  uncheckedLabel: 'Activer',
  checked: false,
}
