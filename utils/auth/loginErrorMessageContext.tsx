'use client'

import { createContext, ReactNode, useContext } from 'react'

type LoginErrorMessageState = [
  string | undefined,
  (updatedLoginError: string | undefined) => void,
]

const LoginErrorMessageContext = createContext<
  LoginErrorMessageState | undefined
>(undefined)

export function LoginErrorMessageProvider({
  state,
  children,
}: {
  state: LoginErrorMessageState
  children: ReactNode
}) {
  return (
    <LoginErrorMessageContext.Provider value={state}>
      {children}
    </LoginErrorMessageContext.Provider>
  )
}

export function useLoginErrorMessage(): LoginErrorMessageState {
  const loginErrorMessageContext = useContext(LoginErrorMessageContext)
  if (!loginErrorMessageContext) {
    throw new Error(
      'useLoginErrorMessage must be used within LoginErrorMessageContextProvider'
    )
  }
  return loginErrorMessageContext
}
