import dynamic from 'next/dynamic'

import { Conseiller, StructureConseiller } from 'interfaces/conseiller'

const OnboardingPEModal = dynamic(
  () => import('components/onboarding/OnboardingPEModal')
)
const OnboardingAVenirModal = dynamic(
  () => import('components/onboarding/OnboardingAVenirModal')
)

type OnboardingModalProps = {
  conseiller: Conseiller
  onClose: () => void
}
export default function OnboardingModal(props: OnboardingModalProps) {
  switch (props.conseiller.structure) {
    case StructureConseiller.POLE_EMPLOI:
      return <OnboardingPEModal {...props} />
    default:
      return <OnboardingAVenirModal {...props} />
  }
}
