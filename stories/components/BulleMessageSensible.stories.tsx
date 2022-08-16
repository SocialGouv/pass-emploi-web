import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import BulleMessageSensible from '../../components/ui/BulleMessageSensible'

export default {
  title: 'Components/Form/BulleMessageSensible',
  component: BulleMessageSensible,
} as ComponentMeta<typeof BulleMessageSensible>

const Template: ComponentStory<typeof BulleMessageSensible> = () => (
  <BulleMessageSensible />
)

export const Default = Template.bind({})
