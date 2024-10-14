import { FormEvent, useEffect, useState } from 'react'

import Button from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import { ValueWithError } from 'components/ValueWithError'
import { BeneficiaireFranceTravailFormData } from 'interfaces/json/beneficiaire'
import isEmailValid from 'utils/isEmailValid'

type FormulaireBeneficiaireFranceTravailProps = {
  aAccesMap: boolean
  creerBeneficiaireFranceTravail: (
    nouveauBeneficiaire: BeneficiaireFranceTravailFormData
  ) => void
  creationEnCours: boolean
  creationError?: string
}

function FormulaireBeneficiaireFranceTravail({
  aAccesMap,
  creerBeneficiaireFranceTravail,
  creationError,
  creationEnCours,
}: FormulaireBeneficiaireFranceTravailProps) {
  const [prenom, setPrenom] = useState<ValueWithError>({
    value: '',
  })
  const [nom, setNom] = useState<ValueWithError>({
    value: '',
  })
  const [email, setEmail] = useState<ValueWithError>({
    value: '',
  })
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

    return isValid
  }

  function handleJeuneSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const isValid = validate()
    if (isValid && !creationEnCours) {
      const newJeune: BeneficiaireFranceTravailFormData = {
        prenom: prenom.value,
        nom: nom.value,
        email: email.value,
      }

      creerBeneficiaireFranceTravail(newJeune)
    }
  }

  const handleNomChanges = (value: string) => {
    setPrenom({ value, error: '' })
    setError('')
  }

  const handlePrenomChanges = (value: string) => {
    setNom({ value, error: '' })
    setError('')
  }

  const handleEmailChanges = (value: string) => {
    setEmail({ value, error: '' })
    setError('')
  }

  return (
    <>
      <p className='text-m-bold mt-6 mb-4'>
        Saisissez les coordonnées du bénéficiaire pour lequel vous voulez créer
        un compte
      </p>

      <form method='POST' onSubmit={handleJeuneSubmit}>
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
