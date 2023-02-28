import Link from 'next/link'
import React, { useMemo } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { StructureConseiller } from 'interfaces/conseiller'
import { toShortDate } from 'utils/date'

interface BlocInformationJeuneProps {
  idJeune: string
  creationDate: string
  dateFinCEJ: string | undefined
  email: string | undefined
  structureConseiller: StructureConseiller | undefined
  onIdentifiantPartenaireCopie: () => void
  identifiantPartenaire: string | undefined
  onIdentifiantPartenaireClick: () => void
  urlDossier: string | undefined
  onDossierMiloClick: () => void
}

export function BlocInformationJeune({
  idJeune,
  creationDate,
  dateFinCEJ,
  email,
  structureConseiller,
  onIdentifiantPartenaireCopie,
  identifiantPartenaire,
  onIdentifiantPartenaireClick,
  urlDossier,
  onDossierMiloClick,
}: BlocInformationJeuneProps) {
  const shortCreationDate = useMemo(
    () => toShortDate(creationDate),
    [creationDate]
  )

  return (
    <div className='border border-solid rounded-base w-full p-4 border-grey_100'>
      <h2 className='text-m-bold text-grey_800 mb-4'>Informations</h2>
      <dl>
        <div className='flex'>
          <dt className='text-base-regular'>Ajouté le :</dt>
          <dd>
            <span className='text-base-bold ml-1'>{shortCreationDate}</span>
          </dd>
        </div>

        {email && <Email email={email} />}

        {structureConseiller !== StructureConseiller.MILO && (
          <IndentifiantPartenaire
            identifiantPartenaire={identifiantPartenaire}
            onCopy={onIdentifiantPartenaireCopie}
            onClick={onIdentifiantPartenaireClick}
          />
        )}

        {urlDossier && (
          <DossierExterne href={urlDossier} onClick={onDossierMiloClick} />
        )}

        {structureConseiller === StructureConseiller.MILO && (
          <div className='flex'>
            <dt className='text-base-regular'>Date de fin du CEJ :</dt>
            <dd>
              <span className='text-base-bold ml-1'>
                {dateFinCEJ ? toShortDate(dateFinCEJ) : '--'}
              </span>
            </dd>
          </div>
        )}
      </dl>

      {structureConseiller !== StructureConseiller.MILO && (
        <LienVersHistorique idJeune={idJeune} />
      )}
    </div>
  )
}

function Email(props: { email: string }) {
  return (
    <div className='flex items-center'>
      <dt>
        <IconComponent
          name={IconName.Email}
          aria-label='e-mail'
          aria-hidden={false}
          focusable={false}
          className='w-4 h-4 fill-primary mr-2'
        />
      </dt>
      <dd className='text-primary'>{props.email}</dd>
    </div>
  )
}

function IndentifiantPartenaire(props: {
  identifiantPartenaire: string | undefined
  onCopy: () => void
  onClick: () => void
}) {
  return (
    <div className='flex'>
      <dt className='text-base-regular mr-2'>Identifiant Pôle emploi :</dt>
      <dd className='text-base-bold' onCopy={props.onCopy}>
        {props.identifiantPartenaire ?? (
          <>
            <span className='sr-only'>non renseigné</span>
            <span>-</span>
          </>
        )}
      </dd>
      <button
        className='ml-5 flex items-center text-primary'
        aria-label={
          props.identifiantPartenaire
            ? 'Modifier l’identifiant Pôle emploi'
            : 'Ajouter l’identifiant Pôle emploi'
        }
        onClick={props.onClick}
      >
        <IconComponent
          name={IconName.Pen}
          aria-hidden={true}
          focusable={false}
          className='w-4 h-4 mr-1 fill-primary'
        />
        {props.identifiantPartenaire ? 'Modifier' : 'Ajouter'}
      </button>
    </div>
  )
}

function DossierExterne(props: { href: string; onClick: () => void }) {
  return (
    <>
      <dt className='sr-only'>Dossier externe</dt>
      <dd className='mt-2'>
        <a
          className='underline text-primary hover:text-primary_darken flex items-center'
          href={props.href}
          target='_blank'
          onClick={props.onClick}
          rel='noopener noreferrer'
        >
          Dossier jeune i-Milo
          <IconComponent
            name={IconName.Launch}
            focusable='false'
            role='img'
            title='ouvrir'
            className='ml-2 w-3 h-3 fill-primary'
          />
        </a>
      </dd>
    </>
  )
}

function LienVersHistorique(props: { idJeune: string }) {
  return (
    <Link
      href={`/mes-jeunes/${props.idJeune}/historique`}
      className='flex items-center text-content_color underline hover:text-primary hover:fill-primary'
    >
      Voir l’historique des conseillers
      <IconComponent
        name={IconName.ChevronRight}
        className='w-4 h-5 fill-[inherit]'
        aria-hidden={true}
        focusable={false}
      />
    </Link>
  )
}
