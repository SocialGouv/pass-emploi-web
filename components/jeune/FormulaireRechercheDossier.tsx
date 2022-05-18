import { useRouter } from 'next/router'
import { FormEvent, useEffect, useState } from 'react'

import IndicationRechercheDossier from 'components/jeune/IndicationRechercheDossier'
import Button from 'components/ui/Button'
import { DeprecatedErrorMessage } from 'components/ui/DeprecatedErrorMessage'

type FormulaireRechercheDossierProps = {
  dossierId?: string
  errMessage?: string
}

function FormulaireRechercheDossier({
  dossierId,
  errMessage,
}: FormulaireRechercheDossierProps) {
  const router = useRouter()
  const [numeroDossier, setNumeroDossier] = useState<string>(dossierId || '')
  const [messageErreur, setMessageErreur] = useState<string>(errMessage || '')

  useEffect(() => {
    setMessageErreur(errMessage || '')
  }, [errMessage])

  const validate = () => {
    if (numeroDossier === '') {
      setMessageErreur('Veuillez renseigner un numéro de dossier')
      return false
    }
    return true
  }

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const isValid = validate()
    if (isValid) {
      router.push(`/mes-jeunes/milo/creation-jeune?dossierId=${numeroDossier}`)
    }
  }

  const handleSearchInputChanges = (value: string) => {
    setNumeroDossier(value)
    errMessage = ''
    setMessageErreur('')
  }

  return (
    <>
      <p className='text-base-regular mb-4'>
        Saisissez le numéro de dossier du jeune pour lequel vous voulez créer un
        compte
      </p>

      <IndicationRechercheDossier />

      <form method='POST' onSubmit={handleSearchSubmit}>
        <label className='block text-base-medium' htmlFor='recherche-numero'>
          Numéro de dossier
        </label>
        <input
          type='text'
          id='recherche-numero'
          name='recherche-numero'
          value={numeroDossier}
          onChange={(e) => handleSearchInputChanges(e.target.value)}
          className={`mt-4 mb-8 p-3 w-8/12 border rounded-medium text-sm ${
            messageErreur
              ? 'border-warning text-warning'
              : 'border-content_color text-primary_darken'
          }`}
        />

        {messageErreur && (
          <DeprecatedErrorMessage>{messageErreur}</DeprecatedErrorMessage>
        )}

        <Button type='submit'>Valider le numéro</Button>
      </form>
    </>
  )
}

export default FormulaireRechercheDossier
