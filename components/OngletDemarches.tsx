import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import FiltresStatuts from 'components/action/FiltresStatuts'
import TagStatutDemarche from 'components/action/TagStatutDemarche'
import EmptyState from 'components/EmptyState'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import { TagCategorie } from 'components/ui/Indicateurs/Tag'
import SpinningLoader from 'components/ui/SpinningLoader'
import Table from 'components/ui/Table/Table'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import { TH } from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import { BaseBeneficiaire, Demarche } from 'interfaces/beneficiaire'
import { StatutDemarche } from 'interfaces/json/beneficiaire'
import { compareDates, compareDatesDesc, toLongMonthDate } from 'utils/date'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { StatutAction } from 'interfaces/action'
import propsStatutsActions from 'components/action/propsStatutsActions'
import propsStatutsDemarches from 'components/action/propsStatutsDemarches'
import SortIcon from 'components/ui/SortIcon'
import { TRI } from 'components/action/OngletActions'
import { DateTime } from 'luxon'

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
  const filtresStatutRef = useRef<HTMLButtonElement>(null)
  const [filtreStatut, setFiltreStatut] = useState<StatutDemarche[]>()
  const [demarchesAffichees, setDemarchesAffichees] =
    useState<Demarche[]>(demarches)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [tri, setTri] = useState<TRI>(TRI.dateEcheanceDecroissante)

  const stateChanged = useRef<boolean>(false)

  function filtrerDemarchesParStatuts(statutsSelectionnes: StatutDemarche[]) {
    setFiltreStatut(statutsSelectionnes)
    filtresStatutRef.current!.focus()
    stateChanged.current = true
  }

  function trierParDateEcheance() {
    let nouveauTri: TRI = TRI.dateEcheanceDecroissante
    if (getIsSortedByDateEcheance() && getIsSortedDesc()) {
      nouveauTri = TRI.dateEcheanceCroissante
    }
    setTri(nouveauTri)
    stateChanged.current = true
  }

  function getOrdreTriParDate() {
    return `Trier les démarches ordre ${
      getIsSortedDesc() ? 'antéchronologique' : 'chronologique'
    }`
  }

  function getIsSortedByDateEcheance(): boolean {
    return (
      tri === TRI.dateEcheanceCroissante || tri === TRI.dateEcheanceDecroissante
    )
  }

  function getIsSortedDesc(): boolean {
    return tri === TRI.dateEcheanceDecroissante || tri === TRI.dateDecroissante
  }

  useEffect(() => {
    if (stateChanged.current) {
      setIsLoading(true)
      const demarchesFiltreesParStatut = filtreStatut
        ? demarches.filter((demarche) =>
            filtreStatut?.includes(demarche.statut)
          )
        : demarches
      const demarchesTriee = demarchesFiltreesParStatut.sort(
        (demarche1, demarche2) => {
          const dateFin1 = DateTime.fromISO(demarche1.dateFin)
          const dateFin2 = DateTime.fromISO(demarche2.dateFin)
          return tri === TRI.dateEcheanceCroissante
            ? compareDates(dateFin1, dateFin2)
            : compareDatesDesc(dateFin1, dateFin2)
        }
      )

      setDemarchesAffichees(demarchesTriee)

      setIsLoading(false)
    }
  }, [tri, filtreStatut])

  return (
    <>
      {isLoading && <SpinningLoader alert={true} />}

      {!isLoading && demarchesAffichees.length > 0 && (
        <Table
          caption={{
            text: `Liste des démarches de ${beneficiaire.prenom} ${beneficiaire.nom}`,
          }}
        >
          <thead>
            <TR isHeader={true}>
              <TH>Titre de la démarche</TH>
              <TH estCliquable={true}>
                <button
                  onClick={trierParDateEcheance}
                  aria-label={`Date de l’action - ${getOrdreTriParDate()}`}
                  title={getOrdreTriParDate()}
                  className='flex items-center w-full h-full p-4'
                  type='button'
                >
                  Date d’échéance
                  <SortIcon
                    isSorted={getIsSortedByDateEcheance()}
                    isDesc={getIsSortedDesc()}
                  />
                </button>
              </TH>
              <TH>Catégorie</TH>
              <TH estCliquable={true}>
                <FiltresStatuts
                  ref={filtresStatutRef}
                  defaultValue={filtreStatut}
                  onFiltres={filtrerDemarchesParStatuts}
                  statuts={Object.keys(StatutDemarche)}
                  entites='démarches'
                  propsStatuts={propsStatutsDemarches}
                />
              </TH>
              <TH>Voir le détail</TH>
            </TR>
          </thead>

          <tbody>
            {demarchesAffichees.map((demarche: Demarche, key) => (
              <DemarcheRow
                demarche={demarche}
                beneficiaireId={beneficiaire.id}
                key={key}
              />
            ))}
          </tbody>
        </Table>
      )}
    </>
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
