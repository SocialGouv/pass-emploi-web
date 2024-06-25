import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import EditionRdvPage, {
  EditionRdvProps,
} from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/edition-rdv/EditionRdvPage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { BeneficiaireFromListe } from 'interfaces/beneficiaire'
import { estUserPoleEmploi } from 'interfaces/conseiller'
import {
  estClos,
  estCreeParSiMILO,
  Evenement,
  isCodeTypeAnimationCollective,
} from 'interfaces/evenement'
import {
  isTypeAnimationCollective,
  TypeEvenementReferentiel,
} from 'interfaces/referentiel'
import {
  getDetailsEvenement,
  getTypesRendezVous,
} from 'services/evenements.service'
import { getJeunesDuConseillerServerSide } from 'services/jeunes.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
import redirectedFromHome from 'utils/redirectedFromHome'

type EditionRdvSearchParams = Partial<{
  idRdv: string
  type: string
  idJeune: string
  redirectUrl: string
}>

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: EditionRdvSearchParams
}): Promise<Metadata> {
  const { evenement, evenementTypeAC, lectureSeule } =
    await buildProps(searchParams)

  if (evenement) {
    return {
      title: lectureSeule
        ? `Detail - ${evenement.titre} `
        : `Modifier le rendez-vous ${evenement.titre}`,
    }
  }

  return {
    title: evenementTypeAC
      ? 'Créer une animation collective'
      : 'Créer un rendez-vous',
  }
}

export default async function EditionRdv({
  searchParams,
}: {
  searchParams?: EditionRdvSearchParams
}) {
  const props = await buildProps(searchParams)
  const referer = headers().get('referer')
  const redirectUrl = searchParams?.redirectUrl

  const returnTo =
    redirectUrl ||
    (referer && !redirectedFromHome(referer) ? referer : '/mes-jeunes')

  if (props.evenement) {
    return (
      <>
        <PageRetourPortal lien={returnTo} />
        <PageHeaderPortal
          header={
            props.evenementTypeAC
              ? 'Détail de l’animation collective'
              : 'Détail du rendez-vous'
          }
        />

        <EditionRdvPage returnTo={returnTo} {...props} />
      </>
    )
  }

  return (
    <>
      <PageRetourPortal lien={returnTo} />
      <PageHeaderPortal
        header={
          props.evenementTypeAC
            ? 'Créer une animation collective'
            : 'Créer un rendez-vous'
        }
      />

      <EditionRdvPage returnTo={returnTo} {...props} />
    </>
  )
}

async function buildProps(
  searchParams: EditionRdvSearchParams | undefined
): Promise<Omit<EditionRdvProps, 'returnTo'>> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (estUserPoleEmploi(user)) redirect('/mes-jeunes')

  if (searchParams?.idRdv) {
    const evenement = await getDetailsEvenement(searchParams.idRdv, accessToken)
    if (!evenement) notFound()

    const beneficiaires = await getJeunesDuConseillerServerSide(
      user.id,
      accessToken
    )
    return buildPropsModificationEvenement(evenement, beneficiaires)
  }

  const typesEvenements = await getTypesRendezVous(accessToken)
  return buildPropsCreationEvenement(
    typesEvenements,
    searchParams?.type === 'ac',
    searchParams?.idJeune
  )
}

function buildPropsModificationEvenement(
  evenement: Evenement,
  beneficiaires: BeneficiaireFromListe[]
): Omit<EditionRdvProps, 'returnTo'> {
  const estUneAC = isCodeTypeAnimationCollective(evenement.type.code)
  const aUnBeneficiaireInscritALEvenement: boolean =
    Boolean(evenement) &&
    evenement.jeunes.some((beneficiaireEvenement) =>
      beneficiaires.some(
        (beneficiaireConseiller) =>
          beneficiaireConseiller.id === beneficiaireEvenement.id
      )
    )
  const conseillerEstObservateur =
    !estUneAC && !aUnBeneficiaireInscritALEvenement

  const lectureSeule =
    evenement &&
    (conseillerEstObservateur ||
      estCreeParSiMILO(evenement) ||
      estClos(evenement))

  return {
    conseillerEstObservateur,
    lectureSeule,
    evenement,
    typesRendezVous: [],
    evenementTypeAC: estUneAC,
  }
}

function buildPropsCreationEvenement(
  typesEvenements: TypeEvenementReferentiel[],
  creationAC: boolean,
  idBeneficiaire?: string
): Omit<EditionRdvProps, 'returnTo'> {
  const typesRdvCEJ: TypeEvenementReferentiel[] = []
  const typesRdvAC: TypeEvenementReferentiel[] = []
  typesEvenements.forEach((t) => {
    if (isTypeAnimationCollective(t)) typesRdvAC.push(t)
    else typesRdvCEJ.push(t)
  })

  return {
    conseillerEstObservateur: false,
    lectureSeule: false,
    typesRendezVous: creationAC ? typesRdvAC : typesRdvCEJ,
    evenementTypeAC: creationAC,
    idBeneficiaire,
  }
}
