import React, { FormEvent, useState } from 'react'

import InfoIcon from '../assets/icons/information.svg'

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
  const [idAgenceSelectionnee, setIdAgenceSelectionnee] = useState<
    string | undefined
  >(undefined)

  const labelAgence =
    structureConseiller === UserStructure.MILO ? 'Mission locale' : 'agence'

  function selectAgence(nomAgence: string) {
    const agence = referentielAgences.find((a) => a.nom === nomAgence)
    if (agence) {
      setIdAgenceSelectionnee(agence.id)
    } else {
      setIdAgenceSelectionnee(undefined)
    }
  }

  function submitAgenceSelectionnee(e: FormEvent) {
    e.preventDefault()
    // TODO gestion message erreur
    onAgenceChoisie(idAgenceSelectionnee!)
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
        <input
          type='text'
          id='search-agence'
          className='text-sm text-bleu_nuit w-full p-3 mb-2 mt-4 border border-bleu_nuit rounded-medium cursor-pointer bg-blanc'
          list='agences'
          onChange={(e) => selectAgence(e.target.value)}
          multiple={false}
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
