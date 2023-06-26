import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { FormEvent, useRef, useState } from 'react'

import RadioBox from 'components/action/RadioBox'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { Etape } from 'components/ui/Form/Etape'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import SuccessAlert from 'components/ui/Notifications/SuccessAlert'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { ValueWithError } from 'components/ValueWithError'
import { BaseConseiller, Conseiller } from 'interfaces/conseiller'
import {
  compareJeunesByNom,
  getNomJeuneComplet,
  JeuneFromListe,
} from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'
import redirectedFromHome from 'utils/redirectedFromHome'

interface ReaffectationProps extends PageProps {
  conseillersEtablissement: Conseiller[]
}

type OptionConseiller = {
  id: string
  value: string
}

function Reaffectation({ conseillersEtablissement }: ReaffectationProps) {
  const [portefeuille] = usePortefeuille()

  const [queryConseillerInitial, setQueryConseillerInitial] =
    useState<ValueWithError>({ value: '' })
  const [conseillerInitial, setConseillerInitial] = useState<
    BaseConseiller | undefined
  >()
  const [queryConseillerDestination, setQueryConseillerDestination] =
    useState<ValueWithError>({ value: '' })
  const [conseillerDestination, setConseillerDestination] = useState<
    BaseConseiller | undefined
  >()

  const [
    isRechercheBeneficiairesSubmitted,
    setRechercheBeneficiairesSubmitted,
  ] = useState<boolean>(false)
  const [beneficiaires, setBeneficiaires] = useState<JeuneFromListe[]>([])

  const [idsBeneficiairesSelected, setIdsBeneficiairesSelected] = useState<
    string[]
  >([])
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

  const inputConseillerInitialRef = useRef<HTMLInputElement>(null)
  const [trackingTitle, setTrackingTitle] = useState<string>(
    'Réaffectation jeunes – Etape 1 – Saisie mail cons. ini.'
  )

  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  const conseillersOptions: OptionConseiller[] =
    conseillersEtablissement.map(conseillerToOption)

  function conseillerToOption(conseiller: Conseiller): OptionConseiller {
    let value: string = `${conseiller.lastName} ${conseiller.firstName}`
    if (conseiller.email) value += ` (${conseiller.email})`

    return {
      id: conseiller.id,
      value,
    }
  }

  function handleInputConseillerInitial(inputValue: string) {
    setQueryConseillerInitial({ value: inputValue })

    const optionSelectionnee = conseillersOptions.find(
      ({ value }) =>
        value.localeCompare(inputValue, undefined, {
          sensitivity: 'base',
        }) === 0
    )
    if (optionSelectionnee) {
      setConseillerInitial(
        conseillersEtablissement.find(({ id }) => id === optionSelectionnee.id)
      )
    }

    resetFormOnNewInputConseillerInitial()
  }

  function handleInputConseillerDestination(inputValue: string) {
    setQueryConseillerDestination({ value: inputValue })
    const optionSelectionnee = conseillersOptions.find(
      ({ value }) =>
        value.localeCompare(inputValue, undefined, {
          sensitivity: 'base',
        }) === 0
    )
    if (optionSelectionnee) {
      setConseillerDestination(
        conseillersEtablissement.find(({ id }) => id === optionSelectionnee.id)
      )
    }

    setErreurReaffectation(undefined)
  }

  function resetAll() {
    setQueryConseillerInitial({ value: '' })
    setConseillerInitial(undefined)
    inputConseillerInitialRef.current!.value = ''
    resetFormOnNewInputConseillerInitial()
    setIsReaffectationTemporaire(undefined)
  }

  function resetFormOnNewInputConseillerInitial() {
    setRechercheBeneficiairesSubmitted(false)
    setBeneficiaires([])
    setIdsBeneficiairesSelected([])
    setReaffectationSuccess(false)
    setErreurReaffectation(undefined)
    setQueryConseillerDestination({ value: '' })
    setConseillerDestination(undefined)
  }

  function selectionnerBeneficiaire(beneficiaire: JeuneFromListe) {
    setErreurReaffectation(undefined)
    if (idsBeneficiairesSelected.includes(beneficiaire.id)) {
      setIdsBeneficiairesSelected(
        idsBeneficiairesSelected.filter((id) => id !== beneficiaire.id)
      )
    } else {
      setIdsBeneficiairesSelected(
        idsBeneficiairesSelected.concat(beneficiaire.id)
      )
    }
  }

  function toggleTousLesBeneficiaires() {
    setErreurReaffectation(undefined)
    if (idsBeneficiairesSelected.length !== beneficiaires.length) {
      setIdsBeneficiairesSelected(
        beneficiaires.map((beneficiaire) => beneficiaire.id)
      )
    } else {
      setIdsBeneficiairesSelected([])
    }
  }

  async function fetchListeBeneficiaires() {
    if (!conseillerInitial || !queryConseillerInitial) return

    try {
      const { getJeunesDuConseillerParEmail, getJeunesDuConseillerParId } =
        await import('services/jeunes.service')

      let beneficiairesDuConseiller: JeuneFromListe[]
      if (conseillerInitial) {
        beneficiairesDuConseiller = await getJeunesDuConseillerParId(
          conseillerInitial.id
        )
      } else {
        const { conseiller, jeunes } = await getJeunesDuConseillerParEmail(
          queryConseillerInitial.value
        )
        setConseillerInitial(conseiller)
        beneficiairesDuConseiller = jeunes
      }

      setRechercheBeneficiairesSubmitted(true)
      if (beneficiairesDuConseiller.length > 0) {
        setBeneficiaires(
          [...beneficiairesDuConseiller].sort(compareJeunesByNom)
        )
        setTrackingTitle(
          'Réaffectation jeunes – Etape 2 – Réaff. jeunes vers cons. dest.'
        )
      } else {
        setQueryConseillerInitial({
          ...queryConseillerInitial,
          error: 'Aucun bénéficiaire trouvé pour ce conseiller',
        })
      }
    } catch (err) {
      const erreur = (err as Error).message
        ? 'Aucun conseiller ne correspond'
        : "Une erreur inconnue s'est produite"
      setQueryConseillerInitial({ ...queryConseillerInitial, error: erreur })
      setTrackingTitle('Réaffectation jeunes – Etape 1 – Erreur')
    }
  }

  async function reaffecterBeneficiaires(e: FormEvent) {
    e.preventDefault()
    if (
      !conseillerInitial ||
      !queryConseillerDestination ||
      idsBeneficiairesSelected.length === 0 ||
      isReaffectationEnCours ||
      isReaffectationTemporaire === undefined
    ) {
      return
    }

    setReaffectationEnCours(true)
    try {
      const { getConseillerByEmail } = await import(
        'services/conseiller.service'
      )
      const idConseillerDestination = (
        conseillerDestination ??
        (await getConseillerByEmail(queryConseillerDestination.value))
      ).id

      const { reaffecter } = await import('services/jeunes.service')
      await reaffecter(
        conseillerInitial.id,
        idConseillerDestination,
        idsBeneficiairesSelected,
        isReaffectationTemporaire
      )
      resetAll()
      setReaffectationSuccess(true)
      setTrackingTitle('Réaffectation jeunes – Etape 1 – Succès réaff.')
    } catch (erreur: any) {
      if (
        erreur.message &&
        (Array.isArray(erreur.message) ||
          erreur.message.startsWith('Conseiller'))
      ) {
        setQueryConseillerDestination({
          ...queryConseillerDestination,
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
          label={'Les bénéficiaires ont été réaffectés avec succès'}
          onAcknowledge={() => setReaffectationSuccess(false)}
        />
      )}

      <p className=' text-s-regular mb-6'>Tous les champs sont obligatoires</p>

      <form onSubmit={reaffecterBeneficiaires} className='grow'>
        <Etape numero={1} titre='Choisissez un type de réaffectation'>
          <div className='flex flex-wrap'>
            <RadioBox
              isSelected={isReaffectationTemporaire === false}
              color='primary'
              onChange={() =>
                handleTypeReaffectation(TYPE_REAFFECTATION.Definitif)
              }
              label='Définitif'
              name='type-reaffectation'
              id='type-reaffectation--definitif'
            />

            <RadioBox
              isSelected={isReaffectationTemporaire === true}
              color={'primary'}
              onChange={() =>
                handleTypeReaffectation(TYPE_REAFFECTATION.Temporaire)
              }
              label='Temporaire'
              name='type-reaffectation'
              id='type-reaffectation--temporaire'
            />
          </div>
        </Etape>

        <Etape numero={2} titre='Recherchez un portefeuille de bénéficiaires'>
          <Label htmlFor='conseiller-initial'>
            E-mail conseiller initial {/* TODO nom/prénom ou email */}
          </Label>

          {queryConseillerInitial.error && (
            <InputError id='conseiller-initial--error' className='mb-2'>
              {queryConseillerInitial.error}
            </InputError>
          )}

          <div className='flex align-middle'>
            <SelectAutocomplete
              id='conseiller-initial'
              ref={inputConseillerInitialRef}
              onChange={handleInputConseillerInitial}
              options={conseillersOptions}
              required={true}
              invalid={Boolean(queryConseillerInitial.error)}
            />

            <Button
              className='ml-2 shrink-0'
              label='Rechercher les bénéficiaires'
              style={ButtonStyle.PRIMARY}
              disabled={!queryConseillerInitial.value}
              type='button'
              onClick={fetchListeBeneficiaires}
            >
              <IconComponent
                name={IconName.Search}
                focusable={false}
                aria-hidden={true}
                className='w-6 h-6'
                title='Rechercher'
              />
              Rechercher les bénéficiaires
            </Button>
          </div>
        </Etape>

        {isRechercheBeneficiairesSubmitted && beneficiaires.length > 0 && (
          <>
            <Etape
              numero={3}
              titre='Sélectionnez les bénéficiaires à réaffecter'
            >
              <Table
                caption={{
                  text: `Bénéficiaires de ${
                    conseillerInitial
                      ? `${conseillerInitial.firstName} ${conseillerInitial.lastName}`
                      : queryConseillerInitial.value
                  }`,
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
                        {idsBeneficiairesSelected.length === 0
                          ? 'Cocher'
                          : 'Décocher'}{' '}
                        tous les bénéficiaires
                      </label>
                      <input
                        id='reaffectation-tout-selectionner'
                        type='checkbox'
                        className='mr-6'
                        checked={
                          idsBeneficiairesSelected.length ===
                          beneficiaires.length
                        }
                        title={
                          idsBeneficiairesSelected.length === 0
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
                  {beneficiaires.map((beneficiaire: JeuneFromListe) => (
                    <TR
                      key={beneficiaire.id}
                      onClick={() => selectionnerBeneficiaire(beneficiaire)}
                    >
                      <TD className='p-4 rounded-l-base'>
                        <input
                          id={'checkbox-' + beneficiaire.id}
                          type='checkbox'
                          checked={idsBeneficiairesSelected.includes(
                            beneficiaire.id
                          )}
                          title={
                            'Sélectionner ' + getNomJeuneComplet(beneficiaire)
                          }
                          onChange={() => false}
                        />
                      </TD>
                      <TD className='p-4 text-base-bold'>
                        <label
                          htmlFor={'checkbox-' + beneficiaire.id}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {getNomJeuneComplet(beneficiaire)}
                        </label>
                      </TD>
                      <TD className='p-4 text-base-regular'>
                        {beneficiaire.conseillerPrecedent
                          ? `${beneficiaire.conseillerPrecedent.nom} ${beneficiaire.conseillerPrecedent.prenom}`
                          : '-'}
                      </TD>
                      <TD className='p-4 text-base-regular rounded-r-base'>
                        {beneficiaire.conseillerPrecedent?.email ?? '-'}
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
              <Label htmlFor='conseiller-destination'>
                {{
                  main: 'E-mail conseiller de destination',
                  helpText:
                    'L’e-mail de la personne à qui vous souhaitez transférer le(s) bénéficiaire(s) sélectionné(s)',
                }}
              </Label>

              {queryConseillerDestination.error && (
                <InputError id='conseiller-destinatin--error' className='mb-2'>
                  {queryConseillerDestination.error}
                </InputError>
              )}

              <SelectAutocomplete
                id='conseiller-destination'
                onChange={handleInputConseillerDestination}
                options={conseillersOptions}
                required={true}
                invalid={Boolean(queryConseillerDestination.error)}
              />
            </Etape>

            <div className='w-full'>
              <Button label='Réaffecter les bénéficiaires' type='submit'>
                <IconComponent
                  name={IconName.ArrowForward}
                  focusable='false'
                  aria-hidden={true}
                  className={`w-6 h-6 mr-2 fill-blanc`}
                  title='Rechercher'
                />
                Valider mon choix
              </Button>

              {idsBeneficiairesSelected.length > 0 && erreurReaffectation && (
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
          </>
        )}
      </form>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  ReaffectationProps
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
  if (!user.estSuperviseur) {
    return { notFound: true }
  }

  let redirectTo = context.query.redirectUrl as string
  if (!redirectTo) {
    const referer = context.req.headers.referer
    redirectTo =
      referer && !redirectedFromHome(referer) ? referer : '/mes-jeunes'
  }

  const { getConseillerServerSide, getConseillersEtablissementServerSide } =
    await import('services/conseiller.service')
  const conseiller = await getConseillerServerSide(user, accessToken)
  if (!conseiller) {
    throw new Error(`Conseiller ${user.id} inexistant`)
  }

  const conseillersEtablissement = conseiller.agence?.id
    ? await getConseillersEtablissementServerSide(
        accessToken,
        conseiller.agence.id,
        user
      )
    : []

  return {
    props: {
      returnTo: redirectTo,
      pageTitle: 'Réaffectation',
      withoutChat: true,
      conseillersEtablissement,
    },
  }
}

export default withTransaction(Reaffectation.name, 'page')(Reaffectation)
