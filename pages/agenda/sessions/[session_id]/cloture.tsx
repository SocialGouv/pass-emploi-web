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
import { estUserPoleEmploi } from 'interfaces/conseiller'
import { BaseJeune, getNomJeuneComplet } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { Session, StatutBeneficiaire } from 'interfaces/session'
import {
  getDetailsSession,
  InformationBeneficiaireSession,
} from 'services/sessions.service'
import { useAlerte } from 'utils/alerteContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'

type ClotureSessionProps = PageProps & {
  session: Session
  returnTo: string
  withoutChat: true
}

function ClotureSession({ returnTo, session }: ClotureSessionProps) {
  const router = useRouter()
  const [_, setAlerte] = useAlerte()
  const [conseiller] = useConseiller()

  const [idsSelectionnes, setIdsSelectionnes] = useState<string[]>([])
  const [statutsBeneficiaires, setStatutsBeneficiaires] = useState<string[]>([])
  const [statutBeneficiaire, setStatutBeneficiaire] = useState<string>()
  const [emargements, setEmargements] = useState<
    { idJeune: string; statut: string }[]
  >([])

  function selectionnerTousLesBeneficiaires(_event: FormEvent) {
    if (idsSelectionnes.length !== session.inscriptions.length) {
      setIdsSelectionnes(session.inscriptions.map((jeune) => jeune.idJeune))
    } else {
      setIdsSelectionnes([])
    }
  }

  async function cloreSession(event: FormEvent) {
    event.preventDefault()
    // const { cloreSession: _cloreSession } = await import(
    //   'services/sessions.service'
    // )
    //
    // await _cloreSession(conseiller.id, session.session.id, emargements)

    alert('ok')
    // setAlerte(AlerteParam.clotureAC)
    // await router.push(returnTo)
  }

  function updateStatutBeneficiaire(jeune) {
    switch (jeune.statut) {
      case StatutBeneficiaire.INSCRIT:
        return setStatutBeneficiaire('REFUS_JEUNE')
      case StatutBeneficiaire.REFUS_JEUNE:
      case StatutBeneficiaire.REFUS_TIERS:
        return setStatutBeneficiaire(jeune.statut)
    }
  }

  function selectionnerBeneficiaire(jeune) {
    if (idsSelectionnes.includes(jeune.idJeune)) {
      setIdsSelectionnes(idsSelectionnes.filter((id) => id !== jeune.idJeune))
    } else {
      setIdsSelectionnes(idsSelectionnes.concat(jeune.idJeune))
    }
  }
  console.log('inscriptions', session.inscriptions)

  return (
    <>
      <h2 className='text-m-bold'>Emarger la présence des bénéficiaires</h2>
      <p className='mt-6'>
        Vous devez valider la présence des bénéficiaires à la session en cochant
        dans la liste le nom des bénéficiaires
      </p>
      <div className='mt-6'>
        <InformationMessage label='La liste suivante se base sur les participants inscrits. Veuillez vous assurer de son exactitude.' />
      </div>
      <form onSubmit={cloreSession} className='mt-6'>
        <Table caption={{ text: 'Bénéficiaires de la session' }}>
          <THead>
            <TR isHeader={true}>
              <TH>
                {' '}
                <input
                  id='cloture-tout-selectionner'
                  type='checkbox'
                  checked={
                    idsSelectionnes.length === session.inscriptions.length
                  }
                  title='Tout sélectionner'
                  onChange={(e) => selectionnerTousLesBeneficiaires(e)}
                />
                <label
                  className='sr-only'
                  htmlFor='cloture-tout-selectionner'
                  onClick={(e) => e.stopPropagation()}
                >
                  Tout sélectionner
                </label>
                Présence des bénéficiaires
              </TH>
              <TH>Statut</TH>
            </TR>
          </THead>

          <TBody>
            {session.inscriptions.map((jeune) => (
              <TR
                key={jeune.idJeune}
                onClick={() => selectionnerBeneficiaire(jeune)}
              >
                <TD>
                  <input
                    type='checkbox'
                    name={'checkbox-' + jeune.idJeune}
                    id={'checkbox-' + jeune.idJeune}
                    checked={idsSelectionnes.includes(jeune.idJeune)}
                    title={'Sélectionner ' + getNomJeuneComplet(jeune)}
                    value={statutBeneficiaire}
                    onChange={(e) => {}}
                  />
                  <label
                    htmlFor={'checkbox-' + jeune.idJeune}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {jeune.prenom} {jeune.nom}
                  </label>
                </TD>
                <TD>
                  {jeune.statut} {statutBeneficiaire}
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
            Annuler la clôture
          </ButtonLink>

          <Button type='submit'>
            <IconComponent
              name={IconName.CheckCircleFill}
              focusable={false}
              aria-hidden={true}
              className='mr-2 w-4 h-4'
            />
            Clore la session
          </Button>
        </div>
      </form>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  ClotureSessionProps
> = async (context) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  if (estUserPoleEmploi(user))
    return {
      redirect: { destination: '/mes-jeunes', permanent: false },
    }

  const { getDetailsSession } = await import('services/sessions.service')
  const session = await getDetailsSession(
    user.id,
    context.query.session_id as string,
    accessToken
  )

  //TODO: Fix return to et ajouter redirectUrl
  return {
    props: {
      session,
      pageTitle: 'Clôture de la session - Sessions',
      pageHeader: 'Clôture de la session',
      withoutChat: true,
      returnTo: `/agenda/sessions/${session!.session.id}`,
    },
  }
}

export default withTransaction(ClotureSession.name, 'page')(ClotureSession)
