import { FormEvent, useState } from 'react'

import ResettableTextInput from 'components/ui/Form/ResettableTextInput'
import IconComponent, { IconName } from 'components/ui/IconComponent'

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
        Rechercher un bénéficiaire par son nom de famille
      </label>
      <div className='flex mt-1'>
        <ResettableTextInput
          id={'rechercher-jeunes'}
          defaultValue={query}
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
            className='w-6 h-6 fill-[currentColor]'
          />
          <span className='ml-1 sr-only layout_s:not-sr-only'>Rechercher</span>
        </button>
      </div>
    </form>
  )
}
