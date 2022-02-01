import { FormEvent, useRef, useState } from 'react'
import SearchIcon from '../../assets/icons/search.svg'
import CloseIcon from '../../assets/icons/close.svg'

interface RechercheJeuneProps {
  rechercheJeune?: string
  onSearchFilterBy: (query: string | undefined) => void
}

export const RechercheJeune = ({
  rechercheJeune,
  onSearchFilterBy,
}: RechercheJeuneProps) => {
  const [query, setQuery] = useState<string | undefined>(rechercheJeune ?? '')

  const ref = useRef<HTMLFormElement>(null)

  const onReset = (e: FormEvent) => {
    e.preventDefault()
    setQuery('')
    onSearchFilterBy('')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearchFilterBy(query)
  }

  return (
    <form role='search' ref={ref} onSubmit={onSubmit}>
      <label htmlFor='rechercher-jeunes' className='text-base-medium'>
        Rechercher un jeune par son nom
      </label>
      <div className='flex mt-3.5 mb-8 w-9/12'>
        {/*<div className='flex mt-3.5 mb-8 w-9/12 border border-content_color rounded-medium'>*/}
        <>
          <input
            type='text'
            id='rechercher-jeunes'
            name='rechercher-jeunes'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`flex-1 p-3 w-8/12 border-t border-b border-l border-r-none border-content_color rounded-l-medium text-sm`}
          />
          <span className='flex border-t border-b border-content_color'>
            <button
              type='reset'
              title='Effacer'
              className='border-none w-8 text-bleu_nuit'
              onClick={onReset}
            >
              <CloseIcon
                className='text-bleu_nuit'
                focusable={false}
                aria-hidden={true}
              />
              <span className='visually-hidden'>
                Effacer le champ de saisie
              </span>
            </button>
          </span>
        </>

        <button
          // className='flex p-3 items-center text-base-medium text-bleu_nuit border-l border-content_color rounded-r-medium hover:bg-primary_lighten'
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
