import { ComponentMeta, ComponentStory } from '@storybook/react'
import { useState } from 'react'
import * as React from 'react'

import { SpinningLoader } from 'components/ui/SpinningLoader'

export default {
  title: 'Components/SpinningLoader',
  component: SpinningLoader,
} as ComponentMeta<typeof SpinningLoader>

const Template: ComponentStory<typeof SpinningLoaderContainer> = () => (
  <SpinningLoaderContainer />
)

export const Default = Template.bind({})
Default.args = {}

function SpinningLoaderContainer() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  return (
    <>
      <button
        role='button'
        onClick={() => setIsLoading(!isLoading)}
        className='p-2 bg-primary'
      >
        Toggle loader
      </button>
      <div aria-live='polite' aria-busy={isLoading}>
        {isLoading && <SpinningLoader />}
        {!isLoading && <p>Le chargement est terminé</p>}
      </div>
    </>
  )
}
