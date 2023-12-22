'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'
import React, { FormEvent, MouseEvent, useRef, useState } from 'react'

import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { Etape } from 'components/ui/Form/Etape'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { ValueWithError } from 'components/ValueWithError'
import {
  Action,
  QualificationAction,
  SituationNonProfessionnelle,
  StatutAction,
} from 'interfaces/action'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { ApiError } from 'utils/httpClient'
import { usePortefeuille } from 'utils/portefeuilleContext'

type QualificationProps = {
  action: Action
  situationsNonProfessionnelles: SituationNonProfessionnelle[]
  returnTo: string
}

function QualificationPage({
  action,
  situationsNonProfessionnelles,
  returnTo,
}: QualificationProps) {
  const router = useRouter()
  const [_, setAlerte] = useAlerte()
  const [portefeuille] = usePortefeuille()

  const [commentaire, setCommentaire] = useState<ValueWithError>({
    value: action.content + (action.comment && ' - ' + action.comment),
  })
  const [codeSNP, setCodeSNP] = useState<ValueWithError<string | undefined>>({
    value: action.qualification?.libelle,
  })
  const [dateDebut, setDateDebut] = useState<string>(action.creationDate)
  const [dateFin, setDateFin] = useState<string | undefined>(
    action.dateFinReelle
  )

  const [isQualificationEnCours, setIsQualificationEnCours] =
    useState<boolean>(false)
  const [erreurQualification, setErreurQualification] = useState<
    string | undefined
  >()
  const [, setQualification] = useState<QualificationAction | undefined>(
    action.qualification
  )
  const [statut, setStatut] = useState<StatutAction>(action.status)

  const [categorieSelectionnee, setcategorieSelectionnee] = useState<
    string | undefined
  >(action.qualification?.libelle)

  const [showHelperCategories, setShowHelperCategories] =
    useState<boolean>(false)
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  const [labelMatomo, setLabelMatomo] = useState<string | undefined>(
    'Création Situation Non Professionnelle'
  )
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  function isCommentaireValid(): boolean {
    return Boolean(commentaire.value) && commentaire.value.length <= 255
  }

  function validateCommentaire() {
    let error
    if (!commentaire.value) {
      error =
        'Le champ Intitulé et description n’est pas renseigné. Veuillez renseigner une description.'
    }
    if (commentaire.value.length > 255)
      error =
        'Vous avez dépassé le nombre maximal de caractères. Veuillez retirer des caractères.'

    setCommentaire({ ...commentaire, error })
  }

  function isFormValid(): boolean {
    return (
      isCommentaireValid() &&
      Boolean(codeSNP) &&
      Boolean(dateFin) &&
      Boolean(dateDebut)
    )
  }

  async function qualifierNonSNP() {
    const { qualifier } = await import('services/actions.service')
    const nouvelleQualification = await qualifier(
      action.id,
      CODE_QUALIFICATION_NON_SNP,
      {
        dateDebutModifiee: DateTime.fromISO(action.dateEcheance),
        dateFinModifiee: DateTime.fromISO(action.dateEcheance),
      }
    )
    setQualification(nouvelleQualification)
    setAlerte(AlerteParam.qualificationNonSNP)
    setStatut(StatutAction.Qualifiee)
  }

  async function qualifierAction(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!isFormValid()) return

    setErreurQualification(undefined)
    setIsQualificationEnCours(true)
    if (codeSNP.value === CODE_QUALIFICATION_NON_SNP) {
      await qualifierNonSNP()
    } else
      try {
        const { qualifier } = await import('services/actions.service')
        await qualifier(action.id, codeSNP!, {
          commentaire: commentaire.value,
          dateDebutModifiee: DateTime.fromISO(dateDebut).startOf('day'),
          dateFinModifiee: DateTime.fromISO(dateFin!).startOf('day'),
        })
        setAlerte(AlerteParam.qualificationSNP)
        router.push(returnTo)
      } catch (error) {
        setErreurQualification(
          error instanceof ApiError
            ? error.message
            : 'Suite à un problème inconnu la qualification a échoué. Vous pouvez réessayer.'
        )
      } finally {
        setIsQualificationEnCours(false)
      }
  }

  function permuterAffichageHelperCategories() {
    setShowHelperCategories(!showHelperCategories)
  }

  useMatomo(labelMatomo, aDesBeneficiaires)

  return (
    <>
      <form onSubmit={qualifierAction}>
        {erreurQualification && (
          <FailureAlert
            label={erreurQualification}
            onAcknowledge={() => setErreurQualification(undefined)}
          />
        )}

        <p className='text-s-bold mb-6'>
          Tous les champs avec * sont obligatoires
        </p>

        <Etape numero={1} titre='Informations principales'>
          <Label htmlFor='select-categorie' inputRequired={true}>
            Catégorie
          </Label>
          <Select
            id='select-categorie'
            required={true}
            onChange={(selectedValue) => {
              setCodeSNP(selectedValue)
              setcategorieSelectionnee(selectedValue)
            }}
            defaultValue={codeSNP.value}
          >
            {situationsNonProfessionnelles.map(({ code, label }) => (
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
              className='fill-[currentColor] w-4 h-4'
              aria-hidden={true}
              focusable={false}
            />
          </button>

          {categorieSelectionnee !== CODE_QUALIFICATION_NON_SNP && (
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
                  precision: '255 caractères maximum',
                }}
              </Label>
              {commentaire.error && (
                <InputError id='commentaire--error'>
                  {commentaire.error}
                </InputError>
              )}
              <Textarea
                id='commentaire'
                maxLength={255}
                allowOverMax={true}
                defaultValue={commentaire.value}
                onChange={(value) => setCommentaire({ value })}
                invalid={Boolean(commentaire.error)}
                onBlur={validateCommentaire}
              />
            </>
          )}
        </Etape>

        {categorieSelectionnee !== CODE_QUALIFICATION_NON_SNP && (
          <Etape numero={2} titre='Dates'>
            <Label htmlFor='input-date-debut' inputRequired={true}>
              Date de début de l’action
            </Label>
            <Input
              type='date'
              id='input-date-debut'
              defaultValue={
                action.creationDate ?? ''
                  ? DateTime.fromISO(action.creationDate).toISODate()
                  : ''
              }
              onChange={setDateDebut}
              required={true}
            />
            <Label htmlFor='input-date-fin' inputRequired={true}>
              Date de l’action
            </Label>
            <Input
              type='date'
              id='input-date-fin'
              defaultValue={
                action.dateFinReelle
                  ? DateTime.fromISO(action.dateFinReelle).toISODate()
                  : ''
              }
              min={DateTime.fromISO(dateDebut).toISODate()}
              onChange={setDateFin}
              required={true}
            />
          </Etape>
        )}

        <div className='mb-6'>
          <InformationMessage label='Ces informations seront intégrées sur le dossier i-milo du bénéficiaire'>
            <p>
              Les informations saisies sont partagées avec i-milo, et doivent en
              respecter les Conditions Générales d’utilisation. Elles ne doivent
              comporter aucune donnée personnelle non autorisée par{' '}
              <strong>l’arrêté du 17 novembre 2021</strong> relatif au
              traitement automatisé de données à caractère personnel dénommé «
              i-milo »
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
                onClick={() => setLabelMatomo('Lien Arrêté 17 novembre 2021')}
              />
            </span>
          </InformationMessage>
        </div>

        <div className='flex justify-center'>
          <ButtonLink
            href={returnTo}
            style={ButtonStyle.SECONDARY}
            className='mr-3'
          >
            Annuler
          </ButtonLink>
          {categorieSelectionnee === CODE_QUALIFICATION_NON_SNP && (
            <Button
              type='submit'
              isLoading={isQualificationEnCours}
              disabled={!isFormValid()}
            >
              <IconComponent
                name={IconName.Send}
                aria-hidden={true}
                focusable={false}
                className='w-[1em] h-[1em] mr-2'
              />
              Enregistrer
            </Button>
          )}
          {categorieSelectionnee !== CODE_QUALIFICATION_NON_SNP && (
            <Button
              type='submit'
              isLoading={isQualificationEnCours}
              disabled={!isFormValid()}
            >
              <IconComponent
                name={IconName.Send}
                aria-hidden={true}
                focusable={false}
                className='w-[1em] h-[1em] mr-2'
              />
              Enregistrer et envoyer à i-milo
            </Button>
          )}
        </div>
      </form>

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
