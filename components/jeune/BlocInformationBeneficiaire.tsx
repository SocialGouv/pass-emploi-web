import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DetailBeneficiaire, estCEJ } from 'interfaces/beneficiaire'
import { estFTConnect, estMilo } from 'interfaces/structure'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toRelativeDateTime, toShortDate } from 'utils/date'

interface BlocInformationBeneficiaireProps {
  beneficiaire: DetailBeneficiaire
  onHistoriqueConseillers: () => void
  onChangementDispositif?: () => void
  // TODO refactor : regrouper
  onIdentifiantPartenaireCopie?: () => void
  identifiantPartenaire?: string
  onIdentifiantPartenaireClick?: () => void
}

export default function BlocInformationBeneficiaire({
  beneficiaire,
  onHistoriqueConseillers,
  onChangementDispositif,
  onIdentifiantPartenaireCopie,
  identifiantPartenaire,
  onIdentifiantPartenaireClick,
}: BlocInformationBeneficiaireProps) {
  const [conseiller] = useConseiller()

  const conseillerEstMilo = estMilo(conseiller.structure)
  const aIdentifiantFT = estFTConnect(conseiller.structure)
  const { dateFinCEJ, email, isActivated, lastActivity, urlDossier } =
    beneficiaire

  return (
    <>
      <div className='grow shrink-0 px-6'>
        <h2 className='text-base-bold text-content-color mb-4'>Informations</h2>
        <dl className='flex flex-col gap-1 mb-4'>
          {estCEJ(beneficiaire) && (
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
              <IdentifiantFT
                identifiantPartenaire={identifiantPartenaire}
                onCopy={onIdentifiantPartenaireCopie}
                onClick={onIdentifiantPartenaireClick}
              />
            )}
        </dl>

        {onChangementDispositif && (
          <UnderlinedButton
            label='Changer le bénéficiaire de dispositif'
            onClick={onChangementDispositif}
          />
        )}

        <UnderlinedButton
          label='Consulter l’historique des conseillers'
          onClick={onHistoriqueConseillers}
        />
      </div>
    </>
  )
}

function UnderlinedButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='block underline text-s-regular mb-1 hover:text-primary'
    >
      {label}
      <IconComponent
        name={IconName.ChevronRight}
        className='inline-block w-4 h-5 fill-current'
        aria-hidden={true}
        focusable={false}
      />
    </button>
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

export function IdentifiantFT({
  identifiantPartenaire,
  onClick,
  onCopy,
}: {
  identifiantPartenaire: string | undefined
  onCopy: () => void
  onClick: () => void
}) {
  return (
    <div className='flex gap-1 items-center'>
      <dt>Identifiant France Travail :</dt>
      <dd className='text-base-bold inline-flex items-center' onCopy={onCopy}>
        {identifiantPartenaire ?? (
          <>
            <span className='sr-only'>non renseigné</span>
            <span>-</span>
          </>
        )}
        <button
          className='ml-1 inline-flex items-center text-primary'
          aria-label={
            identifiantPartenaire
              ? 'Modifier l’identifiant France Travail'
              : 'Ajouter l’identifiant France Travail'
          }
          onClick={onClick}
        >
          <IconComponent
            name={IconName.Edit}
            aria-hidden={true}
            focusable={false}
            className='w-4 h-4 mr-1 fill-primary'
          />
          {identifiantPartenaire ? 'Modifier' : 'Ajouter'}
        </button>
      </dd>
    </div>
  )
}
