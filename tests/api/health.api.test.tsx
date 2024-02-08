/**
 * @jest-environment node
 */

import { GET } from 'app/api/health/route'

describe('GET api/health', () => {
  it('renvoie une 200', async () => {
    // When
    const health = await GET()

    // Then
    expect(health.status).toEqual(200)
    expect(await health.json()).toEqual({ status: 'ok' })
  })
})
