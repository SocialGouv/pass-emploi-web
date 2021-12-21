import Button from 'components/Button'
import { ErrorMessage } from 'components/ErrorMessage'
import { DossierMilo } from 'interfaces/jeune'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Router from 'next/router'
import { useState } from 'react'
import useMatomo from 'utils/analytics/useMatomo'
import { useDIContext } from 'utils/injectionDependances'
import ArrowLeftIcon from '../../assets/icons/arrow_left.svg'
import RefreshIcon from '../../assets/icons/refresh.svg'

interface DossierJeuneMiloProps {
  dossier: DossierMilo
  onCreatedSuccess: () => void
  onCreatedError: (erreurMessage: string) => void
  erreurMessage: string
}

const DossierJeuneMilo = ({
  dossier,
  onCreatedSuccess,
  onCreatedError,
  erreurMessage,
}: DossierJeuneMiloProps) => {
  const { data: session } = useSession({ required: true })

  const { conseillerService } = useDIContext()

  const addJeune = async () => {
    const newJeune = {
      idDossier: dossier.id,
      nom: dossier.nom,
      prenom: dossier.prenom,
      email: dossier.email ?? undefined,
      idConseiller: session!.user.id,
    }
    conseillerService
      .createCompteJeuneMilo(newJeune, session!.accessToken)
      .then(() => {
        onCreatedSuccess()
      })
      .catch((error: Error) => {
        onCreatedError(error.message)
      })
  }
  useMatomo(
    dossier.email
      ? 'Création jeune SIMILO - Étape 2 - information du dossier jeune avec email'
      : 'Création jeune SIMILO - Étape 2 - information du dossier jeune sans email'
  )

  useMatomo(
    erreurMessage &&
      'Création jeune SIMILO – Etape 2 - information du dossier jeune - création de compte en erreur'
  )

  return (
    <>
      <div className='border border-bleu_blanc rounded-large p-6'>
        <dl className='text-bleu_nuit'>
          <div className='flex items-center mb-3'>
            <dt className='text-sm mr-1' aria-label='Prénom'>
              Prénom :
            </dt>
            <dd className='text-sm-medium'> {dossier.prenom}</dd>
          </div>

          <div className='flex items-center mb-3'>
            <dt className='text-sm mr-1' aria-label='Nom'>
              Nom :
            </dt>
            <dd className='text-sm-medium'> {dossier.nom}</dd>
          </div>

          <div className='flex items-center mb-3'>
            <dt className='text-sm mr-1' aria-label='Date de naissance'>
              Date de naissance :
            </dt>
            <dd className='text-sm-medium'> {dossier.dateDeNaissance}</dd>
          </div>

          <div className='flex items-center mb-3'>
            <dt className='text-sm mr-1' aria-label='Code postal'>
              Code postal :
            </dt>
            <dd className='text-sm-medium'> {dossier.codePostal}</dd>
          </div>
          <div className='flex items-center mb-3'>
            <dt
              className={` ${
                dossier.email ? 'text-sm' : 'text-sm-medium text-warning'
              }`}
              aria-label='E-mail'
            >
              E-mail :
            </dt>

            <dd className='text-sm-medium'> {dossier.email || ''}</dd>
          </div>
          {!dossier.email && (
            <>
              <p className='text-sm-medium text-warning mb-2'>
                L&apos;email du jeune n&apos;est peut-être pas renseigné
              </p>
              <ol className='text-sm text-warning'>
                <li className='mb-3.5'>
                  1. Renseignez l&apos;email du jeune sur son profil i-Milo
                </li>
                <li className='mb-3.5'>
                  2. Rafraîchissez ensuite cette page ou saisissez à nouveau le
                  numéro de dossier du jeune pour créer le compte Pass emploi
                </li>
              </ol>
            </>
          )}
        </dl>
      </div>

      {erreurMessage && (
        <ErrorMessage className='mt-8'>{erreurMessage}</ErrorMessage>
      )}

      <div className='flex items-center mt-14'>
        <Link href={'/mes-jeunes/milo/creation-jeune'} passHref>
          <a className='flex items-center text-sm-medium text-bleu_nuit mr-6'>
            <ArrowLeftIcon
              className='mr-2.5'
              role='img'
              focusable='false'
              aria-label="Retour Création d'un compte jeune étape 1"
            />
            Retour
          </a>
        </Link>

        {!erreurMessage && actionButtons(dossier, addJeune)}
      </div>
    </>
  )
}

function actionButtons(dossier: DossierMilo, addJeune: () => Promise<void>) {
  return dossier.email ? (
    <Button type='button' onClick={addJeune}>
      Créer le compte
    </Button>
  ) : (
    <Button type='button' onClick={() => Router.reload()}>
      <RefreshIcon className='mr-2.5' aria-hidden={true} focusable={false} />
      Rafraîchir le compte
    </Button>
  )
}

export default DossierJeuneMilo
