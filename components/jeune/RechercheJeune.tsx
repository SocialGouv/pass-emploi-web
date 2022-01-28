import { FormEvent, useRef, useState } from 'react'
import SearchIcon from '../../assets/icons/search.svg'

interface RechercheJeuneProps {
  rechercheJeune?: string
  onSearchFilterBy: (query: string) => void
}

export const RechercheJeune = ({
  rechercheJeune,
  onSearchFilterBy,
}: RechercheJeuneProps) => {
  const [query, setQuery] = useState<string | null>(rechercheJeune ?? '')

  const ref = useRef<HTMLFormElement>(null)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearchFilterBy(query)
  }
  //TODO: Ajouter button reset ou natif avec attribute search? + background-image

  return (
    <form role='search' ref={ref} onSubmit={onSubmit}>
      <label htmlFor='rechercher-jeunes'>Rechercher un jeune par son nom</label>
      <div
        className={
          'flex mt-3.5 mb-8 w-9/12 rounded-medium border border-content_color'
        }
      >
        <>
          <input
            type='search'
            id='rechercher-jeunes'
            name='rechercher-jeunes'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`flex-1 p-3 w-8/12 rounded-medium text-sm`}
          />
          <button type='reset' className={'w-8'}>
            <span className='visually-hidden'>Effacer le champ de saisie</span>X
          </button>
        </>

        <button
          className={
            'flex p-3 items-center text-base-medium text-bleu_nuit border-l-2 border-content_color'
          }
          type='submit'
        >
          <SearchIcon focusable='false' aria-hidden={true} />
          <span className={'ml-1'}>Rechercher</span>
        </button>
      </div>
    </form>
  )
}
