import React, { FormEvent, useEffect, useState } from 'react'

import Checkbox from 'components/offres/Checkbox'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Input from 'components/ui/Form/Input'
import InputError from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { ValueWithError } from 'components/ValueWithError'
import { BeneficiaireFranceTravailFormData } from 'interfaces/json/beneficiaire'
import { Liste } from 'interfaces/liste'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { isEmailValid } from 'utils/helpers'

import { estAvenirPro } from '../../interfaces/structure'

type FormulaireBeneficiaireFranceTravailProps = {
  aAccesMap: boolean
  creerBeneficiaireFranceTravail: (
    nouveauBeneficiaire: BeneficiaireFranceTravailFormData
  ) => void
  creationEnCours: boolean
  creationError?: string
  listes?: Liste[]
}

function FormulaireBeneficiaireFranceTravail({
  aAccesMap,
  listes,
  creerBeneficiaireFranceTravail,
  creationError,
  creationEnCours,
}: FormulaireBeneficiaireFranceTravailProps) {
  const [conseiller] = useConseiller()
  const estConseillerAvenirPro = estAvenirPro(conseiller.structure)

  const [prenom, setPrenom] = useState<ValueWithError>({
    value: '',
  })
  const [nom, setNom] = useState<ValueWithError>({
    value: '',
  })
  const [email, setEmail] = useState<ValueWithError>({
    value: '',
  })
  const [idListeSelectionnee, setIdListeSelectionnee] = useState<
    ValueWithError<string | undefined>
  >({
    value: undefined,
  })

  const [aBeneficiairePlusDeQuinzeAns, setABeneficiairePlusDeQuinzeAns] =
    useState<ValueWithError<boolean>>({ value: false })

  const [error, setError] = useState<string | undefined>(creationError)

  useEffect(() => {
    setError(creationError)
  }, [creationError])

  const validate = () => {
    let isValid = true
    if (!Boolean(prenom.value)) {
      setPrenom({
        value: prenom.value,
        error: 'Veuillez renseigner le prénom du bénéficiaire',
      })
      isValid = false
    }
    if (!Boolean(nom.value)) {
      setNom({
        value: nom.value,
        error: 'Veuillez renseigner le nom du bénéficiaire',
      })
      isValid = false
    }
    if (!Boolean(email.value)) {
      setEmail({
        value: email.value,
        error: "Veuillez renseigner l'e-mail du bénéficiaire",
      })
      isValid = false
    } else if (!isEmailValid(email.value)) {
      setEmail({
        value: email.value,
        error: 'L’e-mail renseigné n’est pas au bon format',
      })
      isValid = false
    }
    if (estConseillerAvenirPro && !idListeSelectionnee.value) {
      setIdListeSelectionnee({
        value: undefined,
        error: 'Veuillez sélectionner une liste',
      })
      isValid = false
    } else {
      setIdListeSelectionnee({ value: idListeSelectionnee.value, error: '' })
    }

    if (estConseillerAvenirPro && !aBeneficiairePlusDeQuinzeAns.value) {
      setError(
        'Le bénéficiaire doit avoir plus de 15 ans pour créer un compte France Travail. Sélectionnez la case à cocher pour valider l’âge minimum requis.'
      )
      isValid = false
    }

    return isValid
  }

  function handleBeneficiaireSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const isValid = validate()
    if (isValid && !creationEnCours) {
      const newBeneficiaire: BeneficiaireFranceTravailFormData = {
        prenom: prenom.value,
        nom: nom.value,
        email: email.value,
        idListe: estConseillerAvenirPro ? idListeSelectionnee.value : undefined,
      }

      creerBeneficiaireFranceTravail(newBeneficiaire)
    }
  }

  function handleNomChanges(value: string) {
    setPrenom({ value, error: '' })
    setError('')
  }

  function handlePrenomChanges(value: string) {
    setNom({ value, error: '' })
    setError('')
  }

  function handleEmailChanges(value: string) {
    setEmail({ value, error: '' })
    setError('')
  }

  function handleIdListeSelectionneeChanges() {
    if (!idListeSelectionnee.value) {
      setIdListeSelectionnee({
        ...idListeSelectionnee,
        error: 'Veuillez sélectionner une liste',
      })
    }
  }

  function mettreAJourAgeMinimumBeneficiaire() {
    setABeneficiairePlusDeQuinzeAns({
      value: !aBeneficiairePlusDeQuinzeAns.value,
      error: '',
    })
  }

  return (
    <>
      <p className='text-m-bold mt-6 mb-4'>
        Saisissez les coordonnées du bénéficiaire pour lequel vous voulez créer
        un compte
      </p>

      <form method='POST' onSubmit={handleBeneficiaireSubmit}>
        <div className='text-s-bold mb-8'>
          Les champs marqués d&apos;une * sont obligatoires.
        </div>

        <Label htmlFor='jeune-prenom' inputRequired={true}>
          Prénom
        </Label>
        {prenom.error && (
          <InputError id='jeune-prenom--error'>{prenom.error}</InputError>
        )}
        <div className='w-8/12'>
          <Input
            type='text'
            id='jeune-prenom'
            defaultValue={prenom.value}
            onChange={handleNomChanges}
            invalid={Boolean(prenom.error)}
          />
        </div>

        <Label htmlFor='jeune-nom' inputRequired={true}>
          Nom
        </Label>
        {nom.error && (
          <InputError id='jeune-nom--error'>{nom.error}</InputError>
        )}
        <div className='w-8/12'>
          <Input
            type='text'
            id='jeune-nom'
            defaultValue={nom.value}
            onChange={handlePrenomChanges}
            invalid={Boolean(nom.error)}
          />
        </div>

        <Label htmlFor='jeune-email' inputRequired={true}>
          {{ main: 'E-mail', helpText: '(ex : monemail@exemple.com)' }}
        </Label>
        <p className='text-base-regular mb-3'>
          <>
            {aAccesMap
              ? 'Attention à bien renseigner l’e-mail qui se trouve sous le dossier MAP du bénéficiaire.'
              : 'Attention à bien renseigner l’adresse e-mail que votre bénéficiaire utilise pour se connecter à son espace France Travail.'}
          </>
        </p>
        {email.error && (
          <InputError id='jeune-email--error'>{email.error}</InputError>
        )}
        <div className='w-8/12'>
          <Input
            type='email'
            id='jeune-email'
            defaultValue={email.value}
            onChange={handleEmailChanges}
            invalid={Boolean(email.error)}
          />
        </div>

        {estConseillerAvenirPro && (
          <>
            <Label htmlFor='select-id-liste' inputRequired={true}>
              Sélectionnez la liste du bénéficiaire
            </Label>
            {idListeSelectionnee.error && (
              <InputError id='select-id--error'>
                {idListeSelectionnee.error}
              </InputError>
            )}
            <div className='w-8/12'>
              <Select
                id='select-id-liste'
                required={true}
                onChange={(selectedValue) => {
                  setIdListeSelectionnee({ value: selectedValue })
                }}
                invalid={Boolean(idListeSelectionnee.error)}
                onBlur={handleIdListeSelectionneeChanges}
              >
                {listes!.map(({ id, titre }) => (
                  <option key={id} value={id}>
                    {titre}
                  </option>
                ))}{' '}
              </Select>
            </div>

            <ButtonLink
              href='/mes-jeunes/listes/edition-liste'
              style={ButtonStyle.SECONDARY}
              className='w-fit mb-8'
            >
              <IconComponent
                name={IconName.Add}
                focusable={false}
                aria-hidden={true}
                className='mr-2 w-4 h-4'
              />
              Créer une liste
            </ButtonLink>

            <div className='mb-8'>
              {aBeneficiairePlusDeQuinzeAns.error && (
                <InputError id='age-beneficiaire--error' className='mt-2'>
                  {aBeneficiairePlusDeQuinzeAns.error}
                </InputError>
              )}
              <Checkbox
                id='checkbox-age-beneficiaire-cgu'
                label='Je certifie que le jeune renseigné est âgé de 15 ans ou plus à la date de création du compte.'
                checked={aBeneficiairePlusDeQuinzeAns.value}
                value='beneficiairePlusDeQuinzeAns'
                onChange={mettreAJourAgeMinimumBeneficiaire}
              />
            </div>
          </>
        )}

        {error && (
          <InputError id='submit--error' ref={(e) => e?.focus()}>
            {error}
          </InputError>
        )}

        <Button
          id='submit'
          type='submit'
          isLoading={creationEnCours}
          disabled={Boolean(error)}
          describedBy={error && 'submit--error'}
        >
          Créer le compte
        </Button>
      </form>
    </>
  )
}

export default FormulaireBeneficiaireFranceTravail
