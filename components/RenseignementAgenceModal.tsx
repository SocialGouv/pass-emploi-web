import React, { FormEvent, useRef, useState } from 'react'

import InfoIcon from '../assets/icons/information.svg'

import { RequiredValue } from './RequiredValue'
import { InputError } from './ui/InputError'
import ResettableTextInput from './ui/ResettableTextInput'
import SelectAutocomplete from './ui/SelectAutocomplete'

import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button'
import { Agence, UserStructure } from 'interfaces/conseiller'

interface RenseignementAgenceModalProps {
  structureConseiller: string
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id: string } | { nom: string }) => void
  onClose: () => void
}

export default function RenseignementAgenceModal({
  structureConseiller,
  referentielAgences,
  onAgenceChoisie,
  onClose,
}: RenseignementAgenceModalProps) {
  const [idAgenceSelectionnee, setIdAgenceSelectionnee] =
    useState<RequiredValue>({ value: '' })
  const [showAgenceLibre, setShowAgenceLibre] = useState<boolean>(false)
  const [agenceLibre, setAgenceLibre] = useState<RequiredValue>({ value: '' })
  const searchAgenceRef = useRef<HTMLInputElement>(null)

  const labelAgence =
    structureConseiller === UserStructure.MILO ? 'Mission locale' : 'agence'

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
          error: `Sélectionner une ${labelAgence} dans la liste`,
        })
      } else {
        onAgenceChoisie({ id: idAgenceSelectionnee.value })
      }
    } else {
      if (!agenceLibre.value) {
        setAgenceLibre({ ...agenceLibre, error: `Saisir une ${labelAgence}` })
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
    }
  }

  return (
    <Modal
      title={`Ajoutez votre ${labelAgence} à votre profil`}
      onClose={onClose}
    >
      <p className='p-6 bg-primary_lighten rounded-medium text-primary text-base-medium flex items-center'>
        <InfoIcon focusable={false} aria-hidden={true} className='mr-2' />
        Afin d’améliorer la qualité du service, nous avons besoin de connaître
        votre {labelAgence} de rattachement.
      </p>

      <form onSubmit={submitAgenceSelectionnee} className='pt-3'>
        <label htmlFor='search-agence' className='text-base-medium'>
          Rechercher votre {labelAgence} dans la liste suivante
        </label>
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
          onChange={(e) => selectAgence(e.target.value)}
          aria-invalid={idAgenceSelectionnee.error ? true : undefined}
          aria-describedby={
            idAgenceSelectionnee.error ? 'search-agence--error' : undefined
          }
          className={`border border-solid rounded-medium w-full px-4 py-3 mt-2 disabled:bg-grey_100 ${
            idAgenceSelectionnee.error
              ? 'border-warning text-warning'
              : 'border-content_color'
          }`}
          disabled={showAgenceLibre}
        />

        <input
          type='checkbox'
          id='agence-not-found'
          onChange={toggleAgenceLibre}
        />
        <label htmlFor='agence-not-found'>
          {structureConseiller === UserStructure.MILO ? 'Ma' : 'Mon'}{' '}
          {labelAgence} n’apparaît pas dans la liste
        </label>

        {showAgenceLibre && (
          <>
            <label htmlFor='agence-libre'>
              Saisir le nom de votre {labelAgence}
            </label>
            {agenceLibre.error && (
              <InputError id='agence-libre--error'>
                {agenceLibre.error}
              </InputError>
            )}
            <ResettableTextInput
              id='agence-libre'
              value={agenceLibre.value ?? ''}
              onChange={(value) => setAgenceLibre({ value })}
              onReset={() => setAgenceLibre({ value: '' })}
            />
          </>
        )}

        <div className='mt-14 flex justify-center'>
          <Button type='button' style={ButtonStyle.SECONDARY} onClick={onClose}>
            Annuler
          </Button>
          <Button className='ml-6' type='submit'>
            Ajouter
          </Button>
        </div>
      </form>
    </Modal>
  )
}
