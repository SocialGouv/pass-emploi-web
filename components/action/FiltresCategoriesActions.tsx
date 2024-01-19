import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import Button from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { SituationNonProfessionnelle } from 'interfaces/action'

type FiltresCategoriesActionsProps = {
  categories: SituationNonProfessionnelle[]
  defaultValue: string[]
  onFiltres: (categoriesSelectionnees: string[]) => void
}

export default function FiltresCategoriesActions({
  categories,
  defaultValue,
  onFiltres,
}: FiltresCategoriesActionsProps) {
  const [afficherFiltres, setAfficherFiltres] = useState<boolean>(false)
  const [categoriesSelectionnees, setCategoriesSelectionnees] = useState<
    string[]
  >([])

  function renderFiltres(categorie: SituationNonProfessionnelle) {
    const id = `categorie-${categorie.code}`
    return (
      <label key={id} htmlFor={id} className='flex pb-8'>
        <input
          type='checkbox'
          value={categorie.code}
          id={id}
          className='h-5 w-5 shrink-0'
          checked={categoriesSelectionnees.includes(categorie.code)}
          onChange={actionnerCategorie}
        />
        <span className='pl-5'>{categorie.label}</span>
      </label>
    )
  }

  function actionnerCategorie(e: ChangeEvent<HTMLInputElement>) {
    const codeCategorie = e.target.value
    const index = categoriesSelectionnees.findIndex(
      (code) => code === codeCategorie
    )
    const nouvellesCategoriesSelectionnees = [...categoriesSelectionnees]
    if (index > -1) nouvellesCategoriesSelectionnees.splice(index, 1)
    else nouvellesCategoriesSelectionnees.push(codeCategorie)
    setCategoriesSelectionnees(nouvellesCategoriesSelectionnees)
  }

  function filtrer(e: FormEvent) {
    e.preventDefault()
    onFiltres(categoriesSelectionnees)
    setAfficherFiltres(false)
  }

  useEffect(() => {
    setCategoriesSelectionnees(defaultValue)
  }, [afficherFiltres])

  return (
    <div className='relative'>
      <button
        aria-controls='filtres-categories'
        aria-expanded={afficherFiltres}
        onClick={() => setAfficherFiltres(!afficherFiltres)}
        aria-label='Catégorie - Filtrer les actions'
        title='Filtrer les actions par catégorie'
        className='flex items-center p-4 w-full h-full'
      >
        Catégorie
        <IconComponent
          name={IconName.Filter}
          aria-hidden={true}
          focusable={false}
          className='h-6 w-6 ml-2 fill-primary'
        />
      </button>

      {afficherFiltres && (
        <form
          className='absolute z-10 bg-blanc rounded-base shadow-base p-4 text-base-regular'
          id='filtres-categories'
          onSubmit={filtrer}
        >
          <fieldset className='flex flex-col p-2'>
            <legend className='sr-only'>
              Choisir une ou plusieurs catégories à filtrer
            </legend>
            {categories.map(renderFiltres)}
          </fieldset>
          <Button className='w-full justify-center' type='submit'>
            Valider
          </Button>
        </form>
      )}
    </div>
  )
}
