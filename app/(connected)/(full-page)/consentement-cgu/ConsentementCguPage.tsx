'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import React, { FormEvent, useState } from 'react'

import Checkbox from 'components/offres/Checkbox'
import Button from 'components/ui/Button/Button'
import { InputError } from 'components/ui/Form/InputError'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { ValueWithError } from 'components/ValueWithError'
import { estPassEmploi } from 'interfaces/structure'
import { modifierDateSignatureCGU } from 'services/conseiller.service'
import { useConseiller } from 'utils/conseiller/conseillerContext'

const HeaderCGUConseillerCEJ = dynamic(
  () => import('components/HeaderCGUConseillerCEJ')
)
const HeaderCGUConseillerPassEmploi = dynamic(
  () => import('components/HeaderCGUConseillerPassEmploi')
)
const ContenuCGUConseillerCEJ = dynamic(
  () => import('components/ContenuCGUConseillerCEJ')
)
const ContenuCGUConseillerPassEmploi = dynamic(
  () => import('components/ContenuCGUConseillerPassEmploi')
)

type ConsentementCguProps = {
  returnTo: string
}

function ConsentementCguPage({ returnTo }: ConsentementCguProps) {
  const [aDonneSonConsentement, setADonneSonConsentement] = useState<
    ValueWithError<boolean>
  >({ value: false })
  const [showErrorValidation, setShowErrorValidation] = useState<boolean>(false)
  const router = useRouter()
  const [conseiller] = useConseiller()
  const estConseillerPassEmploi = estPassEmploi(conseiller.structure)

  function mettreAJourConsentement() {
    setADonneSonConsentement({ value: !aDonneSonConsentement.value })
  }

  async function validerLesCGU(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!aDonneSonConsentement.value)
      setADonneSonConsentement({
        ...aDonneSonConsentement,
        error: `Le champ Consentement est vide. Sélectionnez la case à cocher pour accepter les Conditions Générales d’Utilisation.`,
      })
    else {
      try {
        await modifierDateSignatureCGU(DateTime.now())
        router.push(returnTo)
      } catch {
        setShowErrorValidation(true)
      }
    }
  }

  return (
    <>
      {estConseillerPassEmploi && <HeaderCGUConseillerPassEmploi />}
      {!estConseillerPassEmploi && <HeaderCGUConseillerCEJ />}

      <main role='main'>
        {estConseillerPassEmploi && <ContenuCGUConseillerPassEmploi />}
        {!estConseillerPassEmploi && <ContenuCGUConseillerCEJ />}

        <form onSubmit={validerLesCGU} className='flex flex-col mt-10'>
          <div className='mb-10'>
            {aDonneSonConsentement.error && (
              <InputError id='consentement--error' className='mt-2'>
                {aDonneSonConsentement.error}
              </InputError>
            )}
            {showErrorValidation && (
              <FailureAlert label="Une erreur s'est produite, veuillez réessayer ultérieurement" />
            )}
            <Checkbox
              id='checkbox-consentement-cgu'
              label='En cochant cette case, je déclare avoir pris connaissance et accepter les conditions générales d’utilisation de la plateforme.'
              checked={aDonneSonConsentement.value}
              value='donneConsentementCGU'
              onChange={mettreAJourConsentement}
            />
          </div>
          <Button type='submit' className='w-[100px] self-center'>
            Valider
          </Button>
        </form>
      </main>
    </>
  )
}

export default withTransaction(
  ConsentementCguPage.name,
  'page'
)(ConsentementCguPage)
