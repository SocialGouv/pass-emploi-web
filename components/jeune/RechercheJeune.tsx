import { FormEvent, useState } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import ResettableTextInput from 'components/ui/ResettableTextInput'

interface RechercheJeuneProps {
  onSearchFilterBy: (query: string) => void
}

export const RechercheJeune = ({ onSearchFilterBy }: RechercheJeuneProps) => {
  const [query, setQuery] = useState<string>('')

  const onReset = () => {
    setQuery('')
    onSearchFilterBy('')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearchFilterBy(query)
  }

  return (
    <form role='search' onSubmit={onSubmit} className='grow max-w-[75%]'>
      <label
        htmlFor='rechercher-jeunes'
        className='text-base-medium text-content_color'
      >
        Rechercher un jeune par son nom de famille
      </label>
      <div className='flex mt-3.5'>
        <ResettableTextInput
          id={'rechercher-jeunes'}
          value={query}
          onChange={setQuery}
          onReset={onReset}
          className='flex-1 border border-solid border-grey_700 rounded-l-medium border-r-0 text-base-medium text-primary_darken'
        />

        <button
          className='flex p-3 items-center text-base-bold text-primary border border-primary rounded-r-medium hover:bg-primary_lighten'
          type='submit'
        >
          <IconComponent
            name={IconName.Search}
            focusable='false'
            aria-hidden={true}
            className='w-4 h-4'
          />
          <span className='ml-1'>Rechercher</span>
        </button>
      </div>
    </form>
  )
}
