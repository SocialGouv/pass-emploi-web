import React, { FormEvent, useEffect, useState } from 'react'
import { Agence } from 'interfaces/referentiel'
import Label from 'components/ui/Form/Label'
import Input from 'components/ui/Form/Input'
import Select from 'components/ui/Form/Select'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import Button, { ButtonStyle } from 'components/ui/Button/Button'

export enum FormContainer {
  MODAL,
  PAGE,
}

interface RenseignementAgenceMissionLocaleFormProps {
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id?: string; nom: string }) => void
  onClose?: () => void
  container: FormContainer
}

const contacterLeSupportLabel = `Vous avez indiqué que votre agence Mission Locale est absente de la liste. 
  Pour faire une demande d’ajout de votre mission locale, vous devez contacter le support.`

export function RenseignementAgenceMissionLocaleForm({
  referentielAgences,
  onAgenceChoisie,
  onClose,
  container,
}: RenseignementAgenceMissionLocaleFormProps) {
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
    <form
      onSubmit={submitAgenceSelectionnee}
      className={`${
        container === FormContainer.MODAL ? 'px-10 pt-6 ' : 'flex flex-wrap mt-4'
      }`}
    >
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

      {agenceNestPasDansLaListe() && container === FormContainer.MODAL && (
        <div className='mt-2'>
          <InformationMessage content={contacterLeSupportLabel} />
        </div>
      )}

      {agenceNestPasDansLaListe() && container === FormContainer.PAGE && (
        <div className='mb-4'>{contacterLeSupportLabel}</div>
      )}
      <div
        className={`flex justify-center ${
          container === FormContainer.MODAL ? 'mt-14' : ''
        }`}
      >
        {container === FormContainer.MODAL && (
          <Button
            type='button'
            style={ButtonStyle.SECONDARY}
            className='mr-6'
            onClick={onClose}
          >
            Annuler
          </Button>
        )}
        {(!agenceSelectionnee || agenceEstDansLaListe()) && (
          <Button type='submit' className='mr-6'>
            Ajouter
          </Button>
        )}
        {agenceNestPasDansLaListe() && (
          <Button type='button' style={ButtonStyle.PRIMARY}>
            Contacter le support
          </Button>
        )}
      </div>
    </form>
  )
}
