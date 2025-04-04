import { render } from '@testing-library/react'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import EditionRdvPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/edition-rdv/EditionRdvPage'
import EditionRdv, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/edition-rdv/page'
import { desItemsBeneficiaires } from 'fixtures/beneficiaire'
import {
  typesAnimationCollective,
  typesEvenement,
  typesEvenementCEJ,
  unEvenement,
} from 'fixtures/evenement'
import { structureFTCej } from 'interfaces/structure'
import { getBeneficiairesDuConseillerServerSide } from 'services/beneficiaires.service'
import {
  getDetailsEvenement,
  getTypesRendezVous,
} from 'services/evenements.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/edition-rdv/EditionRdvPage'
)
jest.mock('services/evenements.service')
jest.mock('services/beneficiaires.service')

describe('EditionRdvPage server side', () => {
  beforeEach(() => {
    // Given
    ;(headers as jest.Mock).mockReturnValue(new Map())
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { id: 'id-conseiller-1', structure: 'MILO' },
      accessToken: 'accessToken',
    })
    ;(getTypesRendezVous as jest.Mock).mockResolvedValue(typesEvenement())
  })

  it("récupère la page d'origine", async () => {
    // Given
    ;(headers as jest.Mock).mockReturnValue(new Map([['referer', '/agenda']]))

    // When
    render(await EditionRdv({}))

    // Then
    expect(EditionRdvPage).toHaveBeenCalledWith(
      expect.objectContaining({
        returnTo: '/agenda',
      }),
      undefined
    )
  })

  it('ignore le referer si besoin', async () => {
    // Given
    ;(headers as jest.Mock).mockReturnValue(
      new Map([
        [
          'referer',
          'http://localhost:3000/?redirectUrl=%2Fmes-jeunes%2Fedition-rdv',
        ],
      ])
    )
    // When
    render(await EditionRdv({}))

    // Then
    expect(EditionRdvPage).toHaveBeenCalledWith(
      expect.objectContaining({
        returnTo: '/mes-jeunes',
      }),
      undefined
    )
  })

  describe('Rendez-vous', () => {
    it('prépare la page', async () => {
      // When
      const metadata = await generateMetadata({})
      render(await EditionRdv({}))

      // Then
      expect(metadata).toEqual({ title: 'Créer un rendez-vous' })
      expect(EditionRdvPage).toHaveBeenCalledWith(
        {
          returnTo: '/mes-jeunes',
          typesRendezVous: typesEvenementCEJ(),
          evenementTypeAC: false,
          conseillerEstObservateur: false,
          lectureSeule: false,
        },
        undefined
      )
    })

    it('récupère le jeune concerné', async () => {
      // When
      render(
        await EditionRdv({
          searchParams: Promise.resolve({ idJeune: 'id-jeune' }),
        })
      )

      // Then
      expect(EditionRdvPage).toHaveBeenCalledWith(
        expect.objectContaining({ idBeneficiaire: 'id-jeune' }),
        undefined
      )
    })

    it('récupère le rendez-vous concerné', async () => {
      // Given
      const evenement = unEvenement()
      ;(getDetailsEvenement as jest.Mock).mockResolvedValue(evenement)
      ;(getBeneficiairesDuConseillerServerSide as jest.Mock).mockResolvedValue(
        desItemsBeneficiaires()
      )

      // When
      const searchParams = { idRdv: 'id-rdv' }
      const metadata = await generateMetadata({
        searchParams: Promise.resolve(searchParams),
      })
      render(await EditionRdv({ searchParams: Promise.resolve(searchParams) }))

      // Then
      expect(getDetailsEvenement).toHaveBeenCalledWith('id-rdv', 'accessToken')
      expect(getTypesRendezVous).not.toHaveBeenCalled()
      expect(metadata).toEqual({
        title: 'Modifier le rendez-vous Prise de nouvelles par téléphone',
      })
      expect(EditionRdvPage).toHaveBeenCalledWith(
        expect.objectContaining({ evenement }),
        undefined
      )
    })

    it("renvoie une 404 si le rendez-vous n'existe pas", async () => {
      // Given
      ;(getDetailsEvenement as jest.Mock).mockResolvedValue(undefined)

      // When
      const promise = EditionRdv({
        searchParams: Promise.resolve({ idRdv: 'id-rdv' }),
      })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  describe('Animation collective', () => {
    beforeEach(() => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { id: 'id-conseiller-1', structure: 'MILO' },
        accessToken: 'accessToken',
      })
      ;(getBeneficiairesDuConseillerServerSide as jest.Mock).mockResolvedValue(
        desItemsBeneficiaires()
      )
      ;(getTypesRendezVous as jest.Mock).mockResolvedValue(typesEvenement())
    })

    it('prépare la page', async () => {
      // When
      const searchParams = { type: 'ac' }
      const metadata = await generateMetadata({
        searchParams: Promise.resolve(searchParams),
      })
      render(await EditionRdv({ searchParams: Promise.resolve(searchParams) }))

      // Then
      expect(metadata).toEqual({ title: 'Créer une animation collective' })
      expect(EditionRdvPage).toHaveBeenCalledWith(
        {
          returnTo: '/mes-jeunes',
          typesRendezVous: typesAnimationCollective(),
          evenementTypeAC: true,
          conseillerEstObservateur: false,
          lectureSeule: false,
        },
        undefined
      )
    })

    it('récupère le référentiel des types d’événements de catégorie AC', async () => {
      // When
      render(
        await EditionRdv({ searchParams: Promise.resolve({ type: 'ac' }) })
      )

      // Then
      expect(getTypesRendezVous).toHaveBeenCalledWith('accessToken')
      expect(EditionRdvPage).toHaveBeenCalledWith(
        expect.objectContaining({
          typesRendezVous: typesAnimationCollective(),
        }),
        undefined
      )
    })

    it('récupère le jeune concerné', async () => {
      // When
      render(
        await EditionRdv({
          searchParams: Promise.resolve({ idJeune: 'id-jeune' }),
        })
      )

      // Then
      expect(EditionRdvPage).toHaveBeenCalledWith(
        expect.objectContaining({ idBeneficiaire: 'id-jeune' }),
        undefined
      )
    })

    it('récupère l’animation collective concernée', async () => {
      // Given
      const animationCollective = unEvenement({
        type: { code: 'ATELIER', label: 'Atelier' },
        jeunes: [{ id: 'id-autre-jeune', prenom: 'Sheldon', nom: 'Cooper' }],
      })
      ;(getDetailsEvenement as jest.Mock).mockResolvedValue(animationCollective)

      // When
      const searchParams = { idRdv: 'id-rdv', type: 'ac' }
      const metadata = await generateMetadata({
        searchParams: Promise.resolve(searchParams),
      })
      render(await EditionRdv({ searchParams: Promise.resolve(searchParams) }))

      // Then
      expect(getDetailsEvenement).toHaveBeenCalledWith('id-rdv', 'accessToken')
      expect(metadata).toEqual({
        title: `Modifier le rendez-vous ${animationCollective.titre}`,
      })
      expect(EditionRdvPage).toHaveBeenCalledWith(
        expect.objectContaining({
          evenement: animationCollective,
          evenementTypeAC: true,
        }),
        undefined
      )
    })

    it("renvoie une 404 si l’animation collective n'existe pas", async () => {
      // Given
      ;(getDetailsEvenement as jest.Mock).mockResolvedValue(undefined)

      // When
      const promise = EditionRdv({
        searchParams: Promise.resolve({ idRdv: 'id-rdv', type: 'ac' }),
      })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  describe('quand l’utilisateur est France Travail', () => {
    it('renvoie sur la liste des jeunes', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: {
          id: 'id-conseiller-1',
          structure: structureFTCej,
        },
        accessToken: 'accessToken',
      })

      // When
      const promise = EditionRdv({})

      // Then
      await expect(promise).rejects.toEqual(
        new Error('NEXT_REDIRECT /mes-jeunes')
      )
      expect(redirect).toHaveBeenCalledWith('/mes-jeunes')
    })
  })
})
