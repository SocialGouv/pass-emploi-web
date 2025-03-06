import React, {
  FormEvent,
  ForwardedRef,
  forwardRef,
  ReactElement,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import Button from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Badge } from 'components/ui/Indicateurs/Badge'
import { StatutAnimationCollective } from 'interfaces/evenement'

type FiltresStatutAnimationsCollectivesProps = {
  onFiltres: (statutsSelectionnes: StatutAnimationCollective[]) => void
  defaultValue: StatutAnimationCollective[]
}

export type FiltresHandles = { focus: () => void; reset: () => void }

function FiltresStatutAnimationsCollectives(
  { onFiltres, defaultValue = [] }: FiltresStatutAnimationsCollectivesProps,
  ref: ForwardedRef<FiltresHandles>
) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  useImperativeHandle(ref, () => ({
    focus: () => buttonRef.current!.focus(),
    reset,
  }))

  const [afficherFiltres, setAfficherFiltres] = useState<boolean>(false)
  const [statutsSelectionnes, setStatutsSelectionnes] = useState<
    StatutAnimationCollective[]
  >([])

  function actionnerStatut(statut: StatutAnimationCollective) {
    if (statutsSelectionnes.includes(statut)) {
      setStatutsSelectionnes(statutsSelectionnes.filter((s) => s !== statut))
    } else {
      setStatutsSelectionnes(statutsSelectionnes.concat(statut))
    }
  }

  function filtrer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onFiltres(statutsSelectionnes)
    setAfficherFiltres(false)
  }

  function reset() {
    setStatutsSelectionnes([])
    onFiltres([])
  }

  useEffect(() => {
    setStatutsSelectionnes(defaultValue)
  }, [afficherFiltres, defaultValue])

  return (
    <div className='relative'>
      <button
        ref={buttonRef}
        onClick={() => setAfficherFiltres(!afficherFiltres)}
        aria-expanded={afficherFiltres}
        aria-controls='filtres-statut'
        title='Filtrer les animations collectives par statut'
        className='text-s-regular flex items-center p-4 gap-2 w-full h-full'
        type='button'
      >
        Statuts
        <IconComponent
          name={IconName.Filter}
          role='img'
          aria-label='Filtrer les animations collectives'
          className='h-6 w-6 fill-primary'
        />
        {statutsSelectionnes.length > 0 && (
          <>
            <Badge
              count={statutsSelectionnes.length}
              className='text-white bg-primary'
            />
            <span className='sr-only'> filtre sélectionné</span>
          </>
        )}
      </button>

      {afficherFiltres && (
        <form
          className='absolute w-max right-0 z-10 bg-white rounded-base shadow-base p-4 text-base-regular'
          id='filtres-statut'
          onSubmit={filtrer}
        >
          <fieldset className='flex flex-col p-2'>
            <legend className='sr-only'>
              Choisir un ou plusieurs statuts à filtrer
            </legend>
            {Object.values(StatutAnimationCollective).map((statut) => (
              <FiltreStatut
                key={statut}
                statut={statut}
                checked={statutsSelectionnes.includes(statut)}
                onChange={() => actionnerStatut(statut)}
              />
            ))}
          </fieldset>
          <Button className='w-full justify-center' type='submit'>
            Valider <span className='sr-only'> la sélection des statuts</span>
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

function FiltreStatut({
  statut,
  checked,
  onChange,
}: {
  statut: StatutAnimationCollective
  checked: boolean
  onChange: () => void
}): ReactElement {
  const id = `statut-${statut.toLowerCase()}`
  return (
    <label key={id} htmlFor={id} className='flex pb-8'>
      <input
        type='checkbox'
        value={statut}
        id={id}
        className='h-5 w-5'
        checked={checked}
        onChange={onChange}
      />
      <span className='pl-5'>{label(statut)}</span>
    </label>
  )
}

export default forwardRef(FiltresStatutAnimationsCollectives)
