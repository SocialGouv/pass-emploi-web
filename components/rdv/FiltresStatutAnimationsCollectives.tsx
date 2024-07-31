import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import Button from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { StatutAnimationCollective } from 'interfaces/evenement'

type FiltresStatutAnimationsCollectivesProps = {
  onFiltres: (
    statutsAnimationsCollectivesSelectionnes: StatutAnimationCollective[]
  ) => void
  defaultValue?: StatutAnimationCollective[]
}

export default function FiltresStatutAnimationsCollectives({
  onFiltres,
  defaultValue = [],
}: FiltresStatutAnimationsCollectivesProps) {
  const [
    afficherFiltresAnimationsCollectives,
    setAfficherFiltresAnimationsCollectives,
  ] = useState<boolean>(false)
  const [
    statutsAnimationsCollectivesSelectionnes,
    setStatutsAnimationsCollectivesSelectionnes,
  ] = useState<StatutAnimationCollective[]>([])

  function renderFiltreStatutAnimationCollective(
    statut: StatutAnimationCollective
  ): JSX.Element {
    const id = `statut-${statut.toLowerCase()}`
    return (
      <label key={id} htmlFor={id} className='flex pb-8'>
        <input
          type='checkbox'
          value={statut}
          id={id}
          className='h-5 w-5'
          checked={statutsAnimationsCollectivesSelectionnes.includes(statut)}
          onChange={actionnerStatutAnimationCollective}
        />
        <span className='pl-5'>{label(statut)}</span>
      </label>
    )
  }

  function actionnerStatutAnimationCollective(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const statut = e.target.value as StatutAnimationCollective
    if (statutsAnimationsCollectivesSelectionnes.includes(statut)) {
      setStatutsAnimationsCollectivesSelectionnes(
        statutsAnimationsCollectivesSelectionnes.filter((s) => s !== statut)
      )
    } else {
      setStatutsAnimationsCollectivesSelectionnes(
        statutsAnimationsCollectivesSelectionnes.concat(statut)
      )
    }
  }

  function filtrerAnimationsCollectives(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onFiltres(statutsAnimationsCollectivesSelectionnes)
    setAfficherFiltresAnimationsCollectives(false)
  }

  useEffect(() => {
    setStatutsAnimationsCollectivesSelectionnes(defaultValue)
  }, [afficherFiltresAnimationsCollectives])

  return (
    <div className='relative'>
      <button
        onClick={() =>
          setAfficherFiltresAnimationsCollectives(
            !afficherFiltresAnimationsCollectives
          )
        }
        aria-expanded={afficherFiltresAnimationsCollectives}
        aria-controls='filtres-statut'
        aria-label='Statut - Filtrer les animations collectives'
        className='flex items-center p-4 w-full h-full'
        type='button'
      >
        Statut
        <IconComponent
          name={
            afficherFiltresAnimationsCollectives
              ? IconName.ChevronUp
              : IconName.ChevronDown
          }
          aria-hidden={true}
          className='h-6 w-6 ml-2 fill-[currentColor]'
        />
      </button>

      {afficherFiltresAnimationsCollectives && (
        <form
          className='absolute z-10 bg-white rounded-l shadow-base p-4 text-base-regular'
          id='filtres-statut'
          onSubmit={filtrerAnimationsCollectives}
        >
          <fieldset className='flex flex-col p-2'>
            <legend className='sr-only'>
              Choisir un ou plusieurs statuts à filtrer
            </legend>
            {Object.keys(StatutAnimationCollective).map((statut) =>
              renderFiltreStatutAnimationCollective(
                statut as StatutAnimationCollective
              )
            )}
          </fieldset>
          <Button className='w-full justify-center' type='submit'>
            Valider
          </Button>
        </form>
      )}
    </div>
  )
}

function label(statut: StatutAnimationCollective): string {
  switch (statut) {
    case StatutAnimationCollective.AVenir:
      return 'À venir'
    case StatutAnimationCollective.AClore:
      return 'À clore'
    case StatutAnimationCollective.Close:
      return 'Clos'
  }
}
