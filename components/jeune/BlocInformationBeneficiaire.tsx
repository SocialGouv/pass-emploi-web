import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useRef, useState } from 'react'

import ChangementDispositifBeneficiaireModal from 'components/ChangementDispositifBeneficiaireModal' // FIXME should use dynamic(() => import() but issue with jest
import { IdentifiantPartenaire } from 'components/jeune/BlocInformationJeune'
import { ModalHandles } from 'components/Modal'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DetailBeneficiaire, estCEJ } from 'interfaces/beneficiaire'
import { Conseiller } from 'interfaces/conseiller'
import { estFTConnect, estMilo } from 'interfaces/structure'
import { toRelativeDateTime, toShortDate } from 'utils/date'

interface BlocInformationBeneficiaireProps {
  beneficiaire: DetailBeneficiaire
  conseiller: Conseiller
  // TODO refactor : regrouper
  dispositif: string
  onChangementDispositif?: (nouveauDispositif: string) => Promise<void>
  // TODO refactor : regrouper
  onIdentifiantPartenaireCopie?: () => void
  identifiantPartenaire?: string
  onIdentifiantPartenaireClick?: () => void
}

export default function BlocInformationBeneficiaire({
  beneficiaire,
  conseiller,
  dispositif,
  onChangementDispositif,
  onIdentifiantPartenaireCopie,
  identifiantPartenaire,
  onIdentifiantPartenaireClick,
}: BlocInformationBeneficiaireProps) {
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'
  const conseillerEstMilo = estMilo(conseiller.structure)
  const aIdentifiantFT = estFTConnect(conseiller.structure)
  const { dateFinCEJ, email, id, isActivated, lastActivity, urlDossier } =
    beneficiaire

  const [afficherChangementDispositif, setAfficherChangementDispositif] =
    useState<boolean>(false)
  const modalRef = useRef<ModalHandles>(null)

  async function changerDispositif(nouveauDispositif: string) {
    await onChangementDispositif!(nouveauDispositif)
    modalRef.current!.closeModal()
  }

  return (
    <>
      <div className='grow shrink-0 px-6'>
        <h2 className='text-base-bold text-content-color mb-4'>Informations</h2>
        <dl className='flex flex-col gap-1 mb-4'>
          {conseillerEstMilo && estCEJ(beneficiaire) && (
            <div className='w-fit rounded-full flex items-center gap-1 text-s-medium px-3 bg-primary-lighten text-primary'>
              <dt>Date de fin du CEJ :</dt>
              <dd>
                {dateFinCEJ ? (
                  toShortDate(dateFinCEJ)
                ) : (
                  <>
                    --
                    <span className='sr-only'>information non disponible</span>
                  </>
                )}
              </dd>
            </div>
          )}

          <div className='flex gap-1'>
            <dt className='text-s-regular'>Dernière connexion :</dt>
            <dd className='text-s-bold'>
              {isActivated && toRelativeDateTime(lastActivity!)}
              {!isActivated && (
                <span className='text-warning'>Compte non activé</span>
              )}
            </dd>
          </div>

          {email && (
            <div className='flex gap-1'>
              <dt className='text-s-regular'>Email :</dt>
              <dd className='text-s-bold'>{email}</dd>
            </div>
          )}

          {conseillerEstMilo && urlDossier && (
            <LienDossierMilo href={urlDossier} />
          )}

          {aIdentifiantFT &&
            onIdentifiantPartenaireCopie &&
            onIdentifiantPartenaireClick && (
              <IdentifiantPartenaire
                identifiantPartenaire={identifiantPartenaire}
                onCopy={onIdentifiantPartenaireCopie}
                onClick={onIdentifiantPartenaireClick}
              />
            )}
        </dl>

        {onChangementDispositif && (
          <BoutonChangementDispositif
            onClick={() => setAfficherChangementDispositif(true)}
          />
        )}

        <LienVersInformations idBeneficiaire={id} pathPrefix={pathPrefix} />
      </div>

      {afficherChangementDispositif && (
        <ChangementDispositifBeneficiaireModal
          ref={modalRef}
          dispositif={dispositif}
          onConfirm={changerDispositif}
          onCancel={() => setAfficherChangementDispositif(false)}
        />
      )}
    </>
  )
}

function BoutonChangementDispositif({ onClick }: { onClick: () => void }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='underline text-s-regular mb-1 hover:text-primary'
    >
      Changer le bénéficiaire de dispositif
      <IconComponent
        name={IconName.ChevronRight}
        className='inline-block w-4 h-5 fill-current'
        aria-hidden={true}
        focusable={false}
      />
    </button>
  )
}

function LienVersInformations({
  idBeneficiaire,
  pathPrefix,
}: {
  idBeneficiaire: string
  pathPrefix: string
}) {
  return (
    <Link
      href={`${pathPrefix}/${idBeneficiaire}/informations?onglet=informations`}
      className='flex items-center underline text-s-regular hover:text-primary'
    >
      Voir plus d’informations
      <IconComponent
        name={IconName.ChevronRight}
        className='w-4 h-5 fill-current'
        aria-hidden={true}
        focusable={false}
      />
    </Link>
  )
}

function LienDossierMilo({ href }: { href: string }) {
  return (
    <>
      <dt className='sr-only'>Lien : </dt>
      <dl>
        <a
          className='flex items-center underline text-s-regular text-primary hover:text-primary-darken'
          href={href}
          target='_blank'
          rel='noopener noreferrer'
        >
          <IconComponent
            name={IconName.OpenInNew}
            aria-hidden={true}
            focusable={false}
            className='mr-2 w-4 h-4 fill-current'
          />
          Dossier jeune i-milo{' '}
          <span id='nouvelle-fenetre' className='sr-only'>
            (nouvelle fenêtre)
          </span>
        </a>
      </dl>
    </>
  )
}
