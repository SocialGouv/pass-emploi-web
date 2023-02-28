import { useEffect, useState } from 'react'

export function useDebounce<T = string | undefined>(
  value: T,
  delayInMs: number
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delayInMs)

    return () => clearTimeout(handler)
  }, [value, delayInMs])

  return debouncedValue
}
