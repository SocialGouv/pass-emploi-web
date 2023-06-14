import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { FormEvent, useState } from 'react'

import RadioBox from 'components/action/RadioBox'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { Etape } from 'components/ui/Form/Etape'
import ResettableTextInput from 'components/ui/Form/ResettableTextInput'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import SuccessAlert from 'components/ui/Notifications/SuccessAlert'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import {
  compareJeunesByNom,
  getNomJeuneComplet,
  JeuneFromListe,
} from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import useMatomo from 'utils/analytics/useMatomo'
import isEmailValid from 'utils/isEmailValid'
import { usePortefeuille } from 'utils/portefeuilleContext'
import redirectedFromHome from 'utils/redirectedFromHome'

type ReaffectationProps = PageProps

function Reaffectation(_: ReaffectationProps) {
  const [portefeuille] = usePortefeuille()

  const [conseillerInitial, setConseillerInitial] = useState<{
    email: string
    id?: string
    error?: string
  }>({ email: '' })
  const [isRechercheJeunesEnabled, setRechercheJeunesEnabled] =
    useState<boolean>(false)
  const [isRechercheJeunesSubmitted, setRechercheJeunesSubmitted] =
    useState<boolean>(false)
  const [jeunes, setJeunes] = useState<JeuneFromListe[]>([])
  const [idsJeunesSelected, setIdsJeunesSelected] = useState<string[]>([])
  const [emailConseillerDestination, setEmailConseillerDestination] = useState<{
    value: string
    error?: string
  }>({ value: '' })
  const [isReaffectationEnCours, setReaffectationEnCours] =
    useState<boolean>(false)
  const [isReaffectationSuccess, setReaffectationSuccess] =
    useState<boolean>(false)
  const [erreurReaffectation, setErreurReaffectation] = useState<
    string | undefined
  >(undefined)
  const [isReaffectationTemporaire, setIsReaffectationTemporaire] = useState<
    boolean | undefined
  >(undefined)
  const [trackingTitle, setTrackingTitle] = useState<string>(
    'Réaffectation jeunes – Etape 1 – Saisie mail cons. ini.'
  )

  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  function editEmailConseillerInitial(value: string) {
    setConseillerInitial({ email: value })
    setRechercheJeunesSubmitted(false)
    setJeunes([])
    setRechercheJeunesEnabled(isEmailValid(value))
    setIdsJeunesSelected([])
    setReaffectationSuccess(false)
    setErreurReaffectation(undefined)
  }

  function editEmailConseillerDestination(value: string) {
    setEmailConseillerDestination({ value })
    setErreurReaffectation(undefined)
  }

  function resetInitialEmail() {
    editEmailConseillerInitial('')
    setEmailConseillerDestination({ value: '' })
  }

  function resetAll() {
    resetInitialEmail()
    setIsReaffectationTemporaire(undefined)
  }

  function selectionnerJeune(jeune: JeuneFromListe) {
    setErreurReaffectation(undefined)
    if (idsJeunesSelected.includes(jeune.id)) {
      setIdsJeunesSelected(idsJeunesSelected.filter((id) => id !== jeune.id))
    } else {
      setIdsJeunesSelected(idsJeunesSelected.concat(jeune.id))
    }
  }

  function toggleTousLesBeneficiaires() {
    setErreurReaffectation(undefined)
    if (idsJeunesSelected.length !== jeunes.length) {
      setIdsJeunesSelected(jeunes.map((jeune) => jeune.id))
    } else {
      setIdsJeunesSelected([])
    }
  }

  async function fetchListeJeunes(e: FormEvent) {
    e.preventDefault()
    if (!isRechercheJeunesEnabled) return

    setRechercheJeunesEnabled(false)
    try {
      const { getJeunesDuConseillerParEmail } = await import(
        'services/jeunes.service'
      )
      const { idConseiller, jeunes: jeunesDuConseiller } =
        await getJeunesDuConseillerParEmail(conseillerInitial.email)
      setRechercheJeunesSubmitted(true)
      if (jeunesDuConseiller.length > 0) {
        setJeunes([...jeunesDuConseiller].sort(compareJeunesByNom))
        setConseillerInitial({
          ...conseillerInitial,
          id: idConseiller,
        })
        setTrackingTitle(
          'Réaffectation jeunes – Etape 2 – Réaff. jeunes vers cons. dest.'
        )
      } else {
        setConseillerInitial({
          ...conseillerInitial,
          error: 'Aucun jeune trouvé pour ce conseiller',
        })
      }
    } catch (err) {
      let erreur: string
      if ((err as Error).message) erreur = 'Aucun conseiller ne correspond'
      else erreur = "Une erreur inconnue s'est produite"
      setConseillerInitial({ ...conseillerInitial, error: erreur })
      setTrackingTitle('Réaffectation jeunes – Etape 1 – Erreur')
    }
  }

  async function reaffecterJeunes(e: FormEvent) {
    e.preventDefault()
    if (
      !conseillerInitial.id ||
      !isEmailValid(emailConseillerDestination.value) ||
      idsJeunesSelected.length === 0 ||
      isReaffectationEnCours ||
      isReaffectationTemporaire === undefined
    ) {
      return
    }

    setReaffectationEnCours(true)
    try {
      const { reaffecter } = await import('services/jeunes.service')
      await reaffecter(
        conseillerInitial.id,
        emailConseillerDestination.value,
        idsJeunesSelected,
        isReaffectationTemporaire
      )
      resetAll()
      setReaffectationSuccess(true)
      setTrackingTitle('Réaffectation jeunes – Etape 1 – Succès réaff.')
    } catch (err) {
      const erreur = err as Error
      if (erreur.message?.startsWith('Conseiller')) {
        setEmailConseillerDestination({
          ...emailConseillerDestination,
          error: 'Aucun conseiller ne correspond',
        })
      } else {
        setErreurReaffectation(
          'Suite à un problème inconnu la réaffectation a échoué. Vous pouvez réessayer.'
        )
      }
      setTrackingTitle('Réaffectation jeunes – Etape 2 – Erreur')
    } finally {
      setReaffectationEnCours(false)
    }
  }

  const TYPE_REAFFECTATION = {
    Definitif: 'DEFINITIF',
    Temporaire: 'TEMPORAIRE',
  }

  function handleTypeReaffectation(value: string) {
    if (value === TYPE_REAFFECTATION.Temporaire) {
      setIsReaffectationTemporaire(true)
    } else {
      setIsReaffectationTemporaire(false)
    }
  }

  useMatomo(trackingTitle, aDesBeneficiaires)

  return (
    <>
      {isReaffectationSuccess && (
        <SuccessAlert
          label={'Les jeunes ont été réaffectés avec succès'}
          onAcknowledge={() => setReaffectationSuccess(false)}
        />
      )}

      <p className=' text-s-regular mb-6'>
        Les champs avec <span className='text-warning'>*</span> sont
        obligatoires
      </p>
      <Etape numero={1} titre='Choisissez un type de réaffectation'>
        <div className='flex flex-wrap'>
          <RadioBox
            className='mr-2'
            isSelected={isReaffectationTemporaire === false}
            color='primary'
            onChange={() =>
              handleTypeReaffectation(TYPE_REAFFECTATION.Definitif)
            }
            label='Définitif'
            name='type-reaffectation'
            id='type-reaffectation--definitif'
          ></RadioBox>
          <RadioBox
            className='mr-2'
            isSelected={isReaffectationTemporaire === true}
            color={'primary'}
            onChange={() =>
              handleTypeReaffectation(TYPE_REAFFECTATION.Temporaire)
            }
            label='Temporaire'
            name='type-reaffectation'
            id='type-reaffectation--temporaire'
          ></RadioBox>
        </div>
      </Etape>

      <Etape numero={2} titre='Recherchez un portefeuille de bénéficiaires'>
        <label
          htmlFor='email-conseiller-initial'
          className='text-base-medium text-content_color row-start-1 row-start-1 mb-3'
        >
          <span aria-hidden='true'>*</span> E-mail conseiller initial
        </label>

        <form
          role='search'
          onSubmit={fetchListeJeunes}
          className='grow col-start-1 row-start-2'
        >
          <div className='flex align-middle'>
            <ResettableTextInput
              id={'email-conseiller-initial'}
              value={conseillerInitial.email}
              onChange={editEmailConseillerInitial}
              onReset={resetInitialEmail}
              type={'email'}
              className='flex-1 border border-solid border-grey_700 rounded-base text-base-regular text-primary_darken'
              required={true}
            />

            <Button
              className='ml-2'
              label='Rechercher les bénéficiaires'
              style={ButtonStyle.PRIMARY}
              disabled={!isRechercheJeunesEnabled}
              type='submit'
            >
              <IconComponent
                name={IconName.Search}
                focusable='false'
                aria-hidden={true}
                className={`w-6 h-6 ${
                  isRechercheJeunesEnabled ? 'fill-primary' : 'fill-disabled'
                }`}
                title='Rechercher'
              />
              Rechercher les bénéficiaires
            </Button>
          </div>
        </form>
        {Boolean(conseillerInitial.error) && (
          <div className='flex col-start-1 row-start-3'>
            <IconComponent
              name={IconName.Error}
              focusable={false}
              aria-hidden={true}
              className='fill-warning w-6 h-6 mr-2'
            />
            <p className='text-warning'>{conseillerInitial.error}</p>
          </div>
        )}
      </Etape>

      {conseillerInitial.email &&
        isRechercheJeunesSubmitted &&
        jeunes.length > 0 && (
          <>
            <Etape
              numero={3}
              titre='Sélectionnez les bénéficiaires à réaffecter'
            >
              <Table
                caption={{
                  text: `Jeunes de ${conseillerInitial.email}`,
                  visible: false,
                }}
              >
                <THead>
                  <TR isHeader={true}>
                    <TH className='text-base-bold'>
                      <label
                        className='sr-only'
                        htmlFor='reaffectation-tout-selectionner'
                      >
                        {idsJeunesSelected.length === 0 ? 'Cocher' : 'Décocher'}{' '}
                        tous les bénéficiaires
                      </label>
                      <input
                        id='reaffectation-tout-selectionner'
                        type='checkbox'
                        className='mr-6'
                        checked={idsJeunesSelected.length === jeunes.length}
                        title={
                          idsJeunesSelected.length === 0
                            ? 'Tout sélectionner'
                            : 'Tout désélectionner'
                        }
                        onChange={() => false}
                        onClick={toggleTousLesBeneficiaires}
                      />
                    </TH>
                    <TH className='text-base-bold'>Bénéficiaire</TH>
                    <TH className='text-base-bold'>Conseiller précédent</TH>
                    <TH className='text-base-bold'>
                      Email conseiller précédent
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {jeunes.map((jeune: JeuneFromListe) => (
                    <TR key={jeune.id} onClick={() => selectionnerJeune(jeune)}>
                      <TD className='p-4 rounded-l-base'>
                        <input
                          id={'checkbox-' + jeune.id}
                          type='checkbox'
                          checked={idsJeunesSelected.includes(jeune.id)}
                          title={'Sélectionner ' + getNomJeuneComplet(jeune)}
                          onChange={() => false}
                        />
                      </TD>
                      <TD className='p-4 text-base-bold'>
                        <label
                          htmlFor={'checkbox-' + jeune.id}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {getNomJeuneComplet(jeune)}
                        </label>
                      </TD>
                      <TD className='p-4 text-base-regular'>
                        {jeune.conseillerPrecedent
                          ? `${jeune.conseillerPrecedent.nom} ${jeune.conseillerPrecedent.prenom}`
                          : '-'}
                      </TD>
                      <TD className='p-4 text-base-regular rounded-r-base'>
                        {jeune.conseillerPrecedent?.email ?? '-'}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </Etape>

            <Etape
              numero={4}
              titre='À qui souhaitez-vous affecter ce(s) bénéficiaire(s) ?'
            >
              <label
                htmlFor='email-conseiller-destination'
                className='text-base-medium whitespace-nowrap col-start-2 row-start-1 mb-3 text-content_color'
              >
                <span aria-hidden='true'>*</span> E-mail conseiller de
                destination
              </label>

              <span className='text-s-regular mb-3'>
                L’e-mail de la personne à qui vous souhaitez transférer le(s)
                bénéficiaire(s) sélectionné(s)
              </span>

              <form
                id='affecter-jeunes'
                onSubmit={reaffecterJeunes}
                className='grow col-start-2 row-start-2'
              >
                <ResettableTextInput
                  id={'email-conseiller-destination'}
                  value={emailConseillerDestination.value}
                  onChange={editEmailConseillerDestination}
                  onReset={() => editEmailConseillerDestination('')}
                  disabled={false}
                  type={'email'}
                  className='flex-1 border border-solid border-grey_700 rounded-base text-base-regular text-primary_darken'
                  required={true}
                />
              </form>

              {Boolean(emailConseillerDestination.error) && (
                <div className='flex col-start-2 row-start-3 mt-3'>
                  <IconComponent
                    name={IconName.Error}
                    focusable={false}
                    aria-hidden={true}
                    className='fill-warning w-6 h-6 mr-2'
                  />
                  <p className='text-warning'>
                    {emailConseillerDestination.error}
                  </p>
                </div>
              )}
            </Etape>

            <div className='w-full'>
              <Button
                form='affecter-jeunes'
                label='Réaffecter les jeunes'
                type='submit'
              >
                <IconComponent
                  name={IconName.ArrowForward}
                  focusable='false'
                  aria-hidden={true}
                  className={`w-6 h-6 mr-2 fill-blanc`}
                  title='Rechercher'
                />
                Valider mon choix
              </Button>

              {idsJeunesSelected.length > 0 && (
                <div>
                  {Boolean(erreurReaffectation) && (
                    <div className='absolute flex mt-3'>
                      <IconComponent
                        name={IconName.Error}
                        focusable={false}
                        aria-hidden={true}
                        className='fill-warning w-6 h-6 mr-2 flex-shrink-0'
                      />
                      <p className='text-warning'>{erreurReaffectation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  let redirectTo = context.query.redirectUrl as string
  if (!redirectTo) {
    const referer = context.req.headers.referer
    redirectTo =
      referer && !redirectedFromHome(referer) ? referer : '/mes-jeunes'
  }

  const {
    session: { user },
  } = sessionOrRedirect
  if (!user.estSuperviseur) {
    return { notFound: true }
  }

  return {
    props: {
      returnTo: redirectTo,
      pageTitle: 'Réaffectation',
      withoutChat: true,
    },
  }
}

export default withTransaction(Reaffectation.name, 'page')(Reaffectation)
