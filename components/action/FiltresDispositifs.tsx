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

type FiltresDispositifsProps = {
  dispositifs: string[]
  onFiltres: (dispositifSelectionne?: string) => void
  defaultValue?: string
}

function FiltresDispositifs(
  { defaultValue, dispositifs, onFiltres }: FiltresDispositifsProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const [afficherFiltres, setAfficherFiltres] = useState<boolean>(false)
  const [dispositifSelectionne, setDispositifSelectionne] = useState<string>()

  function renderFiltres(dispositif: string): ReactElement {
    const id = `dispositif-${dispositif.toLowerCase()}`
    return (
      <label
        key={id}
        htmlFor={id}
        className='cursor-pointer p-2 flex items-center gap-5 hover:bg-primary-lighten'
      >
        <input
          type='radio'
          value={dispositif}
          id={id}
          name='filtres-dispositifs--option'
          className='h-5 w-5 shrink-0'
          checked={dispositifSelectionne === dispositif}
          onChange={actionnerDispositif}
        />
        {dispositif}
      </label>
    )
  }

  function actionnerDispositif(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setDispositifSelectionne(value !== 'all' ? value : undefined)
  }

  function filtrer(e: FormEvent) {
    e.preventDefault()
    onFiltres(dispositifSelectionne)
    setAfficherFiltres(false)
  }

  useEffect(() => {
    setDispositifSelectionne(defaultValue)
  }, [afficherFiltres])

  return (
    <div className='relative'>
      <button
        ref={ref}
        aria-controls='filtres-dispositifs'
        aria-expanded={afficherFiltres}
        onClick={() => setAfficherFiltres(!afficherFiltres)}
        title='Filtrer par dispositifs'
        aria-label='Filtrer par dispositifs'
        className='flex items-center text-s-regular w-full h-full gap-2'
        type='button'
      >
        Dispositif
        <IconComponent
          name={IconName.Filter}
          aria-hidden={true}
          focusable={false}
          className='h-6 w-6 fill-primary'
        />
        {dispositifSelectionne && (
          <>
            <Badge count={1} className='text-white bg-primary' />
            <span className='sr-only'> filtre sélectionné</span>
          </>
        )}
      </button>

      {afficherFiltres && (
        <form
          className='absolute w-max left-0 z-30 bg-white rounded-base shadow-base p-4 text-base-regular'
          id='filtres-dispositifs'
          onSubmit={filtrer}
        >
          <fieldset className='flex flex-col'>
            <legend className='sr-only'>Choisir un dispositif à filtrer</legend>
            <label
              key='dispositif-tout-selectionner'
              htmlFor='dispositif-tout-selectionner'
              className='p-2 cursor-pointer flex items-center gap-5 text-base-bold hover:bg-primary-lighten'
            >
              <input
                type='radio'
                value='all'
                id='dispositif-tout-selectionner'
                className='h-5 w-5 shrink-0'
                name='filtres-dispositifs--option'
                checked={dispositifSelectionne === undefined}
                onChange={actionnerDispositif}
              />
              Tous les dispositifs
            </label>
            {dispositifs.map(renderFiltres)}
          </fieldset>
          <Button className='w-full justify-center' type='submit'>
            Valider
            <span className='sr-only'> la sélection du dispositif</span>
          </Button>
        </form>
      )}
    </div>
  )
}

export default forwardRef(FiltresDispositifs)
