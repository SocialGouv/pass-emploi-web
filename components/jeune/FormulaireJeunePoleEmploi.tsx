import { FormEvent, useEffect, useState } from 'react'

import { RequiredValue } from 'components/RequiredValue'
import Button from 'components/ui/Button/Button'
import { DeprecatedErrorMessage } from 'components/ui/Form/DeprecatedErrorMessage'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import { JeunePoleEmploiFormData } from 'interfaces/json/jeune'
import isEmailValid from 'utils/isEmailValid'

type FormulaireJeunePoleEmploiProps = {
  creerJeunePoleEmploi: (newJeune: JeunePoleEmploiFormData) => void
  creationError: string
  creationEnCours: boolean
}

function FormulaireJeunePoleEmploi({
  creerJeunePoleEmploi,
  creationError,
  creationEnCours,
}: FormulaireJeunePoleEmploiProps) {
  const [prenom, setPrenom] = useState<RequiredValue>({
    value: '',
  })
  const [nom, setNom] = useState<RequiredValue>({
    value: '',
  })
  const [email, setEmail] = useState<RequiredValue>({
    value: '',
  })
  const [error, setError] = useState<string>(creationError)

  useEffect(() => {
    setError(creationError)
  }, [creationError])

  const validate = () => {
    let isValid = true
    if (!Boolean(prenom.value)) {
      setPrenom({
        value: prenom.value,
        error: 'Veuillez renseigner le prénom du jeune',
      })
      isValid = false
    }
    if (!Boolean(nom.value)) {
      setNom({
        value: nom.value,
        error: 'Veuillez renseigner le nom du jeune',
      })
      isValid = false
    }
    if (!Boolean(email.value)) {
      setEmail({
        value: email.value,
        error: "Veuillez renseigner l'e-mail du jeune",
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
      const newJeune: JeunePoleEmploiFormData = {
        prenom: prenom.value,
        nom: nom.value,
        email: email.value,
      }

      creerJeunePoleEmploi(newJeune)
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
        Saisissez les coordonnées du jeune pour lequel vous voulez créer un
        compte
      </p>

      <form method='POST' onSubmit={handleJeuneSubmit}>
        <div className='text-s-bold mb-8'>
          Les champs marqués d&apos;une * sont obligatoires.
        </div>

        <Label htmlFor='jeune-prenom' inputRequired={true}>
          Prénom
        </Label>
        <div className='w-8/12'>
          <Input
            type='text'
            id='jeune-prenom'
            defaultValue={prenom.value}
            onChange={handleNomChanges}
            invalid={Boolean(prenom.error)}
          />
        </div>
        {prenom.error && (
          <DeprecatedErrorMessage>{prenom.error}</DeprecatedErrorMessage>
        )}

        <Label htmlFor='jeune-nom' inputRequired={true}>
          Nom
        </Label>
        <div className='w-8/12'>
          <Input
            label='Nom'
            type='text'
            id='jeune-nom'
            defaultValue={nom.value}
            onChange={handlePrenomChanges}
            invalid={Boolean(nom.error)}
          />
        </div>
        {nom.error && (
          <DeprecatedErrorMessage>{nom.error}</DeprecatedErrorMessage>
        )}

        <Label htmlFor='jeune-email' inputRequired={true}>
          E-mail{' '}
          <span className='text-base-regular'>(ex : monemail@exemple.com)</span>
        </Label>
        <p className='text-base-regular mb-3'>
          Attention à bien renseigner l&apos;e-mail qui se trouve sous le
          dossier MAP du jeune.
        </p>
        <div className='w-8/12'>
          <Input
            type='email'
            id='jeune-email'
            defaultValue={email.value}
            onChange={handleEmailChanges}
            invalid={Boolean(email.error)}
          />
        </div>
        {email.error && (
          <DeprecatedErrorMessage>{email.error}</DeprecatedErrorMessage>
        )}
        {error && <DeprecatedErrorMessage>{error}</DeprecatedErrorMessage>}

        <Button type='submit' disabled={creationEnCours}>
          {creationEnCours ? 'Création en cours...' : 'Créer le compte'}
        </Button>
      </form>
    </>
  )
}

export default FormulaireJeunePoleEmploi
