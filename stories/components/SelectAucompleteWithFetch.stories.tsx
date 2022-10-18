import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'
import { useState } from 'react'

import SelectAutocompleteWithFetch from 'components/ui/Form/SelectAutocompleteWithFetch'
import { desLocalites } from 'fixtures/referentiel'
import { Localite } from 'interfaces/referentiel'

export default {
  title: 'Components/Form/SelectAutocompleteWithFetch',
  component: SelectAutocompleteWithFetch,
} as ComponentMeta<typeof SelectAutocompleteWithFetch>

const Template: ComponentStory<typeof SelectAutocompleteWithFetch> = ({
  id,
  errorMessage,
  value,
  required,
}) => {
  const [query, setQuery] = useState<{
    selected?: Localite
    hasError: boolean
  }>({ hasError: false })

  return (
    <>
      <p>
        Localite :{' '}
        {query.selected && (
          <span>
            {query.selected.libelle} ({query.selected.code})
          </span>
        )}
      </p>
      <p>Error : {query.hasError ? 'true' : 'false'}</p>
      <SelectAutocompleteWithFetch<Localite>
        id={id}
        fieldNames={{ id: 'code', value: 'libelle' }}
        fetch={fetchLocalites}
        onUpdateSelected={setQuery}
        errorMessage={errorMessage}
        value={value}
        required={required}
      />
    </>
  )
}

async function fetchLocalites(): Promise<Localite[]> {
  return desLocalites()
}

export const Default = Template.bind({})
Default.args = {
  id: 'localisation',
  errorMessage: 'Veuillez saisir une localisation correcte.',
  required: true,
}
