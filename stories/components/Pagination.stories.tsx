import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Pagination from 'components/ui/Pagination'

export default {
  title: 'Components/Pagination',
  component: Pagination,
  argTypes: {
    pageCourante: {
      control: { type: 'number' },
    },
    nombreDePages: {
      control: { type: 'number' },
    },
    nomListe: {
      control: { type: 'text' },
    },
    allerALaPage: { action: 'changed' },
  },
} as ComponentMeta<typeof Pagination>

const Template: ComponentStory<typeof Pagination> = (args) => (
  <Pagination {...args} />
)

export const Default = Template.bind({})
Default.args = {
  pageCourante: 1,
  nombreDePages: 10,
  allerALaPage: () => undefined,
  nomListe: 'whatever',
}
