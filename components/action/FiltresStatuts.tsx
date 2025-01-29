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

type FiltresStatutsProps = {
  defaultValue: string[]
  entites: string
  propsStatuts: {
    [key: string]: {
      label: string
    }
  }
  statuts: string[]
  onFiltres: (statutsSelectionnes: string[]) => void
}

function FiltresStatuts(
  {
    defaultValue = [],
    propsStatuts,
    statuts,
    entites,
    onFiltres,
  }: FiltresStatutsProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const [afficherFiltresStatuts, setAfficherFiltresStatuts] =
    useState<boolean>(false)
  const [statutsSelectionnes, setStatutsSelectionnes] = useState<string[]>([])

  function renderFiltresStatuts(statut: string): ReactElement {
    const id = `statut-${statut.toLowerCase()}`
    return (
      <label key={id} htmlFor={id} className='flex items-center pb-4'>
        <input
          type='radio'
          value={statut}
          id={id}
          name='filtres-statuts--option'
          className='h-5 w-5 shrink-0'
          checked={statutsSelectionnes.includes(statut)}
          onChange={actionnerStatut}
        />
        <span className='pl-5'>{propsStatuts[statut].label}</span>
      </label>
    )
  }

  function actionnerStatut(e: ChangeEvent<HTMLInputElement>) {
    const statut = e.target.value
    if (statut === 'Tout sélectionner') setStatutsSelectionnes([])
    else setStatutsSelectionnes([statut])
  }

  function filtrer(e: FormEvent) {
    e.preventDefault()
    onFiltres(statutsSelectionnes)
    setAfficherFiltresStatuts(false)
  }

  useEffect(() => {
    setStatutsSelectionnes(defaultValue)
  }, [afficherFiltresStatuts])

  return (
    <div className='relative'>
      <button
        ref={ref}
        aria-controls='filtres-statut'
        aria-expanded={afficherFiltresStatuts}
        onClick={() => setAfficherFiltresStatuts(!afficherFiltresStatuts)}
        title={`Filtrer les ${entites} par statut`}
        className='flex items-center p-4 w-full h-full gap-2'
        type='button'
      >
        Statut
        <IconComponent
          name={IconName.Filter}
          role='img'
          aria-label={`Filtrer les ${entites}`}
          className='h-6 w-6 fill-primary'
        />
        {statutsSelectionnes.length > 0 && (
          <>
            <Badge
              count={statutsSelectionnes.length}
              bgColor='primary'
              textColor='white'
              size={6}
            />
            <span className='sr-only'> filtre sélectionné</span>
          </>
        )}
      </button>

      {afficherFiltresStatuts && (
        <form
          className='absolute w-max left-0 z-10 bg-white rounded-base shadow-base p-4 text-base-regular'
          id='filtres-statut'
          onSubmit={filtrer}
        >
          <fieldset className='flex flex-col p-2'>
            <legend className='sr-only'>Choisir un statut à filtrer</legend>
            <label
              key='statut-tout-selectionner'
              htmlFor='statut-tout-selectionner'
              className='flex items-center pb-4 text-base-bold'
            >
              <input
                type='radio'
                value='Tout sélectionner'
                id='statut-tout-selectionner'
                className='h-5 w-5 shrink-0'
                name='filtres-statuts--option'
                checked={statutsSelectionnes.length === 0}
                onChange={actionnerStatut}
              />
              <span className='pl-5'>Tout sélectionner</span>
            </label>
            {statuts.map(renderFiltresStatuts)}
          </fieldset>
          <Button className='w-full justify-center' type='submit'>
            Valider
            <span className='sr-only'> la sélection des statuts</span>
          </Button>
        </form>
      )}
    </div>
  )
}

export default forwardRef(FiltresStatuts)
