import { Jeune } from '../../interfaces/jeune'
import Link from 'next/link'
import ChevronRight from '../../assets/icons/chevron_right.svg'
import {
  dateIsToday,
  dateIsYesterday,
  formatDayDate,
  formatHourMinuteDate,
} from '../../utils/date'

interface TableauJeunesProps {
  jeunes: Jeune[]
}

function todayOrDate(date: Date): string {
  let dateString = ''

  if (dateIsToday(date)) {
    dateString = "aujourd'hui"
  } else if (dateIsYesterday(date)) {
    dateString = 'hier'
  } else {
    dateString = `Le ${formatDayDate(date)}`
  }

  return `${dateString} à ${formatHourMinuteDate(date)}`
}

export const TableauJeunes = ({ jeunes }: TableauJeunesProps) => {
  return (
    <div
      role='table'
      className='table w-full'
      aria-label='jeunes'
      aria-describedby='table-caption'
    >
      <div id='table-caption' className='visually-hidden'>
        Liste de mes jeunes
      </div>
      <div role='rowgroup'>
        <div role='row' className='table-row grid grid-cols-table'>
          <span
            role='columnheader'
            className='table-cell text-sm text-bleu text-left p-4'
          >
            Nom du jeune
          </span>

          <span
            role='columnheader'
            className='table-cell text-sm text-bleu text-left pb-4 pt-4'
          >
            Dernière activité
          </span>
        </div>
      </div>

      <div role='rowgroup'>
        {jeunes?.map((jeune: Jeune) => (
          <Link href={`/mes-jeunes/${jeune.id}`} key={jeune.id} passHref>
            <a
              key={jeune.id}
              role='row'
              aria-label={`Accéder à la fiche de ${jeune.firstName} ${jeune.lastName}, dernière activité ${jeune.lastActivity}`}
              className='table-row grid grid-cols-table text-sm text-bleu_nuit items-center cursor-pointer hover:bg-gris_blanc'
            >
              <span role='cell' className='table-cell p-4' aria-hidden='true'>
                {jeune.lastName} {jeune.firstName}
              </span>

              <span role='cell' className='table-cell p-4' aria-hidden='true'>
                {jeune.lastActivity
                  ? todayOrDate(new Date(jeune.lastActivity))
                  : ''}
              </span>

              <span
                role='cell'
                className='table-cell p-4 col-end-6'
                aria-hidden='true'
              >
                <ChevronRight aria-hidden='true' focusable='false' />
              </span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  )
}
