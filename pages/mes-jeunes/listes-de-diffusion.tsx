import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { PageProps } from 'interfaces/pageProps'
import { ListesDeDiffusionService } from 'services/listes-de-diffusion.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

type ListesDiffusionProps = PageProps & {
  listesDiffusion: ListeDeDiffusion[]
}

function ListesDiffusion({ listesDiffusion }: ListesDiffusionProps) {
  function getTitre(liste: ListeDeDiffusion) {
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
    return liste.titre
  }

  return (
    <>
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
        >
          <THead>
            <TR isHeader={true}>
              <TH>Nom de la liste</TH>
              <TH>Nombre de destinataires</TH>
            </TR>
          </THead>
          <TBody>
            {listesDiffusion.map((liste) => (
              <TR key={liste.id}>
                <TD>{getTitre(liste)}</TD>
                <TD>{liste.beneficiaires.length} destinataire(s)</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  )
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
