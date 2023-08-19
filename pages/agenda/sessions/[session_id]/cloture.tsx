import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { ChangeEvent, FormEvent, useState } from 'react'

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
import { StatutAnimationCollective } from 'interfaces/evenement'
import { PageProps } from 'interfaces/pageProps'
import {
  estAClore,
  InformationBeneficiaireSession,
  Session,
  StatutBeneficiaire,
} from 'interfaces/session'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import redirectedFromHome from 'utils/redirectedFromHome'

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
  const [emargements, setEmargements] = useState<
    Array<InformationBeneficiaireSession>
  >([])

  const [statutBeneficiaire, setStatutBeneficiaire] = useState<string>()

  const inscriptionsInitiales = session.inscriptions.map((inscription) => {
    return { idJeune: inscription.idJeune, statut: inscription.statut }
  })

  function cocherTousLesBeneficiaires(_event: FormEvent) {
    if (idsSelectionnes.length !== session.inscriptions.length) {
      setIdsSelectionnes(
        session.inscriptions.map((beneficiaire) => beneficiaire.idJeune)
      )
      setEmargements(
        inscriptionsInitiales.map((beneficiaire) => {
          return { ...beneficiaire, statut: 'PRESENT' }
        })
      )
    } else {
      setIdsSelectionnes([])
      setEmargements([])
    }
  }

  function modifierStatutBeneficiaire(
    event: ChangeEvent<HTMLInputElement>,
    beneficiaire: InformationBeneficiaireSession
  ) {
    if (event.target.checked) {
      const { prenom, nom, ...infosBeneficiaires } = beneficiaire
      setIdsSelectionnes(idsSelectionnes.concat(beneficiaire.idJeune))
      setStatutBeneficiaire('PRESENT')
      setEmargements((currentEmargements) => {
        return [
          ...currentEmargements,
          { ...infosBeneficiaires, statut: 'PRESENT' },
        ]
      })
    } else {
      setStatutBeneficiaire(beneficiaire.statut)
      setIdsSelectionnes(
        idsSelectionnes.filter((id) => id !== beneficiaire.idJeune)
      )
      setEmargements((prev) => {
        return prev?.filter(({ idJeune }) => idJeune !== beneficiaire.idJeune)
      })
    }
  }

  function updateStatutBeneficiaire(
    beneficiaire: InformationBeneficiaireSession
  ) {
    switch (beneficiaire.statut) {
      case StatutBeneficiaire.PRESENT:
        return 'PRESENT'
      case StatutBeneficiaire.REFUS_TIERS:
        return 'REFUS_TIERS'
      case StatutBeneficiaire.INSCRIT:
      case StatutBeneficiaire.REFUS_JEUNE:
        return 'REFUS_JEUNE'
    }
  }

  async function soumettreClotureSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const { cloreSession } = await import('services/sessions.service')

    function updateTousLesBeneficiaires(
      liste: InformationBeneficiaireSession[]
    ) {
      liste.forEach((beneficiaire: InformationBeneficiaireSession) => {
        return setEmargements((currentEmargements: any) => {
          return [
            ...currentEmargements,
            {
              ...beneficiaire,
              statut: updateStatutBeneficiaire(beneficiaire),
            },
          ]
        })
      })
    }

    if (emargements.length === 0) {
      updateTousLesBeneficiaires(inscriptionsInitiales)
    } else {
      const emargementsASoumettre = inscriptionsInitiales.filter(
        (beneficiaireAEmarger) =>
          !emargements.some(
            (beneficiaireDejaCoche) =>
              beneficiaireAEmarger.idJeune === beneficiaireDejaCoche.idJeune
          )
      )
      updateTousLesBeneficiaires(emargementsASoumettre)
    }

    await cloreSession(conseiller.id, session.session.id, emargements)
    setAlerte(AlerteParam.clotureSession)
    await router.push(`/agenda/sessions/${session.session.id}`)
  }

  function afficherStatut(beneficiaire: InformationBeneficiaireSession) {
    switch (beneficiaire.statut) {
      case StatutBeneficiaire.INSCRIT:
        return 'Inscrit'
      case StatutBeneficiaire.PRESENT:
        return 'Présent'
      case StatutBeneficiaire.REFUS_JEUNE:
        return 'Refus jeune'
      case StatutBeneficiaire.REFUS_TIERS:
        return 'Refus tiers'
    }
  }
  useMatomo('Sessions - Clôture de la session')

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
      <form onSubmit={soumettreClotureSession} className='mt-6'>
        <Table caption={{ text: 'Bénéficiaires de la session' }}>
          <THead>
            <TR isHeader={true}>
              <TH>
                {' '}
                <input
                  disabled={
                    session.session.statut === StatutAnimationCollective.Close
                  }
                  id='cloture-tout-selectionner'
                  type='checkbox'
                  checked={Boolean(
                    idsSelectionnes.length === session.inscriptions.length
                  )}
                  title='Tout sélectionner'
                  onChange={(e) => cocherTousLesBeneficiaires(e)}
                  className='mr-4'
                />
                <label
                  htmlFor='cloture-tout-selectionner'
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className='sr-only'>Tout sélectionner</span>
                  Présence des bénéficiaires
                </label>
              </TH>
              <TH>Statut</TH>
            </TR>
          </THead>

          <TBody>
            {session.inscriptions.map((beneficiaire) => (
              <TR key={beneficiaire.idJeune}>
                <TD>
                  <input
                    disabled={
                      beneficiaire.statut === StatutBeneficiaire.PRESENT
                    }
                    type='checkbox'
                    name={beneficiaire.idJeune}
                    id={'checkbox-' + beneficiaire.idJeune}
                    checked={
                      Boolean(idsSelectionnes.includes(beneficiaire.idJeune)) ||
                      beneficiaire.statut === StatutBeneficiaire.PRESENT
                    }
                    title={
                      'Sélectionner ' +
                      `${beneficiaire.prenom} ${beneficiaire.nom}`
                    }
                    value={statutBeneficiaire ?? beneficiaire.statut}
                    onChange={(e) =>
                      modifierStatutBeneficiaire(e, beneficiaire)
                    }
                    className='mr-4'
                  />
                  <label
                    className={`${
                      beneficiaire.statut === StatutBeneficiaire.PRESENT
                        ? 'text-disabled'
                        : ''
                    }`}
                    htmlFor={'checkbox-' + beneficiaire.idJeune}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {beneficiaire.prenom} {beneficiaire.nom}
                  </label>
                </TD>
                <TD>
                  <span
                    className={`${
                      beneficiaire.statut === StatutBeneficiaire.PRESENT
                        ? 'text-disabled'
                        : ''
                    }`}
                  >
                    {afficherStatut(beneficiaire)}{' '}
                    {session.session.commentaire && (
                      <>: {session.session.commentaire}</>
                    )}
                  </span>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        {estAClore(session) && (
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
        )}
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
  if (session?.session.statut !== StatutAnimationCollective.AClore)
    return { notFound: true }

  let redirectTo = context.query.redirectUrl as string

  if (!redirectTo) {
    const referer = context.req.headers.referer
    redirectTo =
      referer && !redirectedFromHome(referer) ? referer : '/mes-jeunes'
  }

  const props: ClotureSessionProps = {
    session,
    returnTo: redirectTo,
    pageTitle: `Clore - Session ${session.offre.titre}`,
    pageHeader: 'Clôture de la session',
    withoutChat: true,
  }

  return { props }
}

export default withTransaction(ClotureSession.name, 'page')(ClotureSession)
