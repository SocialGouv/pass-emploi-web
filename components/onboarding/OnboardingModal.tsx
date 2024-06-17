import dynamic from 'next/dynamic'
import { ReactElement } from 'react'

import { Conseiller, StructureConseiller } from 'interfaces/conseiller'

const OnboardingMILOModal = dynamic(
  () => import('components/onboarding/OnboardingMILOModal')
)
const OnboardingPEModal = dynamic(
  () => import('components/onboarding/OnboardingPEModal')
)

type OnboardingModalProps = {
  conseiller: Conseiller
  onClose: () => void
}
export default function OnboardingModal(
  props: OnboardingModalProps
): ReactElement | null {
  switch (props.conseiller.structure) {
    case StructureConseiller.POLE_EMPLOI:
      return <OnboardingPEModal {...props} />
    case StructureConseiller.POLE_EMPLOI_BRSA:
    case StructureConseiller.POLE_EMPLOI_AIJ:
      return <OnboardingPEModal {...props} estPassEmploi={true} />
    case StructureConseiller.MILO:
      return <OnboardingMILOModal {...props} />
    case StructureConseiller.PASS_EMPLOI:
      return null
  }
}
