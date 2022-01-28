import { Jeune } from '../../interfaces/jeune'
import Link from 'next/link'
import ChevronRight from '../../assets/icons/chevron_right.svg'

interface TableauJeunesProps {
  jeunes: Jeune[]
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
            className='table-cell text-sm text-grey_3 text-left p-4'
          >
            Nom Prénom :
          </span>

          <span
            role='columnheader'
            className='table-cell text-sm text-grey_3 text-left pb-4 pt-4'
          >
            Identifiant
          </span>
        </div>
      </div>

      <div role='rowgroup'>
        {jeunes?.map((jeune: Jeune) => (
          <Link href={`/mes-jeunes/${jeune.id}`} key={jeune.id} passHref>
            <a
              key={jeune.id}
              role='row'
              aria-label={`Accéder à la fiche de ${jeune.firstName} ${jeune.lastName}, identifiant ${jeune.id}`}
              className='table-row grid grid-cols-table text-sm text-black cursor-pointer hover:bg-gris_blanc'
            >
              <span role='cell' className='table-cell p-4' aria-hidden='true'>
                {jeune.lastName} {jeune.firstName}
              </span>

              <span role='cell' className='table-cell p-4' aria-hidden='true'>
                {jeune.id}
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
