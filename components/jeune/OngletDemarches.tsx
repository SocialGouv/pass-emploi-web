import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import FiltresCategories, {
  Categorie,
} from 'components/action/FiltresCategories'
import FiltresStatuts from 'components/action/FiltresStatuts'
import propsStatutsDemarches from 'components/action/propsStatutsDemarches'
import TagStatutDemarche from 'components/action/TagStatutDemarche'
import EmptyState from 'components/EmptyState'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { TagCategorie } from 'components/ui/Indicateurs/Tag'
import SortIcon from 'components/ui/SortIcon'
import SpinningLoader from 'components/ui/SpinningLoader'
import Table from 'components/ui/Table/Table'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import { TH } from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import { Demarche, IdentiteBeneficiaire } from 'interfaces/beneficiaire'
import { StatutDemarche } from 'interfaces/json/beneficiaire'
import { compareDates, compareDatesDesc, toLongMonthDate } from 'utils/date'

export enum TRI {
  dateEcheanceDecroissante = 'date_echeance_decroissante',
  dateEcheanceCroissante = 'date_echeance_croissante',
}

interface OngletDemarchesProps {
  demarches: { data: Demarche[]; isStale: boolean } | null
  jeune: IdentiteBeneficiaire
}

export default function OngletDemarches({
  demarches,
  jeune,
}: OngletDemarchesProps) {
  return (
    <>
      {!demarches && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyState
            illustrationName={IllustrationName.Checklist}
            titre={`Impossible de récupérer les démarches de ${jeune.prenom} ${jeune.nom}.`}
          />
        </div>
      )}

      {demarches?.data.length === 0 && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyState
            illustrationName={IllustrationName.Checklist}
            titre={`Aucune démarche pour ${jeune.prenom} ${jeune.nom}.`}
          />
        </div>
      )}

      {demarches?.data && demarches.data.length > 0 && (
        <TableauDemarche demarches={demarches.data} beneficiaire={jeune} />
      )}
    </>
  )
}

function TableauDemarche({
  demarches,
  beneficiaire,
}: {
  demarches: Demarche[]
  beneficiaire: IdentiteBeneficiaire
}) {
  const listeDemarchesRef = useRef<HTMLTableElement>(null)
  const filtresStatutRef = useRef<HTMLButtonElement>(null)
  const filtresCategoriesRef = useRef<HTMLButtonElement>(null)

  const [aReinitialiseLesFiltres, setAReinitialiseLesFiltres] =
    useState<boolean>(false)
  const [filtreStatut, setFiltreStatut] = useState<string[]>([])
  const [filtreCategories, setFiltreCategories] = useState<Categorie[]>([])
  const [demarchesAffichees, setDemarchesAffichees] =
    useState<Demarche[]>(demarches)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [tri, setTri] = useState<TRI>(TRI.dateEcheanceDecroissante)

  const categories: Categorie[] = genererCategories()

  function genererCategories() {
    const categoriesLabels = Array.from(
      new Set(demarches.map((demarche) => demarche.label))
    )

    return categoriesLabels.map((categorie) => ({
      code: categorieCodeToId(categorie),
      label: categorie,
    }))
  }

  function categorieCodeToId(label: string) {
    return label
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]/g, '')
  }

  function filtrerDemarchesParCategorie(categoriesSelectionnees: Categorie[]) {
    setFiltreCategories(categoriesSelectionnees)
    filtresCategoriesRef.current!.focus()
  }

  function filtrerDemarchesParStatuts(statutsSelectionnes: string[]) {
    setFiltreStatut(statutsSelectionnes)
    filtresStatutRef.current!.focus()
  }

  function trierParDateEcheance() {
    const nouveauTri = getIsSortedDesc()
      ? TRI.dateEcheanceCroissante
      : TRI.dateEcheanceDecroissante
    setTri(nouveauTri)
  }

  function getOrdreTriParDate() {
    return `Trier les démarches dans l’ordre ${
      getIsSortedDesc() ? 'antéchronologique' : 'chronologique'
    }`
  }

  function getIsSortedDesc(): boolean {
    return tri === TRI.dateEcheanceDecroissante
  }

  function reinitialiserFiltres() {
    setFiltreCategories([])
    setFiltreStatut([])
    setAReinitialiseLesFiltres(true)
  }

  useEffect(() => {
    setIsLoading(true)

    const labelsCategoriesSelectionnees = filtreCategories
      .map((categorieSelectionnee) => categorieSelectionnee.label)
      .filter((e) => e !== undefined)

    const demarchesFiltreesParCategorie =
      filtreCategories.length > 0
        ? demarches.filter((demarche) =>
            labelsCategoriesSelectionnees.includes(demarche.label)
          )
        : demarches
    const demarchesFiltreesParStatut =
      filtreStatut.length > 0
        ? demarchesFiltreesParCategorie.filter((demarche) =>
            filtreStatut.includes(demarche.statut)
          )
        : demarchesFiltreesParCategorie

    const demarchesTrieesEtFiltrees = [...demarchesFiltreesParStatut].sort(
      (demarche1, demarche2) => {
        const dateFin1 = DateTime.fromISO(demarche1.dateFin)
        const dateFin2 = DateTime.fromISO(demarche2.dateFin)
        return tri === TRI.dateEcheanceCroissante
          ? compareDates(dateFin1, dateFin2)
          : compareDatesDesc(dateFin1, dateFin2)
      }
    )

    setDemarchesAffichees(demarchesTrieesEtFiltrees)

    setIsLoading(false)
  }, [tri, filtreStatut, filtreCategories])

  useEffect(() => {
    if (aReinitialiseLesFiltres && demarchesAffichees.length) {
      listeDemarchesRef.current!.focus()
      setAReinitialiseLesFiltres(false)
    }
  }, [aReinitialiseLesFiltres, demarchesAffichees])

  return (
    <>
      {isLoading && <SpinningLoader alert={true} />}

      {!isLoading && demarchesAffichees.length === 0 && (
        <div className='flex flex-col justify-center'>
          <EmptyState
            shouldFocus={true}
            illustrationName={IllustrationName.Search}
            titre='Aucun résultat.'
            sousTitre='Modifiez vos filtres.'
          />
          <Button
            type='button'
            style={ButtonStyle.PRIMARY}
            onClick={reinitialiserFiltres}
            className='mx-auto mt-8'
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}

      {!isLoading && demarchesAffichees.length > 0 && (
        <Table
          ref={listeDemarchesRef}
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
                  <SortIcon isDesc={getIsSortedDesc()} />
                </button>
              </TH>
              <TH estCliquable={true}>
                <FiltresCategories
                  ref={filtresCategoriesRef}
                  categories={categories}
                  defaultValue={filtreCategories}
                  entites='démarches'
                  onFiltres={filtrerDemarchesParCategorie}
                />
              </TH>
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
          {demarche.titre}
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
        labelPrefix='Voir le détail de la démarche'
      />
    </TR>
  )
}
