import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Multiselection from 'components/ui/Form/Multiselection'

export default {
  title: 'Components/Multiselection',
  component: Multiselection,
  argTypes: {
    selection: {
      control: { type: 'object' },
    },
    typeSelection: {
      control: { type: 'text' },
    },
    infoLabel: {
      control: { type: 'text' },
    },
    unselect: { action: 'changed' },
  },
} as ComponentMeta<typeof Multiselection>

const Template: ComponentStory<typeof Multiselection> = (args) => (
  <Multiselection {...args} />
)

export const Default = Template.bind({})
Default.args = {
  selection: [
    {
      id: 'jeune-1',
      value: 'Kobe Bryant',
      avecIndication: false,
      estUneListe: false,
    },
    {
      id: 'jeune-2',
      value: 'Chris Paul',
      avecIndication: true,
      estUneListe: false,
    },
    {
      id: 'liste-1',
      value: 'All Stars',
      avecIndication: false,
      estUneListe: true,
    },
  ],
  typeSelection: 'jeune',
  unselect: () => undefined,
}
