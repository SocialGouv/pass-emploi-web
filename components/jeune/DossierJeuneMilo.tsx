import Link from 'next/link'
import Router from 'next/router'
import { useState } from 'react'

import RefreshIcon from '../../assets/icons/refresh.svg'

import Button from 'components/ui/Button'
import { DeprecatedErrorMessage } from 'components/ui/DeprecatedErrorMessage'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DossierMilo } from 'interfaces/jeune'
import { ConseillerService } from 'services/conseiller.service'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { useDependance } from 'utils/injectionDependances'

interface DossierJeuneMiloProps {
  dossier: DossierMilo
  onCreatedSuccess: (idJeune: string) => void
  onCreatedError: (erreurMessage: string) => void
  erreurMessageHttpPassEmploi: string
}

const DossierJeuneMilo = ({
  dossier,
  onCreatedSuccess,
  onCreatedError,
  erreurMessageHttpPassEmploi,
}: DossierJeuneMiloProps) => {
  const { data: session } = useSession<true>({ required: true })
  const [creationEnCours, setCreationEnCours] = useState<boolean>(false)

  const conseillerService =
    useDependance<ConseillerService>('conseillerService')

  const addJeune = async () => {
    if (!creationEnCours) {
      const newJeune = {
        idDossier: dossier.id,
        nom: dossier.nom,
        prenom: dossier.prenom,
        email: dossier.email ?? undefined,
        idConseiller: session!.user.id,
      }
      setCreationEnCours(true)
      conseillerService
        .createCompteJeuneMilo(newJeune, session!.accessToken)
        .then(({ id }) => {
          setCreationEnCours(false)
          onCreatedSuccess(id)
        })
        .catch((error: Error) => {
          setCreationEnCours(false)
          onCreatedError(error.message)
        })
    }
  }
  useMatomo(
    dossier.email
      ? 'Création jeune SIMILO - Étape 2 - information du dossier jeune avec email'
      : 'Création jeune SIMILO - Étape 2 - information du dossier jeune sans email'
  )

  useMatomo(
    erreurMessageHttpPassEmploi &&
      'Création jeune SIMILO – Etape 2 - information du dossier jeune - création de compte en erreur'
  )

  return (
    <>
      <div className='border border-primary_lighten rounded-large p-6'>
        <dl className='text-primary_darken'>
          <div className='flex items-center mb-3'>
            <dt className='text-sm mr-1' aria-label='Prénom'>
              Prénom :
            </dt>
            <dd className='text-s-medium'> {dossier.prenom}</dd>
          </div>

          <div className='flex items-center mb-3'>
            <dt className='text-sm mr-1' aria-label='Nom'>
              Nom :
            </dt>
            <dd className='text-s-medium'> {dossier.nom}</dd>
          </div>

          <div className='flex items-center mb-3'>
            <dt className='text-sm mr-1' aria-label='Date de naissance'>
              Date de naissance :
            </dt>
            <dd className='text-s-medium'> {dossier.dateDeNaissance}</dd>
          </div>

          <div className='flex items-center mb-3'>
            <dt className='text-sm mr-1' aria-label='Code postal'>
              Code postal :
            </dt>
            <dd className='text-s-medium'> {dossier.codePostal}</dd>
          </div>
          <div className='flex items-center mb-3'>
            <dt
              className={` ${
                dossier.email ? 'text-sm mr-1' : 'text-s-medium text-warning'
              }`}
              aria-label='E-mail'
            >
              E-mail :
            </dt>

            <dd className='text-s-medium'>{dossier.email || ''}</dd>
          </div>
          {!dossier.email && (
            <>
              <p className='text-s-medium text-warning mb-2'>
                L&apos;e-mail du jeune n&apos;est peut-être pas renseigné
              </p>
              <ol className='text-sm text-warning'>
                <li className='mb-3.5'>
                  1. Renseignez l&apos;e-mail du jeune sur son profil i-Milo
                </li>
                <li className='mb-3.5'>
                  2. Rafraîchissez ensuite cette page ou saisissez à nouveau le
                  numéro de dossier du jeune pour créer le compte application
                  CEJ
                </li>
              </ol>
            </>
          )}
        </dl>
      </div>

      {erreurMessageHttpPassEmploi && (
        <DeprecatedErrorMessage className='mt-8'>
          {erreurMessageHttpPassEmploi}
        </DeprecatedErrorMessage>
      )}

      <div className='flex items-center mt-14'>
        <Link href={'/mes-jeunes/milo/creation-jeune'}>
          <a className='flex items-center text-s-medium text-primary_darken mr-6'>
            <IconComponent
              name={IconName.ArrowLeft}
              className='mr-2.5 w-3 h-3'
              role='img'
              focusable='false'
              aria-label="Retour Création d'un compte jeune étape 1"
            />
            Retour
          </a>
        </Link>

        {!erreurMessageHttpPassEmploi &&
          actionButtons(dossier, addJeune, creationEnCours)}
      </div>
    </>
  )
}

function actionButtons(
  dossier: DossierMilo,
  addJeune: () => Promise<void>,
  creationEnCours: boolean
) {
  return dossier.email ? (
    <Button type='button' onClick={addJeune} disabled={creationEnCours}>
      {creationEnCours ? 'Création en cours...' : 'Créer le compte'}
    </Button>
  ) : (
    <Button type='button' onClick={() => Router.reload()}>
      <RefreshIcon className='mr-2.5' aria-hidden={true} focusable={false} />
      Rafraîchir le compte
    </Button>
  )
}

export default DossierJeuneMilo
