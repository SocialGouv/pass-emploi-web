import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import Button from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { EtatQualificationAction } from 'interfaces/action'

type FiltresEtatsQualificationActionsProps = {
  onFiltres: (etatsQualificationSelectionnes: EtatQualificationAction[]) => void
  defaultValue?: EtatQualificationAction[]
}

export default function FiltresEtatsQualificationActions({
  onFiltres,
  defaultValue = [],
}: FiltresEtatsQualificationActionsProps) {
  const [afficherFiltresQualification, setAfficherFiltresQualification] =
    useState<boolean>(false)
  const [etatsQualificationSelectionnes, setEtatsQualificationSelectionnes] =
    useState<EtatQualificationAction[]>([])

  const labelsEtatsQualification: {
    [key in EtatQualificationAction]: string
  } = {
    [EtatQualificationAction.NonQualifiable]: 'Actions non qualifiables',
    [EtatQualificationAction.AQualifier]: 'Actions à qualifier',
    [EtatQualificationAction.Qualifiee]: 'Actions qualifiées',
  }

  function renderFiltreEtatQualification(
    etat: EtatQualificationAction
  ): JSX.Element {
    const id = `etat-${etat.toLowerCase()}`
    return (
      <label key={id} htmlFor={id} className='flex pb-8'>
        <input
          type='checkbox'
          value={etat}
          id={id}
          className='h-5 w-5'
          checked={etatsQualificationSelectionnes.includes(etat)}
          onChange={actionnerEtatQualification}
        />
        <span className='pl-5'>{labelsEtatsQualification[etat]}</span>
      </label>
    )
  }

  function actionnerEtatQualification(e: ChangeEvent<HTMLInputElement>) {
    const etat = e.target.value as EtatQualificationAction
    if (etatsQualificationSelectionnes.includes(etat)) {
      setEtatsQualificationSelectionnes(
        etatsQualificationSelectionnes.filter((s) => s !== etat)
      )
    } else {
      setEtatsQualificationSelectionnes(
        etatsQualificationSelectionnes.concat(etat)
      )
    }
  }

  function filtrerActions(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onFiltres(etatsQualificationSelectionnes)

    setAfficherFiltresQualification(false)
  }

  useEffect(() => {
    setEtatsQualificationSelectionnes(defaultValue)
  }, [afficherFiltresQualification])

  return (
    <div className='relative'>
      <button
        type='button'
        className='flex items-center w-fit text-s-bold border border-solid border-grey_800 text-grey_800 py-2 px-4 rounded-x_large'
        aria-controls='filtres-statut'
        aria-expanded={afficherFiltresQualification}
        onClick={() =>
          setAfficherFiltresQualification(!afficherFiltresQualification)
        }
      >
        Filtrer par qualification
        <IconComponent
          name={
            afficherFiltresQualification
              ? IconName.ChevronUp
              : IconName.ChevronDown
          }
          aria-hidden={true}
          className='h-6 w-6 ml-2 fill-[currentColor]'
        />
      </button>

      {afficherFiltresQualification && (
        <form
          className='absolute z-10 bg-blanc rounded-medium shadow-base p-4 text-base-regular'
          id='filtres-statut'
          onSubmit={filtrerActions}
        >
          <fieldset className='flex flex-col p-2'>
            <legend className='sr-only'>
              Choisir un ou plusieurs états de qualification à filtrer
            </legend>
            {Object.keys(EtatQualificationAction).map((etat) =>
              renderFiltreEtatQualification(etat as EtatQualificationAction)
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
