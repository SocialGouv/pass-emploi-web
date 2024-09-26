import { usePathname } from 'next/navigation'
import React from 'react'

import TagStatutDemarche from 'components/action/TagStatutDemarche'
import EmptyState from 'components/EmptyState'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { TagCategorie } from 'components/ui/Indicateurs/Tag'
import Table from 'components/ui/Table/Table'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import { TH } from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import { BaseBeneficiaire, Demarche } from 'interfaces/beneficiaire'
import { toLongMonthDate } from 'utils/date'

interface OngletDemarchesProps {
  demarches: Demarche[]
  jeune: BaseBeneficiaire
  lectureSeule?: boolean
}

export default function OngletDemarches({
  demarches,
  jeune,
  lectureSeule,
}: OngletDemarchesProps) {
  return (
    <>
      {demarches.length === 0 && !lectureSeule && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyState
            illustrationName={IllustrationName.Checklist}
            titre={`Aucune démarche pour ${jeune.prenom} ${jeune.nom}.`}
          />
        </div>
      )}

      {demarches.length > 0 && (
        <TableauDemarche demarches={demarches} beneficiaire={jeune} />
      )}
    </>
  )
}

function TableauDemarche({
  demarches,
  beneficiaire,
}: {
  demarches: Demarche[]
  beneficiaire: BaseBeneficiaire
}) {
  return (
    <Table
      caption={{
        text: `Liste des démarches de ${beneficiaire.prenom} ${beneficiaire.nom}`,
      }}
    >
      <thead>
        <TR isHeader={true}>
          <TH>Titre de la démarche</TH>
          <TH>Date d’échéance</TH>
          <TH>Catégorie</TH>
          <TH>Statut</TH>
          <TH>Voir le détail</TH>
        </TR>
      </thead>

      <tbody>
        {demarches.map((demarche: Demarche, key) => (
          <DemarcheRow
            demarche={demarche}
            beneficiaireId={beneficiaire.id}
            key={key}
          />
        ))}
      </tbody>
    </Table>
  )
}

function DemarcheRow({
  demarche,
  beneficiaireId,
}: {
  demarche: Demarche
  beneficiaireId: string
}) {
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  const dateEcheance = toLongMonthDate(demarche.dateFin)

  return (
    <TR>
      <TD className='rounded-l-base max-w-[400px]'>
        <span className='flex items-baseline wrap text-ellipsis overflow-hidden'>
          {demarche.id}
        </span>
      </TD>
      <TD>
        <p className='flex flex-row items-center'>{dateEcheance}</p>
      </TD>
      <TD>
        <p className='flex items-baseline text-ellipsis wrap overflow-hidden max-w-[300px]'>
          <TagCategorie categorie={demarche.label} />
        </p>
      </TD>
      <TD>
        <p className='flex items-center'>
          <TagStatutDemarche status={demarche.statut} />
        </p>
      </TD>
      <TDLink
        href={`${pathPrefix}/${beneficiaireId}/demarches/${demarche.id}`}
        label={`Voir le détail de la démarche ${demarche.id} du ${dateEcheance} : ${demarche.id}`}
      />
    </TR>
  )
}
