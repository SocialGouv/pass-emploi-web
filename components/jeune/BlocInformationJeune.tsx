import React, { useRef, useState } from 'react'

import ChangementDispositifBeneficiaireModal from 'components/ChangementDispositifBeneficiaireModal' // FIXME should use dynamic(() => import() but issue with jest
import DispositifTag from 'components/jeune/DispositifTag'
import { ModalHandles } from 'components/Modal'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DetailBeneficiaire, estCEJ } from 'interfaces/beneficiaire'
import { Conseiller } from 'interfaces/conseiller'
import { estMilo } from 'interfaces/structure'
import { toLongMonthDate } from 'utils/date'

interface BlocInformationJeuneProps {
  beneficiaire: DetailBeneficiaire
  conseiller: Conseiller
  onIdentifiantPartenaireCopie?: () => void
  identifiantPartenaire?: string
  onIdentifiantPartenaireClick?: () => void
}

export default function BlocInformationJeune({
  beneficiaire,
  conseiller,
  onIdentifiantPartenaireCopie,
  identifiantPartenaire,
  onIdentifiantPartenaireClick,
}: BlocInformationJeuneProps) {
  const { creationDate, dateFinCEJ, email, urlDossier, dispositif } =
    beneficiaire
  const conseillerEstMilo = estMilo(conseiller.structure)

  const [dispositifActuel, setDispositifActuel] = useState<string>(dispositif)
  const [afficherChangementDispositif, setAfficherChangementDispositif] =
    useState<boolean>(false)
  const modalRef = useRef<ModalHandles>(null)

  async function changerDispositif(nouveauDispositif: string): Promise<void> {
    const { modifierDispositif } = await import(
      'services/beneficiaires.service'
    )
    await modifierDispositif(beneficiaire.id, nouveauDispositif)
    setDispositifActuel(nouveauDispositif)
    modalRef.current!.closeModal()
  }

  return (
    <>
      <div className='border border-solid rounded-base w-full p-4 border-grey_100 mb-3'>
        <h2 className='text-m-bold text-grey_800 mb-2'>Bénéficiaire</h2>

        {conseillerEstMilo && (
          <BoutonChangementDispositif
            onClick={() => setAfficherChangementDispositif(true)}
          />
        )}

        {urlDossier && <DossierExterne href={urlDossier} />}

        <dl className='mt-4'>
          {conseillerEstMilo && (
            <>
              <div className='flex gap-1'>
                <dt>Ajouté le :</dt>
                <dd className='text-base-bold'>
                  {creationDate ? (
                    toLongMonthDate(creationDate)
                  ) : (
                    <InformationNonDisponible />
                  )}
                </dd>
              </div>

              <div className='flex gap-1'>
                <dt>Dispositif :</dt>
                <dd>
                  <DispositifTag dispositif={dispositifActuel} />
                </dd>
              </div>
            </>
          )}

          {email && (
            <div className='flex gap-1'>
              <dt>Email :</dt>
              <dd className='text-base-bold'>{email}</dd>
            </div>
          )}

          {!conseillerEstMilo &&
            onIdentifiantPartenaireCopie &&
            onIdentifiantPartenaireClick && (
              <IdentifiantPartenaire
                identifiantPartenaire={identifiantPartenaire}
                onCopy={onIdentifiantPartenaireCopie}
                onClick={onIdentifiantPartenaireClick}
              />
            )}

          {conseillerEstMilo && estCEJ(beneficiaire) && (
            <div className='flex gap-1'>
              <dt>Date de fin du CEJ :</dt>
              <dd className='text-base-bold ml-1'>
                {dateFinCEJ ? (
                  toLongMonthDate(dateFinCEJ)
                ) : (
                  <InformationNonDisponible />
                )}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {afficherChangementDispositif && (
        <ChangementDispositifBeneficiaireModal
          ref={modalRef}
          dispositif={dispositifActuel}
          onConfirm={changerDispositif}
          onCancel={() => setAfficherChangementDispositif(false)}
        />
      )}
    </>
  )
}

export function IdentifiantPartenaire(props: {
  identifiantPartenaire: string | undefined
  onCopy: () => void
  onClick: () => void
}) {
  return (
    <div className='flex gap-1'>
      <dt>Identifiant France Travail :</dt>
      <dd className='text-base-bold' onCopy={props.onCopy}>
        {props.identifiantPartenaire ?? (
          <>
            <span className='sr-only'>non renseigné</span>
            <span>-</span>
          </>
        )}
        <button
          className='ml-5 flex items-center text-primary'
          aria-label={
            props.identifiantPartenaire
              ? 'Modifier l’identifiant France Travail'
              : 'Ajouter l’identifiant France Travail'
          }
          onClick={props.onClick}
        >
          <IconComponent
            name={IconName.Edit}
            aria-hidden={true}
            focusable={false}
            className='w-4 h-4 mr-1 fill-primary'
          />
          {props.identifiantPartenaire ? 'Modifier' : 'Ajouter'}
        </button>
      </dd>
    </div>
  )
}

function BoutonChangementDispositif({ onClick }: { onClick: () => void }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='flex items-center underline hover:text-primary'
    >
      Changer le bénéficiaire de dispositif
      <IconComponent
        name={IconName.ChevronRight}
        className='w-4 h-5 fill-current'
        aria-hidden={true}
        focusable={false}
      />
    </button>
  )
}

function DossierExterne({ href }: { href: string }) {
  return (
    <a
      className='mt-2 flex items-center underline hover:text-primary'
      href={href}
      target='_blank'
      rel='noopener noreferrer'
    >
      Dossier jeune i-milo{' '}
      <span id='nouvelle-fenetre' className='sr-only'>
        (nouvelle fenêtre)
      </span>
      <IconComponent
        name={IconName.OpenInNew}
        focusable={false}
        role='img'
        title='(nouvelle fenêtre)'
        aria-labelledby='nouvelle-fenetre'
        className='ml-2 w-4 h-4 fill-current'
      />
    </a>
  )
}

function InformationNonDisponible() {
  return (
    <>
      --
      <span className='sr-only'> information non disponible</span>
    </>
  )
}
