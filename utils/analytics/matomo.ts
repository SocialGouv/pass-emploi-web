import MatomoTracker from 'matomo-tracker'

import { StructureConseiller } from 'interfaces/conseiller'

interface InitSettings {
  url: string
  siteId: string
  jsTrackerFile?: string
  phpTrackerFile?: string
  excludeUrlsPatterns?: RegExp[]
}

interface TrackPageSettings {
  customTitle: string
  structure: StructureConseiller | null
  aDesBeneficiaires: boolean | null
}

interface TrackEventSettings {
  structure: StructureConseiller
  categorie: string
  action: string
  nom: string
  aDesBeneficiaires: boolean | null
}

const numeroDimensionAvecBeneficiaires =
  process.env.NEXT_PUBLIC_MATOMO_DIMENSIONS_CONSEILLER_BENEFICIAIRES_STAGING ===
  'true'
    ? 8
    : 3

// to push custom events
function push(args: (number[] | string[] | number | string)[]): void {
  if (!window._paq) {
    window._paq = []
  }
  window._paq.push(args)
}

// initialize the tracker
export function init({
  url,
  siteId,
  jsTrackerFile = 'matomo.js',
  phpTrackerFile = 'matomo.php',
}: InitSettings): void {
  window._paq = window._paq !== null ? window._paq : []
  if (!url) {
    console.warn('Matomo disabled, please provide matomo url')
    return
  }

  push(['enableLinkTracking'])
  push(['setTrackerUrl', `${url}/${phpTrackerFile}`])
  push(['setSiteId', siteId])

  const scriptElement = document.createElement('script')
  const refElement = document.getElementsByTagName('script')[0]
  scriptElement.type = 'text/javascript'
  scriptElement.async = true
  scriptElement.defer = true
  scriptElement.src = `${url}/${jsTrackerFile}`
  if (refElement.parentNode) {
    refElement.parentNode.insertBefore(scriptElement, refElement)
  }
}

export function trackPage({
  structure,
  customTitle,
  aDesBeneficiaires,
}: TrackPageSettings): void {
  window._paq = window._paq !== null ? window._paq : []

  let previousPath = ''

  previousPath = location.pathname

  const path = window.location.pathname

  // We use only the part of the url without the querystring to ensure piwik is happy
  // It seems that piwik doesn't track well page with querystring
  const [pathname] = path.split('?')

  // In order to ensure that the page title had been updated,
  // we delayed pushing the tracking to the next tick.

  setTimeout(() => {
    if (previousPath) {
      push(['setReferrerUrl', `${previousPath}`])
    }
    push(['setCustomUrl', pathname])
    push(['setCustomDimension', 1, 'conseiller'])
    push(['setCustomDimension', 2, userStructureDimensionString(structure)])

    push([
      'setCustomDimension',
      numeroDimensionAvecBeneficiaires,
      avecBeneficiairesDimencsionString(aDesBeneficiaires),
    ])

    push(['setDocumentTitle', customTitle || document.title])
    push(['deleteCustomVariables', 'page'])

    push(['trackPageView'])

    previousPath = pathname
  }, 0)
}

export function trackEvent(trackEventSettings: TrackEventSettings): void {
  push(['setCustomDimension', 1, 'conseiller'])
  push([
    'setCustomDimension',
    2,
    userStructureDimensionString(trackEventSettings.structure),
  ])
  push([
    'setCustomDimension',
    numeroDimensionAvecBeneficiaires,
    avecBeneficiairesDimencsionString(trackEventSettings.aDesBeneficiaires),
  ])

  push([
    'trackEvent',
    trackEventSettings.categorie,
    trackEventSettings.categorie + ' ' + trackEventSettings.action,
    trackEventSettings.categorie + ' ' + trackEventSettings.nom,
  ])
}

export function trackEventBeneficiaire(
  trackEventSettings: Omit<TrackEventSettings, 'aDesBeneficiaires'>
): void {
  push(['setCustomDimension', 1, 'jeune'])
  push([
    'setCustomDimension',
    2,
    userStructureDimensionString(trackEventSettings.structure),
  ])
  push([
    'setCustomDimension',
    numeroDimensionAvecBeneficiaires,
    avecBeneficiairesDimencsionString(null),
  ])

  push([
    'trackEvent',
    trackEventSettings.categorie,
    trackEventSettings.categorie + ' ' + trackEventSettings.action,
    trackEventSettings.categorie + ' ' + trackEventSettings.nom,
  ])
}

// https://github.com/matomo-org/matomo-nodejs-tracker
// https://developer.matomo.org/api-reference/tracking-api
export function trackSSR({
  structure,
  customTitle,
  pathname,
  refererUrl,
  aDesBeneficiaires,
}: Required<TrackPageSettings> & {
  pathname: string
  refererUrl?: string
}): void {
  const url = process.env.NEXT_PUBLIC_MATOMO_SOCIALGOUV_URL
  const siteId = process.env.NEXT_PUBLIC_MATOMO_SOCIALGOUV_SITE_ID

  if (!url || !siteId) {
    console.warn('Matomo disabled, please provide matomo url')
    return
  }

  const matomo = new MatomoTracker(siteId, `${url}/matomo.php`)

  matomo.track({
    url: pathname,
    rand: Math.random().toString(10).slice(2, 18),
    apiv: 1,
    action_name: customTitle,
    urlref: refererUrl,
    dimension1: 'conseiller',
    dimension2: userStructureDimensionString(structure),
    dimension3: avecBeneficiairesDimencsionString(aDesBeneficiaires),
  })
}

function userStructureDimensionString(
  loginMode: StructureConseiller | null
): string {
  switch (loginMode) {
    case StructureConseiller.MILO:
      return 'Mission Locale'
    case StructureConseiller.POLE_EMPLOI:
      return 'Pôle emploi'
    case StructureConseiller.POLE_EMPLOI_BRSA:
      return 'Pôle emploi BRSA'
    case StructureConseiller.PASS_EMPLOI:
      return 'pass emploi'
    case null:
      return 'visiteur'
  }
}

function avecBeneficiairesDimencsionString(
  aDesBeneficiaires: boolean | null
): 'oui' | 'non' | 'non applicable' {
  if (aDesBeneficiaires === null) return 'non applicable'
  return aDesBeneficiaires ? 'oui' : 'non'
}
