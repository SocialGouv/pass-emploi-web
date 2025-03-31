import { Settings } from 'luxon'

// FIXME ça marche pas du tout !!!
Settings.throwOnInvalid = true

declare module 'luxon' {
  interface TSSettings {
    throwOnInvalid: true
  }
}
