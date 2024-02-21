import { DateTime } from 'luxon'
import React, { useState } from 'react'

import FailureIcon from 'assets/icons/informations/info.svg'
import { AgendaData, AgendaRows } from 'components/AgendaRows'
import { EvenementRow } from 'components/rdv/EvenementRow'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
import { EvenementListItem } from 'interfaces/evenement'
import { toMonthday } from 'utils/date'

type TableauEvenementsConseillerProps = {
  idConseiller: string
  agendaEvenements: AgendaData<EvenementListItem>
  onChargerEvenementsJour: (jour: DateTime) => Promise<void>
}

export default function TableauEvenementsConseiller({
  agendaEvenements,
  idConseiller,
  onChargerEvenementsJour,
}: TableauEvenementsConseillerProps) {
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
          agenda={agendaEvenements}
          Item={({ item }) => (
            <EvenementRow
              key={item.id}
              evenement={item}
              idConseiller={idConseiller}
            />
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
  onClick: (jour: DateTime) => Promise<void>
}): React.JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [failed, setFailed] = useState<boolean>(false)

  async function chargerEvenementsJours() {
    setIsLoading(true)
    try {
      await onClick(jour)
    } catch {
      setFailed(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (failed) {
    return (
      <div className='flex items-center'>
        <FailureIcon
          aria-hidden={true}
          focusable={false}
          className='w-6 h-6 mr-2 fill-warning shrink-0'
        />
        <p className='mr-2 text-base-bold text-warning max-w-[150px]'>
          Le chargement de l’agenda du jour a échoué.
        </p>
        <Button
          style={ButtonStyle.SECONDARY}
          onClick={chargerEvenementsJours}
          isLoading={isLoading}
        >
          Réssayer
        </Button>
      </div>
    )
  } else {
    return (
      <Button
        style={ButtonStyle.SECONDARY}
        className='m-auto'
        onClick={chargerEvenementsJours}
        isLoading={isLoading}
        label={'Afficher l’agenda du ' + toMonthday(jour)}
      >
        Afficher l’agenda du jour
      </Button>
    )
  }
}
