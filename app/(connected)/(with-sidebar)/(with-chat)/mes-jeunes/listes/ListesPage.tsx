'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React, { ReactElement, useEffect, useState } from 'react'

import EmptyState from 'components/EmptyState'
import PageActionsPortal from 'components/PageActionsPortal'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import SortIcon from 'components/ui/SortIcon'
import Table from 'components/ui/Table/Table'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TH from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import { Liste } from 'interfaces/liste'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import { trackEvent } from 'utils/analytics/matomo'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

type ListesPageProps = {
  listes: Liste[]
}

function ListesPage({ listes }: ListesPageProps) {
  const [conseiller] = useConseiller()
  const [alerte] = useAlerte()
  const [portefeuille] = usePortefeuille()

  const ALPHABETIQUE = 'ASC'
  const INVERSE = 'DESC'
  const [listeTriees, setListesTriees] = useState(listes)
  const [tri, setTri] = useState<typeof ALPHABETIQUE | typeof INVERSE>(
    ALPHABETIQUE
  )

  const aDesBeneficiaires = portefeuille.length > 0

  function inverserTri() {
    const nouvelOrdre = tri === ALPHABETIQUE ? INVERSE : ALPHABETIQUE
    setTri(nouvelOrdre)
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Listes de diffusion',
      action: 'Tri',
      nom: nouvelOrdre,
      aDesBeneficiaires,
    })
  }

  useEffect(() => {
    setListesTriees((listeListes) => {
      const ordre = tri === ALPHABETIQUE ? 1 : -1
      return [...listeListes].sort(
        (liste1, liste2) => liste1.titre.localeCompare(liste2.titre) * ordre
      )
    })
  }, [tri])

  let tracking = 'Listes diffusion'
  if (alerte?.key === AlerteParam.creationListe)
    tracking += ' - Creation succès'
  if (alerte?.key === AlerteParam.modificationListe)
    tracking += ' - Modification succès'
  if (alerte?.key === AlerteParam.suppressionListe)
    tracking += ' - Suppression succès'
  useMatomo(tracking, aDesBeneficiaires)

  return (
    <>
      <PageActionsPortal>
        <ButtonLink href='/mes-jeunes/listes/edition-liste'>
          <IconComponent
            name={IconName.Add}
            focusable={false}
            aria-hidden={true}
            className='mr-2 w-4 h-4'
          />
          Créer une liste
        </ButtonLink>
      </PageActionsPortal>

      {listes.length === 0 && (
        <div
          className='mx-auto my-0 flex flex-col items-center'
          data-testid='empty-state-liste'
        >
          <EmptyState
            illustrationName={IllustrationName.Send}
            titre='Vous n’avez pas encore créé de liste.'
            sousTitre='Envoyez des messages à plusieurs bénéficiaires à la fois grâce aux listes.'
            lien={{
              href: '/mes-jeunes/listes/edition-liste',
              label: 'Créer une liste',
              iconName: IconName.Add,
            }}
          />
        </div>
      )}

      {listes.length > 0 && (
        <Table
          caption={{
            text: 'Listes',
            count: listes.length,
            visible: true,
          }}
        >
          <thead>
            <TR isHeader={true}>
              <TH estCliquable={true}>
                <button
                  className='flex border-none items-center w-full h-full p-4'
                  onClick={inverserTri}
                  aria-label={`Trier les listes par ordre alphabétique ${
                    tri === ALPHABETIQUE ? 'inversé' : ''
                  }`}
                  title={`Trier les listes par ordre alphabétique ${
                    tri === ALPHABETIQUE ? 'inversé' : ''
                  }`}
                >
                  <span className='mr-1'>Nom de la liste</span>
                  <SortIcon isDesc={tri === INVERSE} />
                </button>
              </TH>
              <TH>Nombre de destinataires</TH>
              <TH>Voir le détail</TH>
            </TR>
          </thead>
          <tbody>
            {listeTriees.map((liste) => (
              <TR key={liste.id}>
                <TD>
                  <TitreListe liste={liste} />
                </TD>
                <TD>{liste.beneficiaires.length} destinataire(s)</TD>
                <TDLink
                  href={`/mes-jeunes/listes/edition-liste?idListe=${liste.id}`}
                  labelPrefix='Consulter la liste'
                />
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}

function TitreListe({ liste }: { liste: Liste }): ReactElement {
  const informationLabel =
    'Un ou plusieurs bénéficiaires de cette liste ont été réaffectés temporairement.'

  if (
    liste.beneficiaires.some(
      ({ estDansLePortefeuille }) => !estDansLePortefeuille
    )
  ) {
    return (
      <div className='flex items-center text-primary'>
        <IconComponent
          name={IconName.Info}
          role='img'
          focusable={false}
          aria-labelledby='information-label'
          title={informationLabel}
          className='w-6 h-6 mr-2 fill-current'
        />
        <span id='information-label' className='sr-only'>
          {informationLabel}
        </span>
        {liste.titre}
      </div>
    )
  }

  return <>{liste.titre}</>
}

export default withTransaction(ListesPage.name, 'page')(ListesPage)
