import React, {
  ChangeEvent,
  FormEvent,
  ForwardedRef,
  forwardRef,
  useEffect,
  useState,
} from 'react'

import Button from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Badge } from 'components/ui/Indicateurs/Badge'

export type Categorie = { code: string; label: string }

type FiltresCategoriesActionsProps = {
  categories: Categorie[]
  defaultValue: Categorie[]
  entites: string
  onFiltres: (categoriesSelectionnees: Categorie[]) => void
}

function FiltresCategories(
  {
    categories,
    defaultValue,
    entites,
    onFiltres,
  }: FiltresCategoriesActionsProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const [afficherFiltres, setAfficherFiltres] = useState<boolean>(false)
  const [categoriesSelectionnees, setCategoriesSelectionnees] = useState<
    Categorie[]
  >([])

  function renderFiltres(categorie: Categorie) {
    const id = `categorie-${categorie.code}`
    return (
      <label
        key={id}
        htmlFor={id}
        className='p-2 cursor-pointer flex gap-5 items-center hover:bg-primary-lighten'
      >
        <input
          type='checkbox'
          value={categorie.code}
          id={id}
          className='h-5 w-5 shrink-0'
          checked={categoriesSelectionnees.some(
            ({ code }) => code === categorie.code
          )}
          onChange={actionnerCategorie}
        />
        {categorie.label}
      </label>
    )
  }

  function actionnerCategorie(e: ChangeEvent<HTMLInputElement>) {
    const codeCategorie = e.target.value
    const index = categoriesSelectionnees.findIndex(
      ({ code }) => code === codeCategorie
    )
    const nouvellesCategoriesSelectionnees = [...categoriesSelectionnees]

    if (index > -1) nouvellesCategoriesSelectionnees.splice(index, 1)
    else
      nouvellesCategoriesSelectionnees.push(
        categories.find(({ code }) => code === codeCategorie)!
      )
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
        ref={ref}
        aria-controls='filtres-categories'
        aria-expanded={afficherFiltres}
        onClick={() => setAfficherFiltres(!afficherFiltres)}
        title={`Filtrer les ${entites} par catégorie`}
        className='flex items-center p-4 w-full h-full gap-2'
        type='button'
      >
        Catégorie
        <IconComponent
          name={IconName.Filter}
          role='img'
          aria-label={`Filtrer les ${entites}`}
          className='h-6 w-6 fill-primary'
        />
        {categoriesSelectionnees.length > 0 && (
          <>
            <Badge
              count={categoriesSelectionnees.length}
              className='text-white bg-primary'
            />
            <span className='sr-only'> filtre sélectionné</span>
          </>
        )}
      </button>

      {afficherFiltres && (
        <form
          className='absolute w-max right-0 z-30 bg-white rounded-base shadow-base p-4 text-base-regular'
          id='filtres-categories'
          onSubmit={filtrer}
        >
          <fieldset className='flex flex-col'>
            <legend className='sr-only'>
              Choisir une ou plusieurs catégories à filtrer
            </legend>
            {categories.map(renderFiltres)}
          </fieldset>
          <Button className='w-full justify-center' type='submit'>
            Valider
            <span className='sr-only'> la sélection des catégories</span>
          </Button>
        </form>
      )}
    </div>
  )
}

export default forwardRef(FiltresCategories)
