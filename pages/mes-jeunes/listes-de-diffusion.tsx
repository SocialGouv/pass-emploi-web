import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import { ListesDeDiffusionService } from 'services/listes-de-diffusion.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

type ListesDiffusionProps = PageProps & {
  listesDiffusion: ListeDeDiffusion[]
}

function ListesDiffusion({ listesDiffusion }: ListesDiffusionProps) {
  const [alerte] = useAlerte()

  let tracking = 'Listes diffusion'
  if (alerte?.key === AlerteParam.creationListeDiffusion) {
    tracking += ' - Creation succès'
  }
  if (alerte?.key === AlerteParam.modificationListeDiffusion) {
    tracking += ' - Modification succès'
  }

  useMatomo(tracking)

  return (
    <>
      <ButtonLink
        href='/mes-jeunes/listes-de-diffusion/edition-liste'
        className='w-fit mb-6'
      >
        <IconComponent
          name={IconName.Add}
          focusable={false}
          aria-hidden={true}
          className='mr-2 w-4 h-4'
        />
        Créer une liste
      </ButtonLink>

      {listesDiffusion.length === 0 && (
        <div className='mx-auto my-0 flex flex-col items-center'>
          <EmptyStateImage
            aria-hidden={true}
            focusable={false}
            className='w-[360px] h-[200px] mb-16'
          />
          <p className='text-base-bold mb-12'>
            Vous n’avez aucune liste de diffusion.
          </p>
        </div>
      )}

      {listesDiffusion.length > 0 && (
        <Table
          caption={{
            text: `Listes (${listesDiffusion.length})`,
            visible: true,
          }}
          asDiv={true}
        >
          <THead>
            <TR isHeader={true}>
              <TH>Nom de la liste</TH>
              <TH>Nombre de destinataires</TH>
            </TR>
          </THead>
          <TBody>
            {listesDiffusion.map((liste) => (
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
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }
  const listesDeDiffusionService = withDependance<ListesDeDiffusionService>(
    'listesDeDiffusionService'
  )
  const { user, accessToken } = sessionOrRedirect.session
  const listesDeDiffusion = await listesDeDiffusionService.getListesDeDiffusion(
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
