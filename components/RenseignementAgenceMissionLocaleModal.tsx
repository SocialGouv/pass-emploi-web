import React, { FormEvent, useEffect, useState } from 'react'

import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Label from 'components/ui/Form/Label'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Agence } from 'interfaces/referentiel'
import Select from 'components/ui/Form/Select'
import Input from 'components/ui/Form/Input'

interface RenseignementAgenceMissionLocaleModalProps {
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id?: string; nom: string }) => void
  onClose: () => void
}

export default function RenseignementAgenceMissionLocaleModal({
  referentielAgences,
  onAgenceChoisie,
  onClose,
}: RenseignementAgenceMissionLocaleModalProps) {
  // TODO-1127 check buildOptions() jeunes JeuneMultiSelect et revoir l'id
  const entreePourSelectionnerUneAgenceQuiNestPasDansLaListe = {
    id: 'XXX',
    nom: 'Ma mission locale n’apparaît pas dans la liste',
    codeDepartement: 'XXX',
  }
  const [agencesMiloFiltrees, setAgencesMiloFiltrees] = useState<Agence[]>([
    entreePourSelectionnerUneAgenceQuiNestPasDansLaListe,
    ...referentielAgences,
  ])
  const [agenceSelectionnee, setAgenceSelectionnee] = useState<
    Agence | undefined
  >()
  const [departement, setDepartement] = useState<string>('')

  function selectDepartement(departement: string) {
    setAgenceSelectionnee(undefined)
    setDepartement(departement)
  }

  function selectAgence(nomAgence: string) {
    const agence =
      nomAgence === entreePourSelectionnerUneAgenceQuiNestPasDansLaListe.nom
        ? entreePourSelectionnerUneAgenceQuiNestPasDansLaListe
        : referentielAgences.find((a) => a.nom === nomAgence)
    setAgenceSelectionnee(agence)
  }

  function agenceEstDansLaListe() {
    return (
      agenceSelectionnee &&
      agenceSelectionnee.id !==
        entreePourSelectionnerUneAgenceQuiNestPasDansLaListe.id
    )
  }

  function agenceNestPasDansLaListe() {
    return (
      agenceSelectionnee &&
      agenceSelectionnee.id ===
        entreePourSelectionnerUneAgenceQuiNestPasDansLaListe.id
    )
  }

  function submitAgenceSelectionnee(e: FormEvent) {
    e.preventDefault()
    if (agenceEstDansLaListe()) {
      console.log('AGENCE SELECTIONNEE ' + agenceSelectionnee!.nom)
      onAgenceChoisie(agenceSelectionnee!)
    } else if (agenceEstDansLaListe()) {
      console.log('AGENCE n’apparait pas ' + agenceSelectionnee!.nom)
    }
  }

  useEffect(() => {
    const agencesFiltrees =
      departement !== ''
        ? referentielAgences.filter(
            (agence) => agence.codeDepartement === departement
          )
        : referentielAgences
    setAgencesMiloFiltrees([
      entreePourSelectionnerUneAgenceQuiNestPasDansLaListe,
      ...agencesFiltrees,
    ])
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
        <Input type='text' id='departement' onChange={selectDepartement} />

        <Label htmlFor='intitule-action-predefinie' inputRequired={true}>
          Recherchez votre Mission Locale dans la liste suivante
        </Label>
        <Select
          //TODO-1127 : reset select on departement changed
          id='intitule-action-predefinie'
          required={true}
          onChange={selectAgence}
        >
          {agencesMiloFiltrees.map(({ id, nom }) => (
            <option key={id}>{nom}</option>
          ))}
        </Select>

        {agenceNestPasDansLaListe() && (
          <div className='mt-2'>
            <InformationMessage
              content={`Vous avez indiqué que votre agence Mission Locale est absente de la liste. 
              Pour faire une demande d’ajout de votre mission locale, vous devez contacter le support.`}
            />
          </div>
        )}
        <div className='mt-14 flex justify-center'>
          <Button type='button' style={ButtonStyle.SECONDARY} onClick={onClose}>
            Annuler
          </Button>
          {(!agenceSelectionnee || agenceEstDansLaListe()) && (
            <Button className='ml-6' type='submit'>
              Ajouter
            </Button>
          )}
          {agenceNestPasDansLaListe() && (
            <Button className='ml-6' type='button' style={ButtonStyle.PRIMARY}>
              Contacter le support
            </Button>
          )}
        </div>
      </form>
    </Modal>
  )
}
