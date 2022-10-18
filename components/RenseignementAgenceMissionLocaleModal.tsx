import React, { FormEvent, useEffect, useState } from 'react'

import Modal from 'components/Modal'
import { RequiredValue } from 'components/RequiredValue'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Label from 'components/ui/Form/Label'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Agence } from 'interfaces/referentiel'
import Select from 'components/ui/Form/Select'
import Input from 'components/ui/Form/Input'

interface RenseignementAgenceMissionLocaleModalProps {
  structureConseiller: string
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id?: string; nom: string }) => void
  onClose: () => void
}

export default function RenseignementAgenceMissionLocaleModal({
  referentielAgences,
  onAgenceChoisie,
  onClose,
}: RenseignementAgenceMissionLocaleModalProps) {
  const [agencesMiloFiltrees, setAgencesMiloFiltrees] =
    useState<Agence[]>(referentielAgences)
  const [idAgenceSelectionnee, setIdAgenceSelectionnee] =
    useState<RequiredValue>({ value: '' })
  const [departement, setDepartement] = useState<string>('')
  const [milo, setMilo] = useState<string>('')

  function submitAgenceSelectionnee(e: FormEvent) {
    e.preventDefault()
  }

  useEffect(() => {
    setMilo('')
    setAgencesMiloFiltrees(
      departement !== ''
        ? referentielAgences.filter(
            (agence) => agence.departement === departement
          )
        : referentielAgences
    )
  }, [departement])

  return (
    <Modal
      title={`Ajoutez votre Mission Locale à votre profil`}
      onClose={onClose}
    >
      <div className='mt-2'>
        <InformationMessage
          content={`Une fois votre Mission Locale renseignée, ce message n'apparaitra plus.`}
        />
      </div>

      <form onSubmit={submitAgenceSelectionnee} className='px-10 pt-6'>
        <Label htmlFor='departement'>Departement de ma Mission Locale</Label>
        <Input type='text' id='departement' onChange={setDepartement} />

        <Label htmlFor='intitule-action-predefinie' inputRequired={true}>
          Recherchez votre Mission Locale dans la liste suivante
        </Label>
        <Select
          //TODO-1127 : reset select on departement changed
          id='intitule-action-predefinie'
          required={true}
          onChange={setMilo}
        >
          {agencesMiloFiltrees.map(({ id, nom }) => (
            <option key={id}>{nom}</option>
          ))}
        </Select>

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
