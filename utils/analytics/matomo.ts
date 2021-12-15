interface InitSettings {
  url: string
  siteId: string
  jsTrackerFile?: string
  phpTrackerFile?: string
  excludeUrlsPatterns?: RegExp[]
}

interface TrackSettings {
  customTitle?: string
}

// to push custom events
function push(args: (number[] | string[] | number | string)[]): void {
  if (!window._paq) {
    window._paq = []
  }
  window._paq.push(args)
}

// initialize the tracker
function init({
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

function track({ customTitle }: TrackSettings): void {
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

    push(['setDocumentTitle', customTitle || document.title])
    push(['deleteCustomVariables', 'page'])

    push(['trackPageView'])

    previousPath = pathname
    console.log('title', customTitle)
  }, 0)
}

export { init, track }
