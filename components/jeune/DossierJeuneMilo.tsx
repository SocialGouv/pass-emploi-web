import { useEffect, useState } from 'react'

import RefreshIcon from 'assets/icons/actions/refresh.svg'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { DeprecatedErrorMessage } from 'components/ui/Form/DeprecatedErrorMessage'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { DossierMilo } from 'interfaces/jeune'
import { JeuneMiloFormData } from 'interfaces/json/jeune'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

interface DossierJeuneMiloProps {
  dossier: DossierMilo
  onCreateCompte: (data: JeuneMiloFormData) => Promise<void>
  erreurMessageHttpPassEmploi?: string
  onRefresh: () => void
  onRetour: () => void
}

export default function DossierJeuneMilo({
  dossier,
  onCreateCompte,
  erreurMessageHttpPassEmploi,
  onRefresh,
  onRetour,
}: DossierJeuneMiloProps) {
  const [portefeuille] = usePortefeuille()
  const [creationEnCours, setCreationEnCours] = useState<boolean>(false)
  const [tracking, setTracking] = useState<string>(
    dossier.email
      ? 'Création jeune SIMILO - Étape 2 - information du dossier jeune avec email'
      : 'Création jeune SIMILO - Étape 2 - information du dossier jeune sans email'
  )

  const aDesBeneficiaires = portefeuille.length > 0

  async function addJeune() {
    if (!creationEnCours) {
      const newJeune = {
        idDossier: dossier.id,
        nom: dossier.nom,
        prenom: dossier.prenom,
        email: dossier.email ?? undefined,
      }

      setCreationEnCours(true)
      onCreateCompte(newJeune).finally(() => {
        setCreationEnCours(false)
      })
    }
  }

  useMatomo(tracking, aDesBeneficiaires)

  useEffect(() => {
    if (erreurMessageHttpPassEmploi)
      setTracking(
        'Création jeune SIMILO – Etape 2 - information du dossier jeune - création de compte en erreur'
      )
  }, [erreurMessageHttpPassEmploi])

  return (
    <>
      <div className='border border-primary_lighten rounded-base p-6'>
        <dl className='text-primary_darken'>
          <div className='flex items-center mb-3'>
            <dt className='text-base-regular mr-1'>Prénom :</dt>
            <dd className='text-base-medium'> {dossier.prenom}</dd>
          </div>

          <div className='flex items-center mb-3'>
            <dt className='text-base-regular mr-1'>Nom :</dt>
            <dd className='text-base-medium'> {dossier.nom}</dd>
          </div>

          <div className='flex items-center mb-3'>
            <dt className='text-base-regular mr-1'>Date de naissance :</dt>
            <dd className='text-base-medium'> {dossier.dateDeNaissance}</dd>
          </div>

          <div className='flex items-center mb-3'>
            <dt className='text-base-regular mr-1'>Code postal :</dt>
            <dd className='text-base-medium'> {dossier.codePostal}</dd>
          </div>
          <div className='flex items-center mb-3'>
            <dt
              className={
                dossier.email
                  ? 'text-base-regular mr-1'
                  : 'text-base-regular text-warning'
              }
            >
              E-mail :
            </dt>

            <dd className='text-base-medium'>{dossier.email || ''}</dd>
          </div>
          {!dossier.email && (
            <>
              <p className='text-base-bold text-warning mb-2'>
                L&apos;e-mail du jeune n&apos;est peut-être pas renseigné
              </p>
              <ol className='text-base-regular text-warning'>
                <li className='mb-3.5'>
                  1. Renseignez l&apos;e-mail du jeune sur son profil i-milo
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

      {dossier.email && (
        <div className='mt-4'>
          <InformationMessage label='Ce bénéficiaire recevra un lien d’activation valable 24h.'>
            <p>
              Passé ce délai, il sera nécessaire d’utiliser l’option : mot de
              passe oublié.
            </p>
          </InformationMessage>
        </div>
      )}

      {erreurMessageHttpPassEmploi && (
        <DeprecatedErrorMessage className='mt-8'>
          {erreurMessageHttpPassEmploi}
        </DeprecatedErrorMessage>
      )}

      <div className='flex items-center mt-14 gap-4'>
        <Button style={ButtonStyle.TERTIARY} onClick={onRetour}>
          <IconComponent
            name={IconName.ArrowBackward}
            className='mr-2.5 w-3 h-3'
            role='img'
            focusable={false}
            aria-label="Retour Création d'un compte jeune étape 1"
          />
          Retour
        </Button>

        {!erreurMessageHttpPassEmploi && (
          <ActionButtons
            dossier={dossier}
            addJeune={addJeune}
            creationEnCours={creationEnCours}
            onRefresh={onRefresh}
          />
        )}
      </div>
    </>
  )
}

function ActionButtons({
  dossier,
  addJeune,
  creationEnCours,
  onRefresh,
}: {
  dossier: DossierMilo
  addJeune: () => Promise<void>
  creationEnCours: boolean
  onRefresh: () => void
}) {
  return dossier.email ? (
    <Button type='button' onClick={addJeune} disabled={creationEnCours}>
      {creationEnCours ? 'Création en cours...' : 'Créer le compte'}
    </Button>
  ) : (
    <Button type='button' onClick={onRefresh}>
      <RefreshIcon
        className='w-4 h-4 mr-2.5'
        aria-hidden={true}
        focusable={false}
      />
      Rafraîchir le compte
    </Button>
  )
}
