import React, { FormEvent, useState } from 'react'

import InfoIcon from '../assets/icons/information.svg'

import { InputError } from './ui/InputError'

import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button'
import { Agence, UserStructure } from 'interfaces/conseiller'

interface RenseignementAgenceModalProps {
  structureConseiller: string
  referentielAgences: Agence[]
  onAgenceChoisie: (idAgence: string) => void
  onClose: () => void
}

export default function RenseignementAgenceModal({
  structureConseiller,
  referentielAgences,
  onAgenceChoisie,
  onClose,
}: RenseignementAgenceModalProps) {
  const [idAgenceSelectionnee, setIdAgenceSelectionnee] = useState<{
    value?: string
    erreur?: string
  }>({})

  const labelAgence =
    structureConseiller === UserStructure.MILO ? 'Mission locale' : 'agence'

  function selectAgence(nomAgence: string) {
    const agence = referentielAgences.find((a) => a.nom === nomAgence)
    if (agence) {
      setIdAgenceSelectionnee({ value: agence.id })
    } else {
      setIdAgenceSelectionnee({})
    }
  }

  function submitAgenceSelectionnee(e: FormEvent) {
    e.preventDefault()
    // TODO gestion message erreur
    if (!idAgenceSelectionnee.value) {
      setIdAgenceSelectionnee({
        ...idAgenceSelectionnee,
        erreur: 'Sélectionner une agence dans la liste',
      })
    } else {
      onAgenceChoisie(idAgenceSelectionnee.value)
    }
  }

  return (
    <Modal
      title={`Ajoutez votre ${labelAgence} à votre profil`}
      onClose={onClose}
    >
      <div className='p-4 bg-primary_lighten rounded-medium  text-primary'>
        <p className='flex text-base-medium  items-center mb-2'>
          <InfoIcon focusable={false} aria-hidden={true} className='mr-2' />
          Afin d’améliorer la qualité du service, nous avons besoin de connaître
          votre {labelAgence} de rattachement.
        </p>
      </div>

      <form onSubmit={submitAgenceSelectionnee}>
        <label htmlFor='search-agence' className='text-base-medium'>
          Rechercher votre {labelAgence} dans la liste suivante
        </label>
        {idAgenceSelectionnee.erreur && (
          <InputError id='search-agence--error'>
            {idAgenceSelectionnee.erreur}
          </InputError>
        )}
        <input
          type='text'
          id='search-agence'
          list='agences'
          multiple={false}
          required={true}
          onChange={(e) => selectAgence(e.target.value)}
          aria-invalid={idAgenceSelectionnee.erreur ? true : undefined}
          aria-describedby={
            idAgenceSelectionnee.erreur ? 'search-agence--error' : undefined
          }
          className={`border border-solid rounded-medium w-full px-4 py-3 mb-4 disabled:bg-grey_100 ${
            idAgenceSelectionnee.erreur
              ? 'border-warning text-warning'
              : 'border-content_color'
          }`}
        />
        <datalist id='agences'>
          {referentielAgences.map((agence) => (
            <option key={agence.id} value={agence.nom}>
              {agence.nom}
            </option>
          ))}
        </datalist>

        <Button type='button' style={ButtonStyle.SECONDARY} onClick={onClose}>
          Annuler
        </Button>
        <Button type='submit'>Ajouter</Button>
      </form>
    </Modal>
  )
}
