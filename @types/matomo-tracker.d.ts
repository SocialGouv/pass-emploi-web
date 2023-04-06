declare module 'matomo-tracker' {
  export default class MatomoTracker {
    constructor(siteId: string, url: string)

    track(params: {
      url: string
      rand: string
      apiv: 1
      action_name: string
      urlref?: string
      dimension1: 'conseiller'
      dimension2: string
      dimension3: string
    }): void
  }
}
