import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'
import { useState } from 'react'

import LocaliteSelectAutocomplete from 'components/ui/Form/LocaliteSelectAutocomplete'
import { desLocalites } from 'fixtures/referentiel'
import { Localite } from 'interfaces/referentiel'

export default {
  title: 'Components/Form/LocaliteSelectAutocomplete',
  component: LocaliteSelectAutocomplete,
} as ComponentMeta<typeof LocaliteSelectAutocomplete>

const Template: ComponentStory<typeof LocaliteSelectAutocomplete> = () => {
  const [query, setQuery] = useState<{
    localite: Localite | undefined
    hasError: boolean
  }>({ localite: undefined, hasError: false })

  return (
    <>
      <p>
        Localite :{' '}
        {query.localite && (
          <span>
            {query.localite.libelle} ({query.localite.code})
          </span>
        )}
      </p>
      <p>Error : {query.hasError ? 'true' : 'false'}</p>
      <LocaliteSelectAutocomplete
        fetchLocalites={fetchLocalites}
        onUpdateLocalite={setQuery}
      />
    </>
  )
}

async function fetchLocalites(): Promise<Localite[]> {
  return desLocalites()
}

export const Default = Template.bind({})
Default.args = {}
