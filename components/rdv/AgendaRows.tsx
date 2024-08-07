import { DateTime } from 'luxon'
import React, { Fragment, ReactNode } from 'react'

import TD from 'components/ui/Table/TD'
import TR from 'components/ui/Table/TR'
import {
  AUJOURDHUI_LABEL,
  formatJourIfToday,
  isApresMidi,
  isMatin,
} from 'utils/date'

export const PLAGE_HORAIRE_MATIN = 'Matin'
export const PLAGE_HORAIRE_APRES_MIDI = 'Après-midi'
export const NOMBRE_COLONNES = 6

type DataJour<T> = { matin: T[]; apresMidi: T[] }
export type AgendaData<T extends { id: string }> = Map<
  string,
  undefined | DataJour<T>
>

export function buildAgendaData<T extends { id: string }>(
  elements: T[],
  periode: { debut: DateTime; fin: DateTime },
  extractDate: (element: T) => DateTime
): AgendaData<T> {
  const agenda: AgendaData<T> = new Map()

  initialiserAgendaJoursVides(agenda, periode)
  remplirAgenda(agenda, elements, extractDate)

  return agenda
}

export function AgendaRows<T extends { id: string }>({
  agenda,
  Item,
}: {
  agenda: AgendaData<T>
  Item: (props: { item: T }) => React.JSX.Element
}): React.JSX.Element {
  return (
    <>
      {Array.from(agenda.entries()).map(([jour, dataJour], index) => (
        <Fragment key={jour}>
          {!dataJour && (
            <>
              <IntercalaireDate jour={jour} index={index} />
              <IntercalaireFiller />
            </>
          )}

          {dataJour && (
            <>
              <IntercalaireDate jour={jour} index={index} />
              {Boolean(dataJour.matin.length) && (
                <>
                  <IntercalairePlageHoraire
                    label={PLAGE_HORAIRE_MATIN}
                    jour={jour}
                  />
                  {dataJour.matin.map((item) => (
                    <Item item={item} key={item.id} />
                  ))}
                </>
              )}
              {Boolean(dataJour.apresMidi.length) && (
                <>
                  <IntercalairePlageHoraire
                    label={PLAGE_HORAIRE_APRES_MIDI}
                    jour={jour}
                  />
                  {dataJour.apresMidi.map((item) => (
                    <Item item={item} key={item.id} />
                  ))}
                </>
              )}
            </>
          )}
        </Fragment>
      ))}
    </>
  )
}

function IntercalaireDate({ jour, index }: { jour: string; index: number }) {
  const label = formatJourIfToday(DateTime.fromISO(jour))
  return (
    <Intercalaire
      key={'intercalaire-' + jour}
      colspan={NOMBRE_COLONNES}
      className={`text-m-bold capitalize whitespace-nowrap pl-4 ${
        index > 0 ? 'pt-6' : ''
      } ${label === AUJOURDHUI_LABEL ? 'text-primary' : 'text-content_color'} `}
    >
      {label}
    </Intercalaire>
  )
}

function IntercalairePlageHoraire({
  label,
  jour,
}: {
  label: string
  jour: string
}) {
  return (
    <Intercalaire
      colspan={NOMBRE_COLONNES}
      key={`${label}-${jour}`}
      className='text-s-bold pl-4'
    >
      {label}
    </Intercalaire>
  )
}

function IntercalaireFiller() {
  return (
    <TR>
      <TD colSpan={NOMBRE_COLONNES}>
        <div className='text-base-bold max-w-[250px]'>
          Aucun rendez-vous ou événements prévus ce jour.
        </div>
      </TD>
    </TR>
  )
}

function initialiserAgendaJoursVides<T extends { id: string }>(
  agenda: AgendaData<T>,
  periode: { debut: DateTime; fin: DateTime }
) {
  const premierJour = periode.debut.startOf('day')
  const dernierJour = periode.fin.startOf('day')
  for (
    let jourCourant = premierJour;
    jourCourant <= dernierJour;
    jourCourant = jourCourant.plus({ day: 1 })
  ) {
    agenda.set(jourCourant.toISODate(), undefined)
  }
}

function remplirAgenda<T extends { id: string }>(
  agenda: AgendaData<T>,
  elements: T[],
  extractDate: (element: T) => DateTime
) {
  elements.forEach((element) => {
    const datetime = extractDate(element)
    const jour = datetime.toISODate()
    if (agenda.get(jour) === undefined)
      agenda.set(jour, { matin: [], apresMidi: [] })

    if (isMatin(datetime.hour))
      (agenda.get(jour) as DataJour<T>).matin.push(element)
    if (isApresMidi(datetime.hour))
      (agenda.get(jour) as DataJour<T>).apresMidi.push(element)
  })
}

function Intercalaire({
  children,
  className,
  colspan,
}: {
  children: ReactNode
  colspan: number
  className: string
}): React.JSX.Element {
  return (
    <tr>
      <th colSpan={colspan} className={className}>
        {children}
      </th>
    </tr>
  )
}
