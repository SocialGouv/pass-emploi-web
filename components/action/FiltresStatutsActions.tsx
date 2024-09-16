import React, {
  ChangeEvent,
  FormEvent,
  ForwardedRef,
  forwardRef,
  useEffect,
  useState,
} from 'react'

import propsStatutsActions from 'components/action/propsStatutsActions'
import Button from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Badge } from 'components/ui/Indicateurs/Badge'
import { StatutAction } from 'interfaces/action'

type FiltresStatutsActionsProps = {
  onFiltres: (statutsSelectionnes: StatutAction[]) => void
  defaultValue: StatutAction[]
}

function FiltresStatutsActions(
  { onFiltres, defaultValue = [] }: FiltresStatutsActionsProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const [afficherFiltresStatuts, setAfficherFiltresStatuts] =
    useState<boolean>(false)
  const [statutsSelectionnes, setStatutsSelectionnes] = useState<
    StatutAction[]
  >([])

  function renderFiltresStatuts(statut: StatutAction): JSX.Element {
    const id = `statut-${statut.toLowerCase()}`
    return (
      <label key={id} htmlFor={id} className='flex items-center pb-4'>
        <input
          type='radio'
          value={statut}
          id={id}
          name={propsStatutsActions[statut].label}
          className='h-5 w-5 shrink-0'
          checked={statutsSelectionnes.includes(statut)}
          onChange={actionnerStatut}
        />
        <span className='pl-5'>{propsStatutsActions[statut].label}</span>
      </label>
    )
  }

  function actionnerStatut(e: ChangeEvent<HTMLInputElement>) {
    const statut = e.target.value
    if (statut === 'Tout sélectionner') setStatutsSelectionnes([])
    else setStatutsSelectionnes([statut as StatutAction])
  }

  function filtrerActions(e: FormEvent) {
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
        title='Filtrer les actions par statut'
        className='flex items-center p-4 w-full h-full gap-2'
        type='button'
      >
        Statut
        <IconComponent
          name={IconName.Filter}
          role='img'
          aria-label='Filtrer les actions'
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
          onSubmit={filtrerActions}
        >
          <fieldset className='flex flex-col p-2'>
            <legend className='sr-only'>
              Choisir un ou plusieurs statuts à filtrer
            </legend>
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
                name='Tout sélectionner'
                checked={statutsSelectionnes.length === 0}
                onChange={actionnerStatut}
              />
              <span className='pl-5'>Tout sélectionner</span>
            </label>
            {Object.keys(StatutAction).map((statut) =>
              renderFiltresStatuts(statut as StatutAction)
            )}
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

export default forwardRef(FiltresStatutsActions)
