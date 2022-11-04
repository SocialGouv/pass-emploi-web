export function encodeBase64(input: string): string {
  return new Buffer(input).toString('base64')
}

export function decodeBase64(input: string): string {
  return new Buffer(input, 'base64').toString()
}
