import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useEffect, useState } from 'react'

import EmptyState from 'components/EmptyState'
import PageActionsPortal from 'components/PageActionsPortal'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import SortIcon from 'components/ui/SortIcon'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import { trackEvent } from 'utils/analytics/matomo'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

type ListesDiffusionProps = PageProps & {
  listesDiffusion: ListeDeDiffusion[]
}

function ListesDiffusion({ listesDiffusion }: ListesDiffusionProps) {
  const [conseiller] = useConseiller()
  const [alerte] = useAlerte()
  const [portefeuille] = usePortefeuille()

  const ALPHABETIQUE = 'ASC'
  const INVERSE = 'DESC'
  const [listeTriees, setListesTriees] = useState(listesDiffusion)
  const [tri, setTri] = useState<typeof ALPHABETIQUE | typeof INVERSE>(
    ALPHABETIQUE
  )

  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  function inverserTri() {
    const nouvelOrdre = tri === ALPHABETIQUE ? INVERSE : ALPHABETIQUE
    setTri(nouvelOrdre)
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Listes de diffusion',
      action: 'Tri',
      nom: nouvelOrdre,
      avecBeneficiaires: aDesBeneficiaires,
    })
  }

  useEffect(() => {
    setListesTriees((listes) => {
      const ordre = tri === ALPHABETIQUE ? 1 : -1
      return [...listes].sort(
        (liste1, liste2) => liste1.titre.localeCompare(liste2.titre) * ordre
      )
    })
  }, [tri])

  let tracking = 'Listes diffusion'
  if (alerte?.key === AlerteParam.creationListeDiffusion)
    tracking += ' - Creation succès'
  if (alerte?.key === AlerteParam.modificationListeDiffusion)
    tracking += ' - Modification succès'
  if (alerte?.key === AlerteParam.suppressionListeDiffusion)
    tracking += ' - Suppression succès'
  useMatomo(tracking, aDesBeneficiaires)

  return (
    <>
      <PageActionsPortal>
        <ButtonLink href='/mes-jeunes/listes-de-diffusion/edition-liste'>
          <IconComponent
            name={IconName.Add}
            focusable={false}
            aria-hidden={true}
            className='mr-2 w-4 h-4'
          />
          Créer une liste
        </ButtonLink>
      </PageActionsPortal>

      {listesDiffusion.length === 0 && (
        <div
          className='mx-auto my-0 flex flex-col items-center'
          data-testid='empty-state-liste-de-diffusion'
        >
          <EmptyState
            illustrationName={IllustrationName.Send}
            titre='Vous n’avez pas encore créé de liste de diffusion.'
            sousTitre='Envoyez des messages à plusieurs bénéficiaires à la fois grâce aux listes de diffusion.'
            premierLien={{
              href: '/mes-jeunes/listes-de-diffusion/edition-liste',
              label: 'Créer une liste',
              iconName: IconName.Add,
            }}
          />
        </div>
      )}

      {listesDiffusion.length > 0 && (
        <Table
          caption={{
            text: 'Listes',
            count: listesDiffusion.length,
            visible: true,
          }}
          asDiv={true}
        >
          <THead>
            <TR isHeader={true}>
              <TH
                className='rounded-l hover:bg-primary_lighten'
                estCliquable={true}
              >
                <button
                  className='flex border-none items-center w-full h-full p-4'
                  onClick={inverserTri}
                  aria-label={`Trier les listes de diffusion par ordre alphabétique ${
                    tri === ALPHABETIQUE ? 'inversé' : ''
                  }`}
                  title={`Trier les listes de diffusion par ordre alphabétique ${
                    tri === ALPHABETIQUE ? 'inversé' : ''
                  }`}
                >
                  <span className='mr-1'>Nom de la liste</span>
                  <SortIcon isDesc={tri === INVERSE} />
                </button>
              </TH>
              <TH>Nombre de destinataires</TH>
            </TR>
          </THead>
          <TBody>
            {listeTriees.map((liste) => (
              <TR
                key={liste.id}
                href={`/mes-jeunes/listes-de-diffusion/edition-liste?idListe=${liste.id}`}
                label={`Consulter la liste ${liste.titre}`}
              >
                <TD>
                  <TitreListe liste={liste} />
                </TD>
                <TD>{liste.beneficiaires.length} destinataire(s)</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  )
}

function TitreListe({ liste }: { liste: ListeDeDiffusion }): JSX.Element {
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
          aria-label={informationLabel}
          title={informationLabel}
          className='w-6 h-6 mr-2 fill-[currentColor]'
        />
        {liste.titre}
      </div>
    )
  }

  return <>{liste.titre}</>
}

export const getServerSideProps: GetServerSideProps<
  ListesDiffusionProps
> = async (context) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }
  const { user, accessToken } = sessionOrRedirect.session

  const { getListesDeDiffusionServerSide } = await import(
    'services/listes-de-diffusion.service'
  )
  const listesDeDiffusion = await getListesDeDiffusionServerSide(
    user.id,
    accessToken
  )
  return {
    props: {
      pageTitle: 'Listes de diffusion - Portefeuille',
      pageHeader: 'Mes listes de diffusion',
      listesDiffusion: listesDeDiffusion,
    },
  }
}

export default withTransaction(ListesDiffusion.name, 'page')(ListesDiffusion)
