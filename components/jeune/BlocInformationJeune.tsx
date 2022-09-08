import Link from 'next/link'
import React, { MouseEventHandler } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { StructureConseiller } from 'interfaces/conseiller'
import { formatDayDate } from 'utils/date'

interface BlocInformationJeuneProps {
  idJeune: string
  creationDate: string
  email: string | undefined
  structureConseiller: StructureConseiller | undefined
  onIdentifiantPartenaireCopie: () => void
  identifiantPartenaire: string | undefined
  onIdentifiantPartenaireClick: () => void
  urlDossier: string | undefined
  onDossierMiloClick: () => void
  onDeleteJeuneClick: MouseEventHandler<HTMLButtonElement>
}

export function BlocInformationJeune({
  idJeune,
  creationDate,
  email,
  structureConseiller,
  onIdentifiantPartenaireCopie,
  identifiantPartenaire,
  onIdentifiantPartenaireClick,
  urlDossier,
  onDossierMiloClick,
  onDeleteJeuneClick,
}: BlocInformationJeuneProps) {
  return (
    <div className='border border-solid rounded-medium w-full p-4 border-grey_100'>
      <h2 className='text-base-bold mb-4'>Informations</h2>
      <dl>
        <div className='flex'>
          <dt className='text-base-regular'>Ajouté le :</dt>
          <dd>
            <span className='text-base-medium ml-1'>
              {formatDayDate(new Date(creationDate))}
            </span>
          </dd>
        </div>

        {email && (
          <div className='flex items-center'>
            <dt>
              <IconComponent
                name={IconName.Email}
                aria-label='e-mail'
                aria-hidden={false}
                focusable={false}
                className='w-[15px] h-[13px] mr-2'
              />
            </dt>
            <dd className='text-primary'>{email}</dd>
          </div>
        )}

        {structureConseiller !== StructureConseiller.MILO && (
          <div className='flex'>
            <dt className='text-base-regular mr-2'>
              Identifiant Pôle emploi :
            </dt>
            <dd
              className='text-base-bold'
              onCopy={onIdentifiantPartenaireCopie}
            >
              {identifiantPartenaire ? (
                identifiantPartenaire
              ) : (
                <>
                  <span className='sr-only'>non renseigné</span>
                  <span>-</span>
                </>
              )}
            </dd>
            <button
              className='ml-5 flex items-center text-primary'
              aria-label={
                identifiantPartenaire
                  ? 'Modifier l’identifiant Pôle emploi'
                  : 'Ajouter l’identifiant Pôle emploi'
              }
              onClick={onIdentifiantPartenaireClick}
            >
              <IconComponent
                name={IconName.Pen}
                aria-hidden={true}
                focusable={false}
                className='w-4 h-4 mr-1 fill-primary'
              />
              {identifiantPartenaire ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        )}

        {urlDossier && (
          <>
            <dt className='sr-only'>Dossier externe</dt>
            <dd className='mt-2'>
              <a
                className='underline text-primary hover:text-primary_darken flex items-center'
                href={urlDossier}
                target='_blank'
                onClick={onDossierMiloClick}
                rel='noopener noreferrer'
              >
                Dossier jeune i-Milo
                <IconComponent
                  name={IconName.Launch}
                  focusable='false'
                  role='img'
                  title='ouvrir'
                  className='ml-2 w-3 h-3'
                />
              </a>
            </dd>
          </>
        )}
      </dl>

      <div className='flex flex-row justify-between items-end mt-4'>
        <Button
          onClick={onDeleteJeuneClick}
          style={ButtonStyle.SECONDARY}
          className='w-fit'
        >
          Supprimer ce compte
        </Button>

        {structureConseiller &&
          [
            StructureConseiller.POLE_EMPLOI,
            StructureConseiller.PASS_EMPLOI,
          ].includes(structureConseiller) && (
            <Link href={`/mes-jeunes/${idJeune}/historique`}>
              <a className='flex items-center text-content_color underline hover:text-primary hover:fill-primary'>
                Voir l’historique des conseillers
                <IconComponent
                  name={IconName.ChevronRight}
                  className='w-4 h-5 fill-[inherit]'
                  aria-hidden={true}
                  focusable={false}
                />
              </a>
            </Link>
          )}
      </div>
    </div>
  )
}
