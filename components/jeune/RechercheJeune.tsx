import { FormEvent, useState } from 'react'

import SearchIcon from '../../assets/icons/search.svg'

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
    <form role='search' onSubmit={onSubmit}>
      <label
        htmlFor='rechercher-jeunes'
        className='text-base-medium text-content_color'
      >
        Rechercher un jeune par son nom de famille
      </label>
      <div className='flex mt-3.5 w-9/12'>
        <ResettableTextInput
          id={'rechercher-jeunes'}
          value={query}
          onChange={setQuery}
          onReset={onReset}
          roundedRight={false}
        />

        <button
          className='flex p-3 items-center text-base-medium text-bleu_nuit border border-bleu_nuit rounded-r-medium hover:bg-primary_lighten'
          type='submit'
        >
          <SearchIcon focusable='false' aria-hidden={true} />
          <span className='ml-1'>Rechercher</span>
        </button>
      </div>
    </form>
  )
}
