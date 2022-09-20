import { useRouter } from 'next/router'
import { FormEvent, useEffect, useState } from 'react'

import IndicationRechercheDossier from 'components/jeune/IndicationRechercheDossier'
import Button from 'components/ui/Button/Button'
import { DeprecatedErrorMessage } from 'components/ui/Form/DeprecatedErrorMessage'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'

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
      <p className='text-m-bold mb-4'>
        Saisissez le numéro de dossier du jeune pour lequel vous voulez créer un
        compte
      </p>

      <IndicationRechercheDossier />

      <form method='POST' onSubmit={handleSearchSubmit}>
        <Label htmlFor='recherche-numero'>Numéro de dossier</Label>
        <div className='w-8/12'></div>
        <Input
          type='text'
          id='recherche-numero'
          defaultValue={numeroDossier}
          onChange={handleSearchInputChanges}
          invalid={Boolean(messageErreur)}
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
