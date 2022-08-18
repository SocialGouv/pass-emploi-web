import React, { FormEvent, useRef, useState } from 'react'

import Modal from 'components/Modal'
import { RequiredValue } from 'components/RequiredValue'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { InputError } from 'components/ui/Form/InputError'
import ResettableTextInput from 'components/ui/Form/ResettableTextInput'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Agence, StructureConseiller } from 'interfaces/conseiller'

interface RenseignementAgenceModalProps {
  structureConseiller: string
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id?: string; nom: string }) => void
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
  const agenceLibreRef = useRef<HTMLInputElement>(null)

  const labelAgence =
    structureConseiller === StructureConseiller.MILO
      ? 'Mission locale'
      : 'agence'

  const labelAgencePluriel =
    structureConseiller === StructureConseiller.MILO
      ? 'Missions locales'
      : 'agences'

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
        const agenceChoisie = referentielAgences.find(
          ({ id }) => id === idAgenceSelectionnee.value
        )
        onAgenceChoisie(agenceChoisie!)
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
    } else {
      agenceLibreRef.current!.value = ''
      setAgenceLibre({ value: '' })
    }
  }

  return (
    <Modal
      title={`Ajoutez votre ${labelAgence} à votre profil`}
      onClose={onClose}
    >
      <InformationMessage
        content={`La liste des ${labelAgencePluriel} a été mise à jour et les accents sont pris en compte.`}
      />
      <div className='mt-2'>
        <InformationMessage
          content={`Une fois votre ${labelAgence} renseignée, ce message n'apparaitra plus.`}
        />
      </div>

      <form onSubmit={submitAgenceSelectionnee} className='px-10 pt-6'>
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
          className={`border border-solid rounded-medium w-full px-4 py-3 mt-2 disabled:border-disabled disabled:opacity-70 ${
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
          className='mt-6'
        />
        <label htmlFor='agence-not-found' className='ml-2 text-base-regular'>
          {structureConseiller === StructureConseiller.MILO ? 'Ma' : 'Mon'}{' '}
          {labelAgence} n’apparaît pas dans la liste
        </label>

        <div
          className={`${!showAgenceLibre ? 'invisible' : ''}`}
          aria-hidden={!showAgenceLibre}
        >
          <label htmlFor='agence-libre' className='mt-4 text-base-medium'>
            Saisir le nom de votre {labelAgence}
          </label>
          {agenceLibre.error && (
            <InputError id='agence-libre--error'>
              {agenceLibre.error}
            </InputError>
          )}
          <ResettableTextInput
            id='agence-libre'
            ref={agenceLibreRef}
            value={agenceLibre.value ?? ''}
            onChange={(value) => setAgenceLibre({ value })}
            onReset={() => setAgenceLibre({ value: '' })}
            className={`mt-2 border border-solid rounded-medium w-full mt-2 ${
              agenceLibre.error
                ? 'border-warning text-warning'
                : 'border-content_color'
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
    </Modal>
  )
}
