export default function redirectedFromHome(referer: string): boolean {
  return referer.split('?')[0].endsWith('/')
}
