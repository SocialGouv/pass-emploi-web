import { ComponentPropsWithoutRef, FC, SVGProps } from 'react'

import IllustrationArrowForward from 'assets/images/illustration-arrow-forward.svg'
import IllustrationCheck from 'assets/images/illustration-check.svg'
import IllustrationChecklist from 'assets/images/illustration-checklist.svg'
import IllustrationCurvyArrow from 'assets/images/illustration-curvy-arrow.svg'
import IllustrationDelete from 'assets/images/illustration-delete.svg'
import IllustrationError from 'assets/images/illustration-error.svg'
import IllustrationEtablissement from 'assets/images/illustration-etablissement.svg'
import IllustrationEvent from 'assets/images/illustration-event-grey.svg'
import IllustrationEventWhite from 'assets/images/illustration-event-white.svg'
import IllustrationForum from 'assets/images/illustration-forum.svg'
import IllustrationInfo from 'assets/images/illustration-info.svg'
import IllustrationMaintenance from 'assets/images/illustration-maintenance.svg'
import IllustrationMessagerie from 'assets/images/illustration-messagerie.svg'
import IllustrationPeople from 'assets/images/illustration-people.svg'
import IllustrationQuestion from 'assets/images/illustration-question-mark.svg'
import IllustrationSablier from 'assets/images/illustration-sablier.svg'
import IllustrationSearch from 'assets/images/illustration-search.svg'
import IllustrationSend from 'assets/images/illustration-send-grey.svg'
import IllustrationSendWhite from 'assets/images/illustration-send-white.svg'
import IllustrationLogoCEJ from 'assets/images/logo_app_cej.svg'
import IllustrationLogoPassemploi from 'assets/images/logo_pass_emploi.svg'
import IllustrationLogoCD from 'assets/logo-cd.svg'
import IllustrationLogoFT from 'assets/logo-ft.svg'
import IllustrationLogoMilo from 'assets/logo-milo.svg'

export enum IllustrationName {
  ArrowForward = 'ArrowForward',
  Check = 'Check',
  Checklist = 'Checklist',
  CurvyArrow = 'CurvyArrow',
  Delete = 'Delete',
  Error = 'Error',
  Etablissement = 'Etablissement',
  Event = 'Event',
  EventWhite = 'EventWhite',
  Forum = 'Forum',
  Info = 'Info',
  LogoCEJ = 'LogoCEJ',
  LogoPassemploi = 'LogoPassemploi',
  LogoCD = 'LogoCD',
  LogoFT = 'LogoFT',
  LogoMilo = 'LogoMilo',
  Maintenance = 'Maintenance',
  Messagerie = 'Messagerie',
  People = 'People',
  Question = 'Question',
  Sablier = 'Sablier',
  Search = 'Search',
  Send = 'Send',
  SendWhite = 'SendWhite',
}

const illustrationsByName: {
  [key in IllustrationName]: FC<SVGProps<SVGElement>>
} = {
  [IllustrationName.ArrowForward]: IllustrationArrowForward,
  [IllustrationName.Check]: IllustrationCheck,
  [IllustrationName.Checklist]: IllustrationChecklist,
  [IllustrationName.CurvyArrow]: IllustrationCurvyArrow,
  [IllustrationName.Delete]: IllustrationDelete,
  [IllustrationName.Error]: IllustrationError,
  [IllustrationName.Etablissement]: IllustrationEtablissement,
  [IllustrationName.Event]: IllustrationEvent,
  [IllustrationName.EventWhite]: IllustrationEventWhite,
  [IllustrationName.Forum]: IllustrationForum,
  [IllustrationName.Info]: IllustrationInfo,
  [IllustrationName.LogoCEJ]: IllustrationLogoCEJ,
  [IllustrationName.LogoMilo]: IllustrationLogoMilo,
  [IllustrationName.LogoCD]: IllustrationLogoCD,
  [IllustrationName.LogoFT]: IllustrationLogoFT,
  [IllustrationName.LogoPassemploi]: IllustrationLogoPassemploi,
  [IllustrationName.Maintenance]: IllustrationMaintenance,
  [IllustrationName.Messagerie]: IllustrationMessagerie,
  [IllustrationName.People]: IllustrationPeople,
  [IllustrationName.Question]: IllustrationQuestion,
  [IllustrationName.Sablier]: IllustrationSablier,
  [IllustrationName.Search]: IllustrationSearch,
  [IllustrationName.Send]: IllustrationSend,
  [IllustrationName.SendWhite]: IllustrationSendWhite,
}

type IllustrationsComponentProps = ComponentPropsWithoutRef<'svg'> & {
  name: IllustrationName
  title?: string
}
export default function IllustrationComponent({
  name,
  className,
  ...props
}: IllustrationsComponentProps) {
  const Icon = illustrationsByName[name]
  const withSecondaryFill =
    (className ?? '') +
    (className?.includes('--secondary-fill')
      ? ''
      : ' [--secondary-fill:theme(colors.warning)]')
  return <Icon className={withSecondaryFill} {...props} />
}
