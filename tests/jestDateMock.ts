/**
 * Mock constructeur de Date avec jest
 *
 * Usage:
 *
 * import { onBeforeEach, onAfterEach } from '../jestDateMock';
 *
 * describe('', () => {
 *     beforeEach(onBeforeEach);
 *     afterEach(onAfterEach);
 *
 *     ...
 * });
 */

const randomDate: string = '2018-12-31T23:59:59.000Z'
const DateConstructor: any = Date

export const onBeforeEach = (): void => {
  ;(global as any).Date = jest.fn((...props) => {
    if (props.length) {
      return new DateConstructor(...props)
    }

    return new DateConstructor(randomDate)
  })

  Object.assign(Date, DateConstructor)
}

export const onAfterEach = (): void => {
  global.Date = DateConstructor
}
