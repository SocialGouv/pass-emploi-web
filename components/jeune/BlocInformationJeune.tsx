import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Conseiller, estMilo } from 'interfaces/conseiller'
import { toShortDate } from 'utils/date'

interface BlocInformationJeuneProps {
  conseiller: Conseiller
  creationDate: string
  onDossierMiloClick: () => void
  dateFinCEJ?: string
  email?: string
  urlDossier?: string
  onIdentifiantPartenaireCopie?: () => void
  identifiantPartenaire?: string
  onIdentifiantPartenaireClick?: () => void
}

export function BlocInformationJeune({
  conseiller,
  creationDate,
  dateFinCEJ,
  email,
  urlDossier,
  onDossierMiloClick,
  onIdentifiantPartenaireCopie,
  identifiantPartenaire,
  onIdentifiantPartenaireClick,
}: BlocInformationJeuneProps) {
  const conseillerEstMilo = estMilo(conseiller)

  return (
    <div className='border border-solid rounded-base w-full p-4 border-grey_100 mb-3'>
      <h2 className='text-m-bold text-grey_800 mb-2'>Bénéficiaire</h2>

      <dl>
        {conseillerEstMilo && (
          <div className='flex'>
            <dt className='text-base-regular'>Ajouté le :</dt>
            <dd className='text-base-bold ml-1'>
              {creationDate ? (
                toShortDate(creationDate)
              ) : (
                <InformationNonDisponible />
              )}
            </dd>
          </div>
        )}

        {email && <Email email={email} />}

        {!conseillerEstMilo &&
          onIdentifiantPartenaireCopie &&
          onIdentifiantPartenaireClick && (
            <IdentifiantPartenaire
              identifiantPartenaire={identifiantPartenaire}
              onCopy={onIdentifiantPartenaireCopie}
              onClick={onIdentifiantPartenaireClick}
            />
          )}

        {urlDossier && (
          <DossierExterne href={urlDossier} onClick={onDossierMiloClick} />
        )}

        {conseillerEstMilo && (
          <div className='flex'>
            <dt className='text-base-regular'>Date de fin du CEJ :</dt>
            <dd className='text-base-bold ml-1'>
              {dateFinCEJ ? (
                toShortDate(dateFinCEJ)
              ) : (
                <InformationNonDisponible />
              )}
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}

export function Email({ email }: { email: string }) {
  return (
    <div className='flex items-center'>
      <dt>
        <IconComponent
          name={IconName.Mail}
          role='img'
          aria-label='e-mail'
          focusable={false}
          className='w-4 h-4 fill-primary mr-2'
        />
      </dt>
      <dd className='text-primary'>{email}</dd>
    </div>
  )
}

export function IdentifiantPartenaire(props: {
  identifiantPartenaire: string | undefined
  onCopy: () => void
  onClick: () => void
}) {
  return (
    <div className='flex'>
      <dt className='text-base-regular mr-2'>Identifiant France Travail :</dt>
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

function DossierExterne({
  href,
  onClick,
}: {
  href: string
  onClick: () => void
}) {
  return (
    <>
      <dt className='sr-only'>Dossier externe</dt>
      <dd className='mt-2'>
        <a
          className='underline text-primary hover:text-primary_darken flex items-center'
          href={href}
          target='_blank'
          onClick={onClick}
          rel='noopener noreferrer'
        >
          Dossier jeune i-milo{' '}
          <span className='sr-only'>(nouvelle fenêtre)</span>
          <IconComponent
            name={IconName.OpenInNew}
            focusable={false}
            role='img'
            title='ouvrir'
            aria-hidden={true}
            className='ml-2 w-4 h-4 fill-current'
          />
        </a>
      </dd>
    </>
  )
}

export function InformationNonDisponible() {
  return (
    <>
      --
      <span className='sr-only'>information non disponible</span>
    </>
  )
}
