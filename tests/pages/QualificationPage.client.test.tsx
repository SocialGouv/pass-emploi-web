import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'

import QualificationPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[jeune_id]/actions/[action_id]/qualification/QualificationPage'
import { desSituationsNonProfessionnelles, uneAction } from 'fixtures/action'
import { Action, SituationNonProfessionnelle } from 'interfaces/action'
import { AlerteParam } from 'referentiel/alerteParam'
import { qualifier } from 'services/actions.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/actions.service')

describe('QualificationPage client side', () => {
  let action: Action
  let situationsNonProfessionnelles: SituationNonProfessionnelle[]

  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  let push: jest.Mock
  beforeEach(() => {
    // Given
    action = uneAction({ dateFinReelle: '2022-09-02T11:00:00.000Z' })
    situationsNonProfessionnelles = desSituationsNonProfessionnelles()

    alerteSetter = jest.fn()
    push = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({ push })

    // When
    renderWithContexts(
      <QualificationPage
        action={action}
        situationsNonProfessionnelles={situationsNonProfessionnelles}
        returnTo='/mes-jeunes/jeune-1/actions/id-action-1'
      />,
      {
        customAlerte: { alerteSetter },
      }
    )
  })

  it('affiche un message d’information', async () => {
    // Then
    expect(
      screen.getByText(
        'Ces informations seront intégrées sur le dossier i-milo du bénéficiaire'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(/respecter les Conditions Générales d’utilisation/)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Voir le détail des CGU (nouvelle fenêtre)',
      })
    ).toHaveAttribute(
      'href',
      'https://c-milo.i-milo.fr/jcms/t482_1002488/fr/mentions-legales'
    )
    expect(
      screen.getByRole('link', {
        name: 'Voir le détail de l’arrêté du 17 novembre 2021 (nouvelle fenêtre)',
      })
    ).toHaveAttribute(
      'href',
      'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000045084361'
    )
  })

  it("affiche le résumé de l'action", () => {
    // Then
    const etape1 = screen.getByRole('group', {
      name: 'Étape 1: Résumé de l’action',
    })
    expect(
      within(etape1).getByRole('textbox', {
        name: /Intitulé et description de l'action/,
      })
    ).toHaveValue(action.content + ' - ' + action.comment)
  })

  it('demande un type de situation non professionnelle', () => {
    // Then
    const etape2 = screen.getByRole('group', {
      name: 'Étape 2: Type',
    })
    const selectSNP = within(etape2).getByRole('combobox', { name: /Type/ })
    situationsNonProfessionnelles.forEach(({ code, label }) => {
      expect(
        within(selectSNP).getByRole('option', { name: label })
      ).toHaveValue(code)
    })
  })

  it("permet de modifier la date de début de l'action", () => {
    // Then
    const etape3 = screen.getByRole('group', {
      name: 'Étape 3: Date de début de l’action',
    })
    const inputDate = within(etape3).getByLabelText('* Date de début')
    expect(inputDate).toHaveAttribute('type', 'date')
    expect(inputDate).toHaveValue('2022-02-15')
  })

  it("permet de modifier la date de fin réelle de l'action", () => {
    // Then
    const etape4 = screen.getByRole('group', {
      name: 'Étape 4: Date de fin de l’action',
    })
    const inputDate = within(etape4).getByLabelText('* Date de fin')
    expect(inputDate).toHaveAttribute('type', 'date')
    expect(inputDate).toHaveAttribute('min', '2022-02-15')
    expect(inputDate).toHaveValue('2022-09-02')
  })

  describe('validation formulaire', () => {
    let inputCommentaire: HTMLElement
    beforeEach(async () => {
      // Given
      inputCommentaire = screen.getByRole('textbox', {
        name: /Intitulé et description/,
      })
      const selectSNP = screen.getByRole('combobox', { name: /Type/ })
      const inputDate = screen.getByLabelText('* Date de fin')

      await userEvent.clear(inputCommentaire)
      await userEvent.type(inputCommentaire, 'Nouveau commentaire modifié')
      await userEvent.selectOptions(
        selectSNP,
        situationsNonProfessionnelles[1].code
      )
      // FIXME userEvent.type ne marche pas bien avec les input date/time
      fireEvent.change(inputDate, { target: { value: '2022-09-05' } })
    })

    it('envoie la qualification au fuseau horaire du navigateur du client', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: 'Créer et envoyer à i-milo' })
      )

      // Then
      expect(qualifier).toHaveBeenCalledWith(action.id, 'SNP_2', {
        commentaire: 'Nouveau commentaire modifié',
        dateDebutModifiee: DateTime.fromISO(
          '2022-02-15T00:00:00.000+01:00' // en février, l'offset est +1 (DST)
        ),
        dateFinModifiee: DateTime.fromISO('2022-09-05T00:00:00.000+02:00'),
      })
    })

    it("redirige vers le détail de l'action", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: 'Créer et envoyer à i-milo' })
      )

      // Then
      expect(alerteSetter).toHaveBeenCalledWith('qualificationSNP')
      expect(push).toHaveBeenCalledWith(
        '/mes-jeunes/jeune-1/actions/id-action-1'
      )
    })

    it('est désactivée si le commentaire n’est pas renseigné', async () => {
      // When
      await userEvent.clear(inputCommentaire)
      await userEvent.tab()

      // Then
      expect(
        screen.getByText(
          'Le champ Intitulé et description n’est pas renseigné. Veuillez renseigner une description.'
        )
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Créer/ })).toHaveAttribute(
        'disabled',
        ''
      )
    })

    it('est désactivée si le commentaire contient plus de 255 caractères', async () => {
      // When
      await userEvent.clear(inputCommentaire)
      await userEvent.type(inputCommentaire, 'a'.repeat(256))
      await userEvent.tab()

      // Then
      expect(
        screen.getByText(
          'Vous avez dépassé le nombre maximal de caractères. Veuillez retirer des caractères.'
        )
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Créer/ })).toHaveAttribute(
        'disabled',
        ''
      )
    })
  })
})
