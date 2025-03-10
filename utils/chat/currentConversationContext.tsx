import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'

import { BeneficiaireEtChat } from 'interfaces/beneficiaire'

type CurrentConversationState = BeneficiaireEtChat | undefined
type CurrentConversationStateHook = [
  CurrentConversationState,
  Dispatch<SetStateAction<CurrentConversationState>>,
]

const CurrentConversationContext = createContext<
  CurrentConversationStateHook | undefined
>(undefined)

export function CurrentConversationProvider({
  children,
  stateForTests,
  setterForTests,
}: {
  children: ReactNode
  stateForTests?: BeneficiaireEtChat
  setterForTests?: Dispatch<SetStateAction<CurrentConversationState>>
}) {
  const [currentConversation, setCurrentConversation] = useState<
    CurrentConversationState | undefined
  >(stateForTests)
  const setter = setterForTests ?? setCurrentConversation

  return (
    <CurrentConversationContext.Provider value={[currentConversation, setter]}>
      {children}
    </CurrentConversationContext.Provider>
  )
}

export function useCurrentConversation(): CurrentConversationStateHook {
  const currentConversationContext = useContext(CurrentConversationContext)
  if (!currentConversationContext) {
    throw new Error(
      'useCurrentConversation must be used within CurrentConversationProvider'
    )
  }
  return currentConversationContext
}
