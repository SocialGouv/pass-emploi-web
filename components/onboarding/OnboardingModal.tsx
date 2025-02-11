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
): ReactElement {
  switch (props.conseiller.structure) {
    case StructureConseiller.POLE_EMPLOI:
      return <OnboardingPEModal {...props} />
    case StructureConseiller.POLE_EMPLOI_BRSA:
    case StructureConseiller.POLE_EMPLOI_AIJ:
    case StructureConseiller.CONSEIL_DEPT:
    case StructureConseiller.AVENIR_PRO:
    case StructureConseiller.FT_ACCOMPAGNEMENT_INTENSIF:
    case StructureConseiller.FT_ACCOMPAGNEMENT_GLOBAL:
    case StructureConseiller.FT_EQUIP_EMPLOI_RECRUT:
      return <OnboardingPEModal {...props} estPassEmploi={true} />
    case StructureConseiller.MILO:
      return <OnboardingMILOModal {...props} />
  }
}
