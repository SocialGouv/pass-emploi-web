'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import React, { FormEvent, useRef, useState } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Etape from 'components/ui/Form/Etape'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import RecapitulatifErreursFormulaire, {
  LigneErreur,
} from 'components/ui/Notifications/RecapitulatifErreursFormulaire'
import { ValueWithError } from 'components/ValueWithError'
import { Action, SituationNonProfessionnelle } from 'interfaces/action'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import useMatomo from 'utils/analytics/useMatomo'
import { ApiError } from 'utils/httpClient'
import { usePortefeuille } from 'utils/portefeuilleContext'

type QualificationProps = {
  action: Action
  categories: SituationNonProfessionnelle[]
  returnTo: string
  returnToListe: string
}

function QualificationPage({
  action,
  categories,
  returnTo,
  returnToListe,
}: QualificationProps) {
  const MAX_INPUT_LENGTH = 250

  const [portefeuille] = usePortefeuille()

  const [commentaire, setCommentaire] = useState<ValueWithError>({
    value: action.titre + (action.comment && ' - ' + action.comment),
  })

  const [codeCategorie, setCodeCategorie] = useState<
    ValueWithError<string | undefined>
  >({ value: action.qualification?.code })

  const dateActionFin =
    action && DateTime.fromISO(action.dateFinReelle!).toISODate()
  const [dateFin, setDateFin] = useState<ValueWithError<string | undefined>>({
    value: dateActionFin,
  })

  const [isQualificationEnCours, setIsQualificationEnCours] =
    useState<boolean>(false)
  const [erreurQualification, setErreurQualification] = useState<
    string | undefined
  >()

  const [successQualification, setSuccessQualification] =
    useState<boolean>(false)

  const [showHelperCategories, setShowHelperCategories] =
    useState<boolean>(false)
  const modalRef = useRef<ModalHandles>(null)

  const formErrorsRef = useRef<HTMLDivElement>(null)

  const [labelMatomo, setLabelMatomo] = useState<string>(
    'Création Situation Non Professionnelle'
  )
  const estSNP = codeCategorie.value !== CODE_QUALIFICATION_NON_SNP

  function isCommentaireValid(): boolean {
    return (
      Boolean(commentaire.value) && commentaire.value.length <= MAX_INPUT_LENGTH
    )
  }

  function validateCategorie() {
    if (!codeCategorie.value)
      setCodeCategorie({
        ...codeCategorie,
        error:
          'Le champ Catégorie est vide. Veuillez renseigner une catégorie.',
      })
  }

  function validateCommentaire() {
    if (!commentaire.value)
      setCommentaire({
        ...commentaire,
        error:
          'Le champ Titre et description n’est pas renseigné. Veuillez renseigner un titre ou une description.',
      })

    if (commentaire.value.length > MAX_INPUT_LENGTH)
      setCommentaire({
        ...commentaire,
        error:
          'Vous avez dépassé le nombre maximal de caractères. Veuillez retirer des caractères.',
      })
  }

  function validerDateFin() {
    if (!dateFin.value)
      setDateFin({
        ...dateFin,
        error:
          'Le champ Date de fin de l’action n’est pas renseigné. Veuillez renseigner la date à laquelle l’action a été terminée.',
      })
  }

  function isFormValid(): boolean {
    return isCommentaireValid() && Boolean(codeCategorie) && Boolean(dateFin)
  }

  async function qualifierNonSNP() {
    const { qualifier } = await import('server-actions/actions.server-actions')
    await qualifier(action.id, CODE_QUALIFICATION_NON_SNP, {
      dateFinModifiee: DateTime.fromISO(action.dateEcheance).toISO(),
    })
  }

  async function qualifierSNP() {
    const { qualifier } = await import('server-actions/actions.server-actions')
    await qualifier(action.id, codeCategorie.value!, {
      commentaire: commentaire.value,
      dateFinModifiee: DateTime.fromISO(dateFin.value!).startOf('day').toISO(),
    })
  }

  async function qualifierAction(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!isFormValid()) {
      formErrorsRef.current!.focus()
      return
    }

    setErreurQualification(undefined)
    setIsQualificationEnCours(true)
    try {
      if (estSNP) await qualifierSNP()
      else await qualifierNonSNP()
      setSuccessQualification(true)
    } catch (error) {
      setErreurQualification(
        error instanceof ApiError && error.statusCode !== 500
          ? error.message
          : 'Suite à un problème inconnu, la qualification a échoué. Veuillez réessayer.'
      )
      document.querySelector('header')?.scrollIntoView({ behavior: 'smooth' })
    } finally {
      setIsQualificationEnCours(false)
    }
  }

  function getErreurs(): LigneErreur[] {
    const erreurs = []
    if (codeCategorie.error) {
      erreurs.push({
        ancre: '#select-categorie',
        label: 'Le champ Catégorie est vide.',
        titreChamp: 'Catégorie',
      })
    }

    if (estSNP && commentaire.error) {
      erreurs.push({
        ancre: '#commentaire',
        label: 'Le champ Titre et description de l’action est vide.',
        titreChamp: 'Titre et description de l’action',
      })
    }

    if (dateFin.error) {
      erreurs.push({
        ancre: '#input-date-fin',
        label: 'Le champ Date de fin de l’action est vide.',
        titreChamp: 'Date de fin de l’action',
      })
    }
    return erreurs
  }

  function permuterAffichageHelperCategories() {
    setShowHelperCategories(!showHelperCategories)
  }

  useMatomo(labelMatomo, portefeuille.length > 0)

  return (
    <>
      {!successQualification && (
        <>
          <RecapitulatifErreursFormulaire
            erreurs={getErreurs()}
            ref={formErrorsRef}
          />

          <form onSubmit={qualifierAction}>
            {erreurQualification && (
              <FailureAlert
                label={erreurQualification}
                onAcknowledge={() => setErreurQualification(undefined)}
              />
            )}

            <p className='text-s-bold mb-6'>
              Tous les champs sont obligatoires
            </p>

            <Etape numero={1} titre='Informations principales'>
              <Label htmlFor='select-categorie' inputRequired={true}>
                Catégorie
              </Label>
              {codeCategorie.error && (
                <InputError id='select-categorie--error'>
                  {codeCategorie.error}
                </InputError>
              )}
              <Select
                id='select-categorie'
                required={true}
                onChange={(selectedValue) => {
                  setCodeCategorie({ value: selectedValue })
                }}
                invalid={Boolean(codeCategorie.error)}
                defaultValue={codeCategorie.value}
                onBlur={validateCategorie}
              >
                {categories.map(({ code, label }) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}{' '}
              </Select>

              <button
                type='button'
                onClick={permuterAffichageHelperCategories}
                className='flex items-center gap-2 text-primary mt-[-1.5rem] mb-8'
              >
                À quoi servent les catégories ?
                <IconComponent
                  name={IconName.Help}
                  className='fill-current w-4 h-4'
                  aria-hidden={true}
                  focusable={false}
                />
              </button>

              {estSNP && (
                <>
                  <Label
                    htmlFor='commentaire'
                    inputRequired={true}
                    withBulleMessageSensible={true}
                  >
                    {{
                      main: "Titre et description de l'action",
                      helpText:
                        'Vous retrouverez ce résumé dans les détails de la situation non professionnelle sur i-milo, dans le champ « Commentaire ».',
                      precision: `${MAX_INPUT_LENGTH} caractères maximum`,
                    }}
                  </Label>
                  {commentaire.error && (
                    <InputError id='commentaire--error'>
                      {commentaire.error}
                    </InputError>
                  )}
                  <Textarea
                    id='commentaire'
                    maxLength={MAX_INPUT_LENGTH}
                    allowOverMax={true}
                    defaultValue={commentaire.value}
                    onChange={(value) => setCommentaire({ value })}
                    invalid={Boolean(commentaire.error)}
                    onBlur={validateCommentaire}
                  />
                </>
              )}
            </Etape>

            {estSNP && (
              <Etape numero={2} titre='Date'>
                <Label htmlFor='input-date-fin' inputRequired={true}>
                  Date de fin de l’action
                </Label>
                {dateFin.error && (
                  <InputError id='input-date-fin--error' className='mb-2'>
                    {dateFin.error}
                  </InputError>
                )}
                <Input
                  type='date'
                  id='input-date-fin'
                  defaultValue={dateActionFin}
                  onChange={(value: string) => setDateFin({ value })}
                  onBlur={validerDateFin}
                  required={true}
                  invalid={Boolean(dateFin.error)}
                />
              </Etape>
            )}

            {estSNP && (
              <div className='mb-6'>
                <InformationMessage label='Ces informations seront intégrées sur le dossier i-milo du bénéficiaire'>
                  <p>
                    Les informations saisies sont partagées avec i-milo, et
                    doivent en respecter les Conditions Générales d’utilisation.
                    Elles ne doivent comporter aucune donnée personnelle non
                    autorisée par <strong>l’arrêté du 17 novembre 2021</strong>{' '}
                    relatif au traitement automatisé de données à caractère
                    personnel dénommé « i-milo »
                  </p>
                  <span className='hover:text-primary_darken'>
                    <ExternalLink
                      href='https://c-milo.i-milo.fr/jcms/t482_1002488/fr/mentions-legales'
                      label='Voir le détail des CGU'
                      onClick={() => setLabelMatomo('Lien CGU')}
                    />
                  </span>
                  <span className='hover:text-primary_darken'>
                    <ExternalLink
                      href='https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000045084361'
                      label='Voir le détail de l’arrêté du 17 novembre 2021'
                      onClick={() =>
                        setLabelMatomo('Lien Arrêté 17 novembre 2021')
                      }
                    />
                  </span>
                </InformationMessage>
              </div>
            )}

            <div className='flex justify-center'>
              <ButtonLink
                href={returnTo}
                style={ButtonStyle.SECONDARY}
                className='mr-3'
              >
                Annuler
              </ButtonLink>
              <Button type='submit' isLoading={isQualificationEnCours}>
                <IconComponent
                  name={IconName.Send}
                  aria-hidden={true}
                  focusable={false}
                  className='w-[1em] h-[1em] mr-2'
                />
                {estSNP ? 'Enregistrer et envoyer à i-milo' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </>
      )}

      {successQualification && (
        <div className='text-center'>
          <IllustrationComponent
            name={IllustrationName.Check}
            className='m-auto fill-success_darken w-[180px] h-[180px]'
            aria-hidden={true}
            focusable={false}
          />
          <h2 className='text-m-bold mb-2'>Action enregistrée !</h2>
          {estSNP && (
            <>
              <p>Les informations sont en route vers i-milo.</p>
              <p> Délai d’actualisation : environ 24h.</p>
            </>
          )}
          {!estSNP && (
            <>
              <p>L’action est qualifiée en non-SNP.</p>
            </>
          )}

          <div className='mt-10 flex justify-center gap-4'>
            <ButtonLink href={returnTo} style={ButtonStyle.SECONDARY}>
              Voir le détail
            </ButtonLink>
            <ButtonLink href={returnToListe} style={ButtonStyle.PRIMARY}>
              Revenir à ma liste d‘actions
            </ButtonLink>
          </div>
        </div>
      )}

      {showHelperCategories && (
        <Modal
          ref={modalRef}
          title='Pourquoi choisir une catégorie ?'
          titleIllustration={IllustrationName.Info}
          onClose={() => setShowHelperCategories(false)}
        >
          <p>
            Les catégories proposées sont le reflet de celles que vous
            retrouverez lors de la qualification. Elles vous permettent de
            gagner du temps.
          </p>
          <Button
            style={ButtonStyle.PRIMARY}
            onClick={(e) => modalRef.current!.closeModal(e)}
            className='block m-auto mt-4'
          >
            Fermer
          </Button>
        </Modal>
      )}
    </>
  )
}

export default withTransaction(
  QualificationPage.name,
  'page'
)(QualificationPage)
