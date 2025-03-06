import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import CreationBeneficiaireErreurModal from 'components/CreationBeneficiaireErreurModal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import InputError from 'components/ui/Form/InputError'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { DossierMilo } from 'interfaces/beneficiaire'
import { BeneficiaireMiloFormData } from 'interfaces/json/beneficiaire'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

interface DossierBeneficiaireMiloProps {
  dossier: DossierMilo
  onCreateCompte: (
    data: BeneficiaireMiloFormData,
    options?: { surcharge: boolean }
  ) => Promise<void>
  onRefresh: () => void
  onRetour: () => void
  onAnnulationCreerCompte: () => void
  erreurMessageCreationCompte?: string
  beneficiaireExisteDejaMilo: boolean
}

function DossierBeneficiaireMilo(
  {
    dossier,
    onCreateCompte,
    erreurMessageCreationCompte,
    onRefresh,
    onRetour,
    onAnnulationCreerCompte,
    beneficiaireExisteDejaMilo,
  }: DossierBeneficiaireMiloProps,
  ref: ForwardedRef<{ focusRetour: () => void }>
) {
  const [portefeuille] = usePortefeuille()

  const [dispositif, setDispositif] = useState<'CEJ' | 'PACEA'>()
  const [erreurDispositif, setErreurDispositif] = useState<string>()
  const [creationEnCours, setCreationEnCours] = useState<boolean>(false)

  const retourButtonRef = useRef<HTMLButtonElement>(null)
  useImperativeHandle(ref, () => ({
    focusRetour: () => retourButtonRef.current!.focus(),
  }))

  const [tracking, setTracking] = useState<string>(
    dossier.email
      ? 'Création jeune SIMILO - Étape 2 - information du dossier jeune avec email'
      : 'Création jeune SIMILO - Étape 2 - information du dossier jeune sans email'
  )
  const aDesBeneficiaires = portefeuille.length > 0

  function choisirDispositif(dispositifChoisi: 'CEJ' | 'PACEA') {
    setErreurDispositif(undefined)
    setDispositif(dispositifChoisi)
  }

  async function addBeneficiaire(options?: { surcharge: boolean }) {
    if (!dispositif) {
      setErreurDispositif('Veuillez choisir un dispositif.')
      return
    }

    if (!creationEnCours) {
      const newBeneficiaire = {
        idDossier: dossier.id,
        nom: dossier.nom,
        prenom: dossier.prenom,
        dispositif,
        email: dossier.email ?? undefined,
      }

      setCreationEnCours(true)
      onCreateCompte(newBeneficiaire, options).finally(() => {
        setCreationEnCours(false)
      })
    }
  }

  useMatomo(tracking, aDesBeneficiaires)

  useEffect(() => {
    if (erreurMessageCreationCompte || beneficiaireExisteDejaMilo)
      setTracking(
        'Création jeune SIMILO – Etape 2 - information du dossier jeune - création de compte en erreur'
      )
  }, [erreurMessageCreationCompte, beneficiaireExisteDejaMilo])

  return (
    <>
      <div className='mt-6 border border-primary_lighten rounded-base p-4'>
        <h2 className='text-m-bold text-grey_800 mb-4'>Informations</h2>
        <dl>
          <div className='flex items-center mb-1 gap-1'>
            <dt className='text-base-regular'>Prénom :</dt>
            <dd className='text-base-medium'> {dossier.prenom}</dd>
          </div>

          <div className='flex items-center mb-1 gap-1'>
            <dt className='text-base-regular'>Nom :</dt>
            <dd className='text-base-medium'> {dossier.nom}</dd>
          </div>

          <div className='flex items-center mb-1 gap-1'>
            <dt className='text-base-regular'>Date de naissance :</dt>
            <dd className='text-base-medium'> {dossier.dateDeNaissance}</dd>
          </div>

          <div className='flex items-center mb-1 gap-1'>
            <dt className='text-base-regular'>Code postal :</dt>
            <dd className='text-base-medium'> {dossier.codePostal}</dd>
          </div>

          <div className='flex items-center mb-1 gap-1'>
            <dt
              className={
                dossier.email
                  ? 'text-base-regular'
                  : 'text-base-regular text-warning'
              }
            >
              E-mail :
            </dt>
            <dd className='text-base-medium'>{dossier.email || ''}</dd>
          </div>
        </dl>
      </div>

      <form className='mt-6 border border-primary_lighten rounded-base p-4'>
        <h2 className='text-m-bold text-grey_800 mb-4'>Dispositif</h2>
        <fieldset>
          {erreurDispositif && (
            <InputError id='dispositif--error' ref={(e) => e?.focus()}>
              {erreurDispositif}
            </InputError>
          )}

          <legend className='mb-4 text-base-bold'>
            Sélectionner le dispositif (champ obligatoire)
          </legend>

          <label htmlFor='dispositif-cej' className='block py-2'>
            <input
              type='radio'
              name='dispositif'
              id='dispositif-cej'
              className='mr-2'
              onClick={() => choisirDispositif('CEJ')}
            />
            Contrat d’Engagement Jeune (CEJ)
          </label>
          <label htmlFor='dispositif-pacea' className='block py-2'>
            <input
              type='radio'
              name='dispositif'
              id='dispositif-pacea'
              className='mr-2'
              onClick={() => choisirDispositif('PACEA')}
            />
            Parcours contractualisé d’accompagnement vers l’emploi et
            l’autonomie (PACEA)
          </label>
        </fieldset>
      </form>

      {!dossier.email && (
        <>
          <p className='text-base-bold text-warning mb-2'>
            L&apos;e-mail du bénéficiaire n&apos;est peut-être pas renseigné
          </p>
          <ol className='text-base-regular text-warning'>
            <li className='mb-3.5'>
              1. Renseignez l&apos;e-mail du bénéficiaire sur son profil i-milo
            </li>
            <li className='mb-3.5'>
              2. Rafraîchissez ensuite cette page ou saisissez à nouveau le
              numéro de dossier du bénéficiaire pour créer le compte application
              CEJ
            </li>
          </ol>
        </>
      )}

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

      <div className='mt-14'>
        {erreurMessageCreationCompte && (
          <InputError
            className='mb-2'
            id='creation-button--error'
            ref={(e) => e?.focus()}
          >
            {erreurMessageCreationCompte}
          </InputError>
        )}

        <div className='flex items-center gap-4'>
          <Button
            style={ButtonStyle.TERTIARY}
            onClick={onRetour}
            ref={retourButtonRef}
          >
            <IconComponent
              name={IconName.ArrowBackward}
              className='mr-2.5 w-3 h-3'
              role='img'
              focusable={false}
              aria-label="Retour Création d'un compte bénéficiaire étape 1"
            />
            Retour
          </Button>

          {dossier.email && (
            <>
              <Button
                id='creation-button'
                type='button'
                onClick={() => addBeneficiaire()}
                isLoading={creationEnCours}
                disabled={Boolean(
                  erreurMessageCreationCompte || beneficiaireExisteDejaMilo
                )}
                describedBy={
                  erreurMessageCreationCompte && 'creation-button--error'
                }
              >
                Créer le compte
              </Button>
            </>
          )}

          {!dossier.email && (
            <Button type='button' onClick={onRefresh}>
              <IconComponent
                name={IconName.Refresh}
                className='w-4 h-4 mr-2.5'
                aria-hidden={true}
                focusable={false}
              />
              Rafraîchir le compte
            </Button>
          )}
        </div>
      </div>

      {beneficiaireExisteDejaMilo && (
        <CreationBeneficiaireErreurModal
          adresseMailBeneficiaire={dossier.email!}
          onClose={onAnnulationCreerCompte}
          onConfirmation={() => {
            addBeneficiaire({ surcharge: true })
          }}
        />
      )}
    </>
  )
}

export default forwardRef(DossierBeneficiaireMilo)
