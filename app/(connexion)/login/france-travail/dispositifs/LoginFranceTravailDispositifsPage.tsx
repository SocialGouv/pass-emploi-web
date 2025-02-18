'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import LoginHeader from 'components/LoginHeader'
import LoginButton from 'components/ui/Button/LoginButton'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import {
  labelStructure,
  structureAccompagnementGlobal,
  structureAccompagnementIntensif,
  structureAij,
  structureAvenirPro,
  structureBrsa,
  structureEquipEmploiRecrut,
  structureFTCej,
} from 'interfaces/structure'
import { signin } from 'utils/auth/auth'
import { useLoginErrorMessage } from 'utils/auth/loginErrorMessageContext'

type LoginFranceTravailDispositifsPageProps = {
  ssoAccompagnementsIntensifsSontActifs: boolean
  ssoAvenirProEstActif: boolean
}

function LoginFranceTravailDispositifsPage({
  ssoAccompagnementsIntensifsSontActifs,
  ssoAvenirProEstActif,
}: LoginFranceTravailDispositifsPageProps) {
  const [errorMsg, setErrorMsg] = useLoginErrorMessage()
  const searchParams = useSearchParams()

  async function handleSignin(provider: string) {
    await signin(
      provider,
      setErrorMsg,
      searchParams.get('redirectUrl') ?? undefined
    )
  }

  return (
    <>
      <LoginHeader
        title='Connexion conseiller France Travail'
        subtitle='Choisissez votre dispositif'
      />

      <main role='main'>
        {errorMsg && <FailureAlert label={errorMsg} />}

        <ul className='flex flex-wrap justify-center istems-stretch gap-8'>
          <li className='min-w-[275px]'>
            <LoginButton
              label={labelStructure(structureFTCej)}
              prefix='France Travail'
              onClick={() => handleSignin('pe-conseiller')}
            />
          </li>
          <li className='min-w-[275px]'>
            <LoginButton
              label={labelStructure(structureBrsa)}
              prefix='France Travail'
              onClick={() => handleSignin('pe-brsa-conseiller')}
            />
          </li>
          <li className='min-w-[275px]'>
            <LoginButton
              label={labelStructure(structureAij)}
              prefix='France Travail'
              onClick={() => handleSignin('pe-aij-conseiller')}
            />
          </li>
          {ssoAccompagnementsIntensifsSontActifs && (
            <>
              <li className='min-w-[275px]'>
                <LoginButton
                  label={labelStructure(structureAccompagnementIntensif)}
                  prefix='France Travail'
                  onClick={() =>
                    handleSignin('ft-accompagnement-intensif-conseiller')
                  }
                />
              </li>
              <li className='min-w-[275px]'>
                <LoginButton
                  label={labelStructure(structureAccompagnementGlobal)}
                  prefix='France Travail'
                  onClick={() =>
                    handleSignin('ft-accompagnement-global-conseiller')
                  }
                />
              </li>
              <li className='min-w-[275px]'>
                <LoginButton
                  label={labelStructure(structureEquipEmploiRecrut)}
                  prefix='France Travail'
                  onClick={() =>
                    handleSignin('ft-equip-emploi-recrut-conseiller')
                  }
                />
              </li>
            </>
          )}
          {ssoAvenirProEstActif && (
            <li className='min-w-[275px]'>
              <LoginButton
                label={labelStructure(structureAvenirPro)}
                prefix='France Travail'
                onClick={() => handleSignin('avenirpro-conseiller')}
              />
            </li>
          )}
        </ul>
      </main>
    </>
  )
}

export default withTransaction(
  LoginFranceTravailDispositifsPage.name,
  'page'
)(LoginFranceTravailDispositifsPage)
