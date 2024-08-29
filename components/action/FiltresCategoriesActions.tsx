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
import { SituationNonProfessionnelle } from 'interfaces/action'

type FiltresCategoriesActionsProps = {
  categories: SituationNonProfessionnelle[]
  defaultValue: string[]
  onFiltres: (categoriesSelectionnees: string[]) => void
}

function FiltresCategoriesActions(
  { categories, defaultValue, onFiltres }: FiltresCategoriesActionsProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const [afficherFiltres, setAfficherFiltres] = useState<boolean>(false)
  const [categoriesSelectionnees, setCategoriesSelectionnees] = useState<
    string[]
  >([])

  function renderFiltres(categorie: SituationNonProfessionnelle) {
    const id = `categorie-${categorie.code}`
    return (
      <label key={id} htmlFor={id} className='flex items-center pb-4'>
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
        ref={ref}
        aria-controls='filtres-categories'
        aria-expanded={afficherFiltres}
        onClick={() => setAfficherFiltres(!afficherFiltres)}
        title='Filtrer les actions par catégorie'
        className='flex items-center p-4 w-full h-full gap-2'
        type='button'
      >
        Catégorie
        <IconComponent
          name={IconName.Filter}
          role='img'
          aria-label='Filtrer les actions'
          className='h-6 w-6 fill-primary'
        />
        {categoriesSelectionnees.length > 0 && (
          <>
            <Badge
              count={categoriesSelectionnees.length}
              bgColor='primary'
              textColor='white'
              size={6}
            />
            <span className='sr-only'> filtre sélectionné</span>
          </>
        )}
      </button>

      {afficherFiltres && (
        <form
          className='absolute z-10 bg-white rounded-base shadow-base p-4 text-base-regular'
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
            <span className='sr-only'> la sélection des catégories</span>
          </Button>
        </form>
      )}
    </div>
  )
}

export default forwardRef(FiltresCategoriesActions)
