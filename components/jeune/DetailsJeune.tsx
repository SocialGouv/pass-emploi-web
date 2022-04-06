import { ButtonStyle } from 'components/ui/Button'
import ButtonLink from 'components/ui/ButtonLink'
import { Jeune } from 'interfaces/jeune'
import React from 'react'
import { formatDayDate } from 'utils/date'
import EmailIcon from '../../assets/icons/email.svg'
import Link from 'next/link'

interface DetailsJeuneProps {
  jeune: Jeune
  withButtons?: boolean
  titlePrefix?: string
}

export const conseillersPrecedents = [
  {
    id: 'conseiller-1',
    email: 'mail@mail.com',
    nom: 'Dublon',
    prenom: 'Nicolas',
    date: '12/03/2022',
  },
  {
    id: 'conseiller-2',
    email: 'conseiller@mail.fr',
    nom: 'Maravillo',
    prenom: 'Sarah',
    date: '14/12/2021',
  },
]

export const DetailsJeune = ({
  jeune,
  titlePrefix,
  withButtons = true,
}: DetailsJeuneProps) => {
  return (
    <>
      <div className='flex'>
        <h1 className='h2-semi text-bleu_nuit mb-3'>
          {titlePrefix ? `${titlePrefix} ` : ''}
          {jeune.firstName} {jeune.lastName}
        </h1>

        {!jeune.isActivated && withButtons && (
          <ButtonLink
            href={`/mes-jeunes/${jeune.id}/suppression`}
            style={ButtonStyle.WARNING}
            className='ml-8'
          >
            Supprimer ce compte
          </ButtonLink>
        )}
      </div>

      <dl className='flex text-sm-semi text-bleu_nuit mb-2'>
        <dt className='mr-2'>Ajouté le :</dt>
        <dd>{formatDayDate(new Date(jeune.creationDate))}</dd>
      </dl>

      {jeune.email && (
        <dl className='flex text-sm-semi text-bleu_nuit'>
          <dt className='mr-2'>
            <EmailIcon focusable='false' role='img' title='e-mail' />
          </dt>
          <dd>{jeune.email}</dd>
        </dl>
      )}

      {!jeune.isActivated && (
        <p className='mt-4 bg-warning_lighten py-4 px-7 rounded-medium max-w-md text-center'>
          <span className='text-sm-semi text-warning'>
            Ce jeune ne s&apos;est pas encore connect&eacute; &agrave;
            l&apos;application.
          </span>
        </p>
      )}

      <div className='mt-8'>
        <h2 className='text-base-medium mb-2'>Historique des conseillers</h2>
        <ol className='list-disc'>
          {conseillersPrecedents.map(({ nom, prenom, date, id }) => (
            <li className='ml-5' key={id}>
              Du {date} à aujourd&apos;hui :{' '}
              <span className='text-base-medium'>
                {nom} {prenom}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className='flex justify-center mt-8'>
        <Link href={`/mes-jeunes/${jeune.id}/conseillers`}>
          <a className='text-sm text-bleu_nuit underline'>
            Voir l&apos;historique complet
          </a>
        </Link>
      </div>
    </>
  )
}
