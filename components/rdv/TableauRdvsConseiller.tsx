import { DateTime } from 'luxon'
import React, { useState } from 'react'

import { RdvRow } from 'components/rdv/RdvRow'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
import { EvenementListItem } from 'interfaces/evenement'
import { AgendaRows, AgendaData } from 'presentation/AgendaRows'
import { toFrenchFormat, WEEKDAY_MONTH_LONG } from 'utils/date'

type TableauRdvsConseillerProps = {
  idConseiller: string
  agendaRdvs: AgendaData<EvenementListItem>
  onChargerEvenementsJour: (jour: DateTime) => Promise<void>
}

export default function TableauRdvsConseiller({
  agendaRdvs,
  idConseiller,
  onChargerEvenementsJour,
}: TableauRdvsConseillerProps) {
  return (
    <Table asDiv={true} caption={{ text: 'Liste de mes événements' }}>
      <THead>
        <TR isHeader={true}>
          <TH>Horaires</TH>
          <TH>Bénéficiaire</TH>
          <TH>Type</TH>
          <TH>Modalité</TH>
          <TH>Créé par vous</TH>
        </TR>
      </THead>

      <TBody>
        <AgendaRows
          agenda={agendaRdvs}
          Item={({ item }) => (
            <RdvRow key={item.id} rdv={item} idConseiller={idConseiller} />
          )}
          Filler={({ jourISO }) => (
            <ButtonChargerEvenementsJour
              jour={DateTime.fromISO(jourISO)}
              onClick={onChargerEvenementsJour}
            />
          )}
        />
      </TBody>
    </Table>
  )
}

function ButtonChargerEvenementsJour({
  jour,
  onClick,
}: {
  jour: DateTime
  onClick: (jour: DateTime) => void
}): React.JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  function propagateClick() {
    setIsLoading(true)
    onClick(jour)
  }

  return (
    <Button
      style={ButtonStyle.SECONDARY}
      className='m-auto'
      onClick={propagateClick}
      isLoading={isLoading}
      label={'Afficher l’agenda du ' + toFrenchFormat(jour, WEEKDAY_MONTH_LONG)}
    >
      Afficher l’agenda du jour
    </Button>
  )
}
