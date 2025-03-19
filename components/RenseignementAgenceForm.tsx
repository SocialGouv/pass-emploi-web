import React, { FormEvent, MouseEvent, useRef, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import InputError from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import ResettableTextInput from 'components/ui/Form/ResettableTextInput'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import { ValueWithError } from 'components/ValueWithError'
import { Agence } from 'interfaces/referentiel'

interface RenseignementAgenceFormProps {
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id?: string; nom: string }) => void
  onClose: (e: MouseEvent) => void
}

export default function RenseignementAgenceForm({
  referentielAgences,
  onAgenceChoisie,
  onClose,
}: RenseignementAgenceFormProps) {
  const [idAgenceSelectionnee, setIdAgenceSelectionnee] =
    useState<ValueWithError>({ value: '' })
  const [showAgenceLibre, setShowAgenceLibre] = useState<boolean>(false)
  const [agenceLibre, setAgenceLibre] = useState<ValueWithError>({ value: '' })
  const searchAgenceRef = useRef<HTMLInputElement>(null)
  const agenceLibreRef = useRef<HTMLInputElement>(null)

  function selectAgence(nomAgence: string) {
    const agence = referentielAgences.find((a) => a.nom === nomAgence)
    if (agence) {
      setIdAgenceSelectionnee({ value: agence.id })
    } else {
      setIdAgenceSelectionnee({ value: '' })
    }
  }

  function submitAgenceSelectionnee(e: FormEvent) {
    e.preventDefault()
    if (!showAgenceLibre) {
      if (!idAgenceSelectionnee.value) {
        setIdAgenceSelectionnee({
          ...idAgenceSelectionnee,
          error: `Sélectionner une agence dans la liste`,
        })
      } else {
        const agenceChoisie = referentielAgences.find(
          ({ id }) => id === idAgenceSelectionnee.value
        )
        onAgenceChoisie(agenceChoisie!)
      }
    } else {
      if (!agenceLibre.value) {
        setAgenceLibre({ ...agenceLibre, error: `Saisir une agence` })
      } else {
        onAgenceChoisie({ nom: agenceLibre.value })
      }
    }
  }

  function toggleAgenceLibre(e: React.ChangeEvent<HTMLInputElement>): void {
    setShowAgenceLibre(e.target.checked)
    if (e.target.checked) {
      searchAgenceRef.current!.value = ''
      setIdAgenceSelectionnee({ value: '' })
    } else {
      agenceLibreRef.current!.value = ''
      setAgenceLibre({ value: '' })
    }
  }

  return (
    <form
      onSubmit={submitAgenceSelectionnee}
      noValidate={true}
      className='px-10 pt-6'
    >
      <Label htmlFor='search-agence'>
        Rechercher votre agence dans la liste suivante
      </Label>
      {idAgenceSelectionnee.error && (
        <InputError id='search-agence--error' className='mt-2'>
          {idAgenceSelectionnee.error}
        </InputError>
      )}
      <SelectAutocomplete
        id='search-agence'
        ref={searchAgenceRef}
        options={referentielAgences.map(({ id, nom }) => ({
          id,
          value: nom,
        }))}
        onChange={selectAgence}
        invalid={Boolean(idAgenceSelectionnee.error)}
        disabled={showAgenceLibre}
      />

      <input
        type='checkbox'
        id='agence-not-found'
        onChange={toggleAgenceLibre}
        className='mt-6'
      />
      <label htmlFor='agence-not-found' className='ml-2 text-base-regular mb-4'>
        Mon agence n’apparaît pas dans la liste
      </label>

      <div
        className={`${!showAgenceLibre ? 'invisible' : ''}`}
        aria-hidden={!showAgenceLibre}
      >
        <Label htmlFor='agence-libre'>Saisir le nom de votre agence</Label>
        {agenceLibre.error && (
          <InputError id='agence-libre--error'>{agenceLibre.error}</InputError>
        )}
        <ResettableTextInput
          id='agence-libre'
          ref={agenceLibreRef}
          value={agenceLibre.value ?? ''}
          onChange={(value) => setAgenceLibre({ value })}
          onReset={() => setAgenceLibre({ value: '' })}
          className={`mt-2 border border-solid rounded-base w-full ${
            agenceLibre.error
              ? 'border-warning text-warning'
              : 'border-content-color'
          }`}
        />
      </div>

      <div className='mt-14 flex justify-center'>
        <Button type='button' style={ButtonStyle.SECONDARY} onClick={onClose}>
          Annuler
        </Button>
        <Button className='ml-6' type='submit'>
          Ajouter
        </Button>
      </div>
    </form>
  )
}
