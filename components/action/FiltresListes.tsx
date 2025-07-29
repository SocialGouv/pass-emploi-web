import React, {
  ChangeEvent,
  FormEvent,
  ForwardedRef,
  forwardRef,
  ReactElement,
  useEffect,
  useState,
} from 'react'

import Button from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Badge } from 'components/ui/Indicateurs/Badge'
import { Liste } from 'interfaces/liste'

type FiltresListesProps = {
  listes: Liste[]
  onFiltres: (listeSelectionnee?: string) => void
  defaultValue?: string
  className?: string
}

function FiltresListes(
  { defaultValue, listes, onFiltres, className }: FiltresListesProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const [afficherFiltres, setAfficherFiltres] = useState<boolean>(false)
  const [listeSelectionnee, setListeSelectionnee] = useState<string>()

  function renderFiltres(liste: Liste): ReactElement {
    const id = `liste-${liste.id.toLowerCase()}`
    return (
      <label
        key={id}
        htmlFor={id}
        className='cursor-pointer p-2 flex items-center gap-5 hover:bg-primary-lighten'
      >
        <input
          type='radio'
          value={liste.id}
          id={id}
          name='filtres-listes--option'
          className='h-5 w-5 shrink-0'
          checked={listeSelectionnee === liste.id}
          onChange={actionnerListe}
        />
        {liste.titre}
      </label>
    )
  }

  function actionnerListe(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setListeSelectionnee(value !== 'all' ? value : undefined)
  }

  function filtrer(e: FormEvent) {
    e.preventDefault()
    onFiltres(listeSelectionnee)
    setAfficherFiltres(false)
  }

  useEffect(() => {
    setListeSelectionnee(defaultValue)
  }, [afficherFiltres])

  return (
    <div className={'relative ' + (className ?? '')}>
      <button
        ref={ref}
        aria-controls='filtres-listes'
        aria-expanded={afficherFiltres}
        onClick={() => setAfficherFiltres(!afficherFiltres)}
        title='Filtrer par Listes'
        aria-label='Filtrer par listes'
        className='flex items-center text-s-regular w-full h-full gap-2'
        type='button'
      >
        Liste
        <IconComponent
          name={IconName.Filter}
          aria-hidden={true}
          focusable={false}
          className='h-6 w-6 fill-primary'
        />
        {listeSelectionnee && (
          <>
            <Badge count={1} className='text-white bg-primary' />
            <span className='sr-only'> filtre sélectionné</span>
          </>
        )}
      </button>

      {afficherFiltres && (
        <form
          className='absolute w-max left-0 z-30 bg-white rounded-base shadow-base p-4 text-base-regular'
          id='filtres-listes'
          onSubmit={filtrer}
        >
          <fieldset className='flex flex-col'>
            <legend className='sr-only'>Choisir une liste à filtrer</legend>
            <label
              key='liste-tout-selectionner'
              htmlFor='liste-tout-selectionner'
              className='p-2 cursor-pointer flex items-center gap-5 text-base-bold hover:bg-primary-lighten'
            >
              <input
                type='radio'
                value='all'
                id='liste-tout-selectionner'
                className='h-5 w-5 shrink-0'
                name='filtres-liste--option'
                checked={listeSelectionnee === undefined}
                onChange={actionnerListe}
              />
              Toutes les listes
            </label>
            {listes.map(renderFiltres)}
          </fieldset>
          <Button className='w-full justify-center' type='submit'>
            Valider
            <span className='sr-only'> la sélection des listes</span>
          </Button>
        </form>
      )}
    </div>
  )
}

export default forwardRef(FiltresListes)
