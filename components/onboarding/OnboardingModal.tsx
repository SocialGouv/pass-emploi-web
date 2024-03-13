import dynamic from 'next/dynamic'

import { Conseiller, StructureConseiller } from 'interfaces/conseiller'

const OnboardingMILOModal = dynamic(
  () => import('components/onboarding/OnboardingMILOModal')
)
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
    case StructureConseiller.POLE_EMPLOI_BRSA:
      return <OnboardingPEModal {...props} estBRSA={true} />
    case StructureConseiller.MILO:
      return <OnboardingMILOModal {...props} />
    default:
      return <OnboardingAVenirModal {...props} />
  }
}
