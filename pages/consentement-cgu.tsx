import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import React, { FormEvent, useState } from 'react'

import ContenuCGUConseillerBRSA from 'components/ContenuCGUConseillerBRSA'
import ContenuCGUConseillerCEJ from 'components/ContenuCGUConseillerCEJ'
import Checkbox from 'components/offres/Checkbox'
import Button from 'components/ui/Button/Button'
import { InputError } from 'components/ui/Form/InputError'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { ValueWithError } from 'components/ValueWithError'
import { estPoleEmploiBRSA } from 'interfaces/conseiller'
import { PageProps } from 'interfaces/pageProps'
import { modifierDateSignatureCGU } from 'services/conseiller.service'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import redirectedFromHome from 'utils/redirectedFromHome'

interface ConsentementCguProps extends PageProps {
  returnTo: string
}

function ConsentementCgu({ returnTo }: ConsentementCguProps) {
  const [aDonneSonConsentement, setADonneSonConsentement] = useState<
    ValueWithError<boolean>
  >({ value: false })
  const [showErrorValidation, setShowErrorValidation] = useState<boolean>(false)
  const router = useRouter()
  const [conseiller] = useConseiller()

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
        await router.push(returnTo)
      } catch (e) {
        setShowErrorValidation(true)
      }
    }
  }

  return (
    <>
      {estPoleEmploiBRSA(conseiller) && <ContenuCGUConseillerBRSA />}

      {!estPoleEmploiBRSA(conseiller) && <ContenuCGUConseillerCEJ />}

      <form onSubmit={validerLesCGU} className='flex flex-col'>
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
            label='En cochant cette case, je déclare avoir pris connaissance et accepter les conditions générales d’utilisation de l’application.'
            checked={aDonneSonConsentement.value}
            value='donneConsentementCGU'
            onChange={mettreAJourConsentement}
          />
        </div>
        <Button type='submit' className='w-[100px] self-center'>
          Valider
        </Button>
      </form>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  ConsentementCguProps
> = async (
  context
): Promise<GetServerSidePropsResult<ConsentementCguProps>> => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const referer = context.req.headers.referer
  const redirectTo =
    referer && !redirectedFromHome(referer) ? referer : '/mes-jeunes'

  const props: ConsentementCguProps = {
    pageTitle: 'Consentement CGU',
    pageHeader: 'Conditions générales d’utilisation',
    returnTo: redirectTo,
  }

  return { props }
}

export default withTransaction(ConsentementCgu.name, 'page')(ConsentementCgu)
