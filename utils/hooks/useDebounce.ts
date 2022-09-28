import { useEffect, useState } from 'react'

export function useDebounce(value: string | undefined, delayInMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delayInMs)

    return () => clearTimeout(handler)
  }, [value, delayInMs])

  return debouncedValue
}
