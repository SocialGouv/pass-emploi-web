import { DateTime } from 'luxon'
import React, { Fragment } from 'react'

import { Intercalaire } from 'components/ui/Table/Intercalaire'
import {
  AUJOURDHUI_LABEL,
  formatJourIfToday,
  isApresMidi,
  isMatin,
} from 'utils/date'

export const PLAGE_HORAIRE_MATIN = 'Matin'
export const PLAGE_HORAIRE_APRES_MIDI = 'Après-midi'

type DataJour<T> = { matin: T[]; apresMidi: T[] }
export type AgendaData<T extends { id: string }> = Map<
  string,
  undefined | 'NO_DATA' | DataJour<T>
>

export function buildAgendaData<T extends { id: string }>(
  elements: T[],
  periode: { debut: DateTime; fin: DateTime },
  extractDate: (element: T) => DateTime,
  indexJoursCharges: number[] = [0, 1, 2, 3, 4, 5, 6]
): AgendaData<T> {
  const agenda: AgendaData<T> = new Map()
  const premierJour = periode.debut.startOf('day')
  const dernierJour = periode.fin.startOf('day')
  for (
    let jourCourant = premierJour;
    jourCourant <= dernierJour;
    jourCourant = jourCourant.plus({ day: 1 })
  ) {
    agenda.set(jourCourant.toISODate(), undefined)
  }

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

  indexJoursCharges.forEach((index) => {
    const jour = premierJour.plus({ day: index }).toISODate()
    if (agenda.get(jour) === undefined) agenda.set(jour, 'NO_DATA')
  })

  return agenda
}

export function AgendaRows<T extends { id: string }>({
  agenda,
  Data,
  Filler,
}: {
  agenda: AgendaData<T>
  Data: (props: { item: T }) => React.JSX.Element
  Filler?: (props: { jourISO: string }) => React.JSX.Element
}): React.JSX.Element {
  return (
    <>
      {Array.from(agenda.entries()).map(([jour, dataJour], index) => (
        <Fragment key={jour}>
          {dataJour && (
            <>
              {dataJour === 'NO_DATA' && (
                <>
                  {Filler && (
                    <>
                      <IntercalaireDate jour={jour} index={index} />
                      <Intercalaire key={'no-data-' + jour}>
                        Aucun événement ce jour
                      </Intercalaire>
                    </>
                  )}
                </>
              )}

              {dataJour !== 'NO_DATA' && (
                <>
                  <IntercalaireDate jour={jour} index={index} />
                  {Boolean(dataJour.matin.length) && (
                    <>
                      <IntercalairePlageHoraire
                        label={PLAGE_HORAIRE_MATIN}
                        jour={jour}
                      />
                      {dataJour.matin.map((item) => (
                        <Data item={item} key={item.id} />
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
                        <Data item={item} key={item.id} />
                      ))}
                    </>
                  )}
                </>
              )}
            </>
          )}

          {!dataJour && Filler && (
            <>
              <IntercalaireDate jour={jour} index={index} />
              <IntercalaireFiller jour={jour} Filler={Filler} />
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
    <Intercalaire key={`${label}-${jour}`} className='text-s-bold pl-4'>
      {label}
    </Intercalaire>
  )
}

function IntercalaireFiller({
  jour,
  Filler,
}: {
  jour: string
  Filler: (props: { jourISO: string }) => React.JSX.Element
}) {
  return (
    <Intercalaire key={'filler-' + jour}>
      <Filler jourISO={jour} />
    </Intercalaire>
  )
}
