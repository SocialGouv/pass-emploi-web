import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import propsStatutsActions from 'components/action/propsStatutsActions'
import Button from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { HeaderCell } from 'components/ui/Table/HeaderCell'
import { StatutAction } from 'interfaces/action'

type FiltresStatutsActionsProps = {
  style: string
  onFiltres: (statutsSelectionnes: StatutAction[]) => void
  defaultValue?: StatutAction[]
}

export default function FiltresStatutsActions({
  style,
  onFiltres,
  defaultValue = [],
}: FiltresStatutsActionsProps) {
  const [afficherFiltresStatuts, setAfficherFiltresStatuts] =
    useState<boolean>(false)
  const [statutsSelectionnes, setStatutsSelectionnes] = useState<
    StatutAction[]
  >([])

  function renderFiltresStatuts(statut: StatutAction): JSX.Element {
    const id = `statut-${statut.toLowerCase()}`
    return (
      <label key={id} htmlFor={id} className='flex pb-8'>
        <input
          type='checkbox'
          value={statut}
          id={id}
          className='h-5 w-5'
          checked={statutsSelectionnes.includes(statut)}
          onChange={actionnerStatut}
        />
        <span className='pl-5'>{propsStatutsActions[statut].label}</span>
      </label>
    )
  }

  function actionnerStatut(e: ChangeEvent<HTMLInputElement>) {
    const statut = e.target.value as StatutAction
    if (statutsSelectionnes.includes(statut)) {
      setStatutsSelectionnes(statutsSelectionnes.filter((s) => s !== statut))
    } else {
      setStatutsSelectionnes(statutsSelectionnes.concat(statut))
    }
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
    <HeaderCell className={`relative ${style}`}>
      <button
        aria-controls='filtres-statut'
        aria-expanded={afficherFiltresStatuts}
        onClick={() => setAfficherFiltresStatuts(!afficherFiltresStatuts)}
        aria-label='Statut - Filtrer les actions'
        className='flex items-center'
      >
        Statut
        <IconComponent
          name={
            afficherFiltresStatuts ? IconName.ChevronUp : IconName.ChevronDown
          }
          className='h-4 w-4 ml-2 fill-primary'
        />
      </button>
      {afficherFiltresStatuts && (
        <form
          className='absolute z-10 bg-blanc rounded-medium shadow-s p-4 text-base-regular'
          id='filtres-statut'
          onSubmit={filtrerActions}
        >
          <fieldset className='flex flex-col p-2'>
            <legend className='sr-only'>
              Choisir un ou plusieurs statuts à filtrer
            </legend>
            {Object.keys(StatutAction).map((statut) =>
              renderFiltresStatuts(statut as StatutAction)
            )}
          </fieldset>
          <Button className='w-full justify-center' type='submit'>
            Valider
          </Button>
        </form>
      )}
    </HeaderCell>
  )
}
