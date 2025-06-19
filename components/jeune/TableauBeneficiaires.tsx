import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react'

import FiltresDispositifs from 'components/action/FiltresDispositifs'
import EmptyState from 'components/EmptyState'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import SortIcon from 'components/ui/SortIcon'
import Pagination from 'components/ui/Table/Pagination'
import Table from 'components/ui/Table/Table'
import {
  BeneficiaireAvecInfosComplementaires,
  CompteurHeuresPortefeuille,
} from 'interfaces/beneficiaire'
import { estMilo } from 'interfaces/structure'
import { getComptageHeuresPortefeuille } from 'services/beneficiaires.service'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toShortDate } from 'utils/date'

const TableauBeneficiairesMilo = dynamic(
  () => import('components/jeune/TableauBeneficiairesMilo')
)
const TableauBeneficiairesPasMilo = dynamic(
  () => import('components/jeune/TableauBeneficiairesPasMilo')
)

type TableauBeneficiairesProps = {
  beneficiaires: BeneficiaireAvecInfosComplementaires[]
  total: number
  pageInitiale: number
}

function TableauBeneficiaires(
  { beneficiaires, total, pageInitiale }: TableauBeneficiairesProps,
  ref: ForwardedRef<HTMLTableElement>
) {
  const [conseiller] = useConseiller()
  const router = useRouter()

  const nombrePages = Math.ceil(beneficiaires.length / 10)
  const [page, setPage] = useState<number>(pageInitiale)

  const DEBUT_PERIODE = DateTime.now().startOf('week')
  const FIN_PERIODE = DateTime.now().endOf('week')

  const filtresDispositifsRef = useRef<HTMLButtonElement>(null)
  const [filtreDispositif, setFiltreDispositif] = useState<string>()
  const [triActif, setTriActif] = useState<{
    type: 'nom' | 'heures' | 'activite'
    ordreCroissant: boolean
  }>({ type: 'nom', ordreCroissant: true })
  const afficherFiltres =
    estMilo(conseiller.structure) &&
    beneficiaires.some(
      (beneficiaire) => beneficiaire.dispositif !== beneficiaires[0].dispositif
    )

  const [beneficiairesFiltres, setBeneficiairesFiltres] = useState<
    BeneficiaireAvecInfosComplementaires[]
  >(trierParNom(beneficiaires, true))
  const [beneficiairesTries, setBeneficiairesTries] = useState<
    BeneficiaireAvecInfosComplementaires[]
  >(trierParNom(beneficiaires, true))

  const [comptagesHeuresMilo, setComptagesHeuresMilo] =
    useState<CompteurHeuresPortefeuille | null>(null)

  function handleFiltreDispositif(dispositif?: string) {
    setFiltreDispositif(dispositif)
    filtresDispositifsRef.current!.focus()
  }

  function handleTriNom() {
    setTriActif({
      type: 'nom',
      ordreCroissant: triActif.type === 'nom' ? !triActif.ordreCroissant : true,
    })
  }

  function handleTriHeuresDeclarees() {
    setTriActif({
      type: 'heures',
      ordreCroissant:
        triActif.type === 'heures' ? !triActif.ordreCroissant : true,
    })
  }

  function handleTriActivite() {
    setTriActif({
      type: 'activite',
      ordreCroissant:
        triActif.type === 'activite' ? !triActif.ordreCroissant : false,
    })
  }

  function changePage(nouvellePage: number) {
    router.replace(`?page=${nouvellePage}`, { scroll: false })
    setPage(nouvellePage)
  }

  function filtrerParDispositifs(
    beneficiairesAFiltrer: BeneficiaireAvecInfosComplementaires[],
    dispositifAFiltrer?: string
  ) {
    if (!dispositifAFiltrer) return beneficiairesAFiltrer
    return beneficiairesAFiltrer.filter(
      ({ dispositif }) => dispositif === dispositifAFiltrer
    )
  }

  function trierParNom(
    beneficiairesATrier: BeneficiaireAvecInfosComplementaires[],
    ordreAlphabetique: boolean
  ): BeneficiaireAvecInfosComplementaires[] {
    return [...beneficiairesATrier].sort((a, b) => {
      const diff = a.nom.localeCompare(b.nom)
      return ordreAlphabetique ? diff : -diff
    })
  }

  function trierParHeures(
    beneficiairesATrier: BeneficiaireAvecInfosComplementaires[],
    ordreCroissant: boolean
  ): BeneficiaireAvecInfosComplementaires[] {
    return [...beneficiairesATrier].sort((a, b) => {
      const heuresA =
        comptagesHeuresMilo?.comptages?.find(
          (compteur) => a.id === compteur.idBeneficiaire
        )?.nbHeuresDeclarees ?? 0

      const heuresB =
        comptagesHeuresMilo?.comptages?.find(
          (compteur) => b.id === compteur.idBeneficiaire
        )?.nbHeuresDeclarees ?? 0

      const diff = heuresA - heuresB
      return ordreCroissant ? diff : -diff
    })
  }

  function trierParDerniereActivite(
    beneficiairesATrier: BeneficiaireAvecInfosComplementaires[],
    ordreChronologique: boolean
  ): BeneficiaireAvecInfosComplementaires[] {
    return [...beneficiairesATrier].sort((a, b) => {
      if (!a.lastActivity) return 1
      if (!b.lastActivity) return -1

      const dateA = DateTime.fromISO(a.lastActivity)
      const dateB = DateTime.fromISO(b.lastActivity)
      const diff = dateA.toMillis() - dateB.toMillis()
      return ordreChronologique ? diff : -diff
    })
  }

  async function recupererHeuresDeclarees() {
    return getComptageHeuresPortefeuille(conseiller.id)
  }

  useEffect(() => {
    setPage(page)
  }, [beneficiaires])

  useEffect(() => {
    setBeneficiairesFiltres(
      filtrerParDispositifs(beneficiaires, filtreDispositif)
    )
  }, [beneficiaires, filtreDispositif])

  useEffect(() => {
    if (triActif.type === 'nom') {
      setBeneficiairesTries(
        trierParNom(beneficiairesFiltres, triActif.ordreCroissant)
      )
    } else if (triActif.type === 'heures') {
      setBeneficiairesTries(
        trierParHeures(beneficiairesFiltres, triActif.ordreCroissant)
      )
    } else if (triActif.type === 'activite') {
      setBeneficiairesTries(
        trierParDerniereActivite(beneficiairesFiltres, triActif.ordreCroissant)
      )
    }
  }, [beneficiairesFiltres, triActif])

  useEffect(() => {
    if (estMilo(conseiller.structure)) {
      recupererHeuresDeclarees().then((nouveauComptage) => {
        setComptagesHeuresMilo(nouveauComptage ?? null)
      })
    }
  }, [])

  return (
    <>
      {beneficiaires.length === 0 && (
        <EmptyState
          shouldFocus={true}
          illustrationName={IllustrationName.People}
          titre='Aucun bénéficiaire trouvé.'
          sousTitre='Recommencez ou modifiez votre recherche.'
        />
      )}

      {beneficiaires.length > 0 && (
        <>
          <h2 className='text-m-bold mb-2 text-center text-grey-800'>
            Semaine du {toShortDate(DEBUT_PERIODE)} au{' '}
            {toShortDate(FIN_PERIODE)}
          </h2>

          <div className='my-4 flex justify-end gap-6'>
            {afficherFiltres && (
              <FiltresDispositifs
                ref={filtresDispositifsRef}
                defaultValue={filtreDispositif}
                dispositifs={['CEJ', 'PACEA']}
                onFiltres={handleFiltreDispositif}
                className='grow'
              />
            )}

            <button
              onClick={handleTriNom}
              className='flex text-s-regular'
              title={
                triActif.type === 'nom' && triActif.ordreCroissant
                  ? 'Trier par nom ordre alphabétique'
                  : 'Trier par nom ordre alphabétique inversé'
              }
              aria-label={
                triActif.type === 'nom' && triActif.ordreCroissant
                  ? 'Trier par nom ordre alphabétique'
                  : 'Trier par nom ordre alphabétique inversé'
              }
              type='button'
            >
              Trier par nom
              <SortIcon
                isSorted={triActif.type === 'nom'}
                isDesc={!triActif.ordreCroissant}
              />
            </button>

            <button
              onClick={handleTriHeuresDeclarees}
              className='flex text-s-regular'
              title={
                triActif.type === 'heures' && triActif.ordreCroissant
                  ? 'Trier par heures ordre alphabétique'
                  : 'Trier par heures ordre alphabétique inversé'
              }
              aria-label={
                triActif.type === 'heures' && triActif.ordreCroissant
                  ? 'Trier par heures ordre alphabétique'
                  : 'Trier par heures ordre alphabétique inversé'
              }
              type='button'
            >
              Trier par heures déclarées
              <SortIcon
                isSorted={triActif.type === 'heures'}
                isDesc={!triActif.ordreCroissant}
              />
            </button>

            <button
              onClick={handleTriActivite}
              className='flex text-s-regular'
              title={
                triActif.type === 'activite' && triActif.ordreCroissant
                  ? 'Trier par dernière activité ordre antichronologique'
                  : 'Trier par dernière activité ordre chronologique'
              }
              aria-label={
                triActif.type === 'activite' && triActif.ordreCroissant
                  ? 'Trier par dernière activité ordre antichronologique'
                  : 'Trier par dernière activité ordre chronologique'
              }
              type='button'
            >
              Trier par dernière activité
              <SortIcon
                isSorted={triActif.type === 'activite'}
                isDesc={!triActif.ordreCroissant}
              />
            </button>
          </div>

          <Table
            ref={ref}
            caption={{
              text: 'Liste des bénéficiaires',
              count: total === beneficiaires.length ? total : undefined,
              visible: true,
            }}
          >
            {estMilo(conseiller.structure) && (
              <TableauBeneficiairesMilo
                beneficiaires={beneficiairesTries}
                comptagesHeures={comptagesHeuresMilo}
                page={page}
                total={total}
              />
            )}

            {!estMilo(conseiller.structure) && (
              <TableauBeneficiairesPasMilo
                beneficiaires={beneficiairesTries}
                page={page}
                total={total}
              />
            )}
          </Table>

          {nombrePages > 1 && (
            <Pagination
              pageCourante={page}
              nombreDePages={nombrePages}
              allerALaPage={changePage}
            />
          )}
        </>
      )}
    </>
  )
}

export default forwardRef(TableauBeneficiaires)
