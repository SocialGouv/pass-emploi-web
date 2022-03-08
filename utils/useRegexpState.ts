import { useState } from 'react'

export default function useRegexpState(regexp: RegExp): [
  { value: string; error?: string },
  (
    value:
      | ((prevState: { value: string; error?: string }) => {
          value: string
          error?: string
        })
      | { value: string; error?: string }
  ) => void,
  () => boolean,
  () => void
] {
  const [state, setState] = useState<{ value: string; error?: string }>({
    value: '',
  })

  function isValid(): boolean {
    return regexp.test(state.value)
  }

  function validate() {
    if (!isValid()) {
      setState({ ...state, error: 'Le format attendu ne correspond pas' })
    } else {
      setState({ value: state.value })
    }
  }

  return [state, setState, isValid, validate]
}
