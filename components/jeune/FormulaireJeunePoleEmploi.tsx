import { FormEvent, useEffect, useState } from 'react'

import { RequiredValue } from '../RequiredValue'

import Button from 'components/ui/Button'
import { DeprecatedErrorMessage } from 'components/ui/DeprecatedErrorMessage'
import { JeunePoleEmploiFormData } from 'interfaces/jeune'
import isEmailValid from 'utils/isEmailValid'

type FormulaireJeunePoleEmploiProps = {
  creerJeunePoleEmploi: (newJeune: JeunePoleEmploiFormData) => Promise<void>
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

  const handleJeuneSubmit = (e: FormEvent<HTMLFormElement>) => {
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
      <p className='text-base-regular text-bleu mb-4'>
        Saisissez les coordonnées du jeune pour lequel vous voulez créer un
        compte
      </p>

      <form method='POST' onSubmit={handleJeuneSubmit}>
        <div className='text-sm-regular text-bleu_nuit mb-8'>
          Les champs marqués d&apos;une * sont obligatoires.
        </div>

        <label
          className='block text-md-semi text-bleu_nuit'
          htmlFor='jeune-prenom'
        >
          *Prénom
        </label>
        <input
          type='text'
          id='jeune-prenom'
          name='jeune-prenom'
          value={prenom.value}
          onChange={(e) => handleNomChanges(e.target.value)}
          className={`mt-4 mb-4 p-3 w-8/12 border rounded-medium text-sm ${
            prenom.error
              ? 'border-deprecated_warning text-deprecated_warning'
              : 'border-bleu_nuit text-bleu_nuit'
          }`}
        />
        {prenom.error && (
          <DeprecatedErrorMessage>{prenom.error}</DeprecatedErrorMessage>
        )}

        <label
          className='block text-md-semi text-bleu_nuit'
          htmlFor='jeune-nom'
        >
          *Nom
        </label>
        <input
          type='text'
          id='jeune-nom'
          name='jeune-nom'
          value={nom.value}
          onChange={(e) => handlePrenomChanges(e.target.value)}
          className={`mt-4 mb-4 p-3 w-8/12 border rounded-medium text-sm ${
            nom.error
              ? 'border-deprecated_warning text-deprecated_warning'
              : 'border-bleu_nuit text-bleu_nuit'
          }`}
        />
        {nom.error && (
          <DeprecatedErrorMessage>{nom.error}</DeprecatedErrorMessage>
        )}

        <label
          className='block mb-4 text-md-semi text-bleu_nuit'
          htmlFor='jeune-email'
        >
          *E-mail{' '}
          <span className='text-sm-regular text-bleu_nuit'>
            (ex : monemail@exemple.com)
          </span>
        </label>
        <span className='text-sm-regular text-bleu_nuit'>
          Attention à bien renseigner l&apos;e-mail qui se trouve sous le
          dossier MAP du jeune.
        </span>
        <input
          type='email'
          id='jeune-email'
          name='jeune-email'
          value={email.value}
          onChange={(e) => handleEmailChanges(e.target.value)}
          className={`mt-4 mb-4 p-3 w-8/12 border rounded-medium text-sm ${
            email.error || error
              ? 'border-deprecated_warning text-deprecated_warning'
              : 'border-bleu_nuit text-bleu_nuit'
          }`}
        />
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
