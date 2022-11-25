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
import { Evenement, StatutAnimationCollective } from 'interfaces/evenement'
import { BaseJeune, getNomJeuneComplet } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { EvenementsService } from 'services/evenements.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

interface ClotureProps extends PageProps {
  returnTo: string
  evenement: Evenement
  withoutChat: true
}

function Cloture({ returnTo, evenement }: ClotureProps) {
  const router = useRouter()
  const evenementsService =
    useDependance<EvenementsService>('evenementsService')

  const [idsSelectionnes, setIdsSelectionnes] = useState<string[]>([])

  function selectionnerBeneficiaire(jeune: BaseJeune) {
    if (idsSelectionnes.includes(jeune.id)) {
      setIdsSelectionnes(idsSelectionnes.filter((id) => id !== jeune.id))
    } else {
      setIdsSelectionnes(idsSelectionnes.concat(jeune.id))
    }
  }

  function selectionnerTousLesBeneficiaires(_event: FormEvent) {
    if (idsSelectionnes.length !== evenement.jeunes.length) {
      setIdsSelectionnes(evenement.jeunes.map((jeune) => jeune.id))
    } else {
      setIdsSelectionnes([])
    }
  }

  async function cloreAnimationCollective(event: FormEvent) {
    event.preventDefault()

    await evenementsService.cloreAnimationCollective(
      evenement.id,
      idsSelectionnes
    )

    await router.push(
      `${returnTo}&${QueryParam.clotureAC}=${QueryValue.succes}`
    )
  }

  return (
    <>
      <h2 className='text-m-bold'>Présence des bénéficiaires</h2>
      <p className='mt-6'>
        Vous devez valider la présence des bénéficiaires à l’animation
        collective en cochant dans la liste le nom des bénéficiaires
      </p>
      <div className='mt-6'>
        <InformationMessage content='La liste suivante se base sur les participants inscrits. Veuillez vous assurer de son exactitude.' />
      </div>

      <form onSubmit={cloreAnimationCollective} className='mt-6'>
        <Table caption='Bénéficiaires de l’animation collective'>
          <THead>
            <TR isHeader={true}>
              <TH>Présence</TH>
              <TH>Bénéficiaires ({evenement.jeunes.length})</TH>
            </TR>
          </THead>
          <TBody>
            <TR onClick={(e) => selectionnerTousLesBeneficiaires(e)}>
              <TD>
                <input
                  id='cloture-tout-selectionner'
                  type='checkbox'
                  checked={idsSelectionnes.length === evenement.jeunes.length}
                  title='Tout sélectionner'
                  onChange={() => false}
                />
              </TD>
              <TD>
                <label
                  htmlFor='cloture-tout-selectionner'
                  onClick={(e) => e.stopPropagation()}
                >
                  Tout sélectionner
                </label>
              </TD>
            </TR>
          </TBody>
          <TBody>
            {evenement.jeunes.map((jeune: BaseJeune) => (
              <TR
                key={jeune.id}
                onClick={() => selectionnerBeneficiaire(jeune)}
              >
                <TD>
                  <input
                    type='checkbox'
                    id={'checkbox-' + jeune.id}
                    checked={idsSelectionnes.includes(jeune.id)}
                    title={'Sélectionner ' + getNomJeuneComplet(jeune)}
                    onChange={() => false}
                  />
                </TD>
                <TD>
                  <label
                    htmlFor={'checkbox-' + jeune.id}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {getNomJeuneComplet(jeune)}
                  </label>
                </TD>
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

  const evenementsService =
    withDependance<EvenementsService>('evenementsService')

  const evenement = await evenementsService.getDetailsEvenement(
    context.query.evenement_id as string,
    accessToken
  )
  if (evenement?.statut !== StatutAnimationCollective.AClore)
    return { notFound: true }

  const props: ClotureProps = {
    evenement,
    returnTo: `/mes-jeunes/edition-rdv?idRdv=${evenement.id}&redirectUrl=${context.query.redirectUrl}`,
    pageTitle: 'Clore - Mes événements',
    pageHeader: 'Clôture de l’événement',
    withoutChat: true,
  }

  return { props }
}

export default withTransaction(Cloture.name, 'page')(Cloture)
