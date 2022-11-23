import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { StructureConseiller } from 'interfaces/conseiller'
import { Evenement } from 'interfaces/evenement'
import { BaseJeune, getNomJeuneComplet } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { EvenementsService } from 'services/evenements.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'
import { parseUrl, setQueryParams } from 'utils/urlParser'

interface ClotureProps extends PageProps {
  returnTo: string
  evenement: Evenement
}

function Cloture({ returnTo, evenement }: ClotureProps) {
  const router = useRouter()
  const evenementsService =
    useDependance<EvenementsService>('evenementsService')

  const [idsJeunesSelected, setIdsJeunesSelected] = useState<string[]>([])

  function selectionnerJeune(_event: FormEvent, jeune: BaseJeune) {
    if (idsJeunesSelected.includes(jeune.id)) {
      setIdsJeunesSelected(idsJeunesSelected.filter((id) => id !== jeune.id))
    } else {
      setIdsJeunesSelected(idsJeunesSelected.concat(jeune.id))
    }
  }

  function selectionnerTousLesJeunes(_event: FormEvent) {
    if (idsJeunesSelected.length !== evenement.jeunes.length) {
      setIdsJeunesSelected(evenement.jeunes.map((jeune) => jeune.id))
    } else {
      setIdsJeunesSelected([])
    }
  }

  async function handleCloture(_event: FormEvent) {
    await evenementsService.cloreAnimationCollective(
      evenement.id,
      idsJeunesSelected
    )

    const { pathname, query } = parseUrl('/agenda')
    const queryParam = QueryParam.clotureAC
    await router.push({
      pathname,
      query: setQueryParams(query, { [queryParam]: QueryValue.succes }),
    })
  }

  return (
    <>
      <h2 className='text-m-bold'>Présence des bénéficiaires</h2>
      <p className='mt-6'>
        Vous devez valider la présence des bénéficiaires à l’animation
        collective en sélectionnant dans la liste
      </p>
      <div className='mt-6'>
        <InformationMessage content='La liste suivante se base sur les participants inscrits. Veuillez vous assurer de son exactitude.' />
      </div>

      <form onSubmit={handleCloture} className='mt-6'>
        <Table caption='Jeunes de l’animation collective'>
          <THead>
            <TR isHeader={true}>
              <TH>Présence</TH>
              <TH>Bénéficiaires ({evenement.jeunes.length})</TH>
            </TR>
          </THead>
          <TBody>
            <TR onClick={(e) => selectionnerTousLesJeunes(e)}>
              <TD>
                <input
                  id='cloture-tout-selectionner'
                  type='checkbox'
                  checked={idsJeunesSelected.length === evenement.jeunes.length}
                  readOnly={true}
                  title='Tout sélectionner'
                />
              </TD>
              <TD>
                <label htmlFor='cloture-tout-selectionner'>
                  Tout sélectionner
                </label>
              </TD>
            </TR>
          </TBody>
          <TBody>
            {evenement.jeunes.map((jeune: BaseJeune) => (
              <TR key={jeune.id} onClick={(e) => selectionnerJeune(e, jeune)}>
                <TD>
                  <input
                    type='checkbox'
                    checked={idsJeunesSelected.includes(jeune.id)}
                    readOnly={true}
                  />
                </TD>
                <TD>{getNomJeuneComplet(jeune)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>

        <div className='flex justify-center mt-10 p-4'>
          <ButtonLink
            href={returnTo}
            style={ButtonStyle.SECONDARY}
            className='mr-3'
          >
            Annuler
          </ButtonLink>

          <Button type='submit'>
            <IconComponent
              name={IconName.RoundedCheck}
              focusable={false}
              aria-hidden={true}
              className='mr-2 w-4 h-4'
            />
            Clore
          </Button>
        </div>
      </form>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<ClotureProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  if (user.structure === StructureConseiller.POLE_EMPLOI)
    return {
      redirect: { destination: '/mes-jeunes', permanent: false },
    }

  const rendezVousService =
    withDependance<EvenementsService>('evenementsService')

  const idEvenement = context.query.evenement_id as string

  const evenement = await rendezVousService.getDetailsEvenement(
    idEvenement,
    accessToken
  )
  if (!evenement) return { notFound: true }

  const referer = context.req.headers.referer ?? '/agenda?onglet=etablissement'
  const returnTo = referer && !comingFromHome(referer) ? referer : '/mes-jeunes'

  const props: ClotureProps = {
    evenement,
    returnTo,
    pageTitle: 'Mes événements - Clore',
    pageHeader: 'Clore l’animation collective',
  }

  return { props }
}

export default withTransaction(Cloture.name, 'page')(Cloture)

function comingFromHome(referer: string): boolean {
  return referer.split('?')[0].endsWith('/index')
}
