import React from 'react'

import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'

export default function OnboardingListItem({
  item,
  illustration,
}: {
  item: string
  illustration: IllustrationName
}) {
  return (
    <li className='text-m-regular'>
      <IllustrationComponent
        name={illustration}
        focusable={false}
        aria-hidden={true}
        className='inline-block fill-primary w-[56px] h-[56px] [--secondary-fill:var(--color-additional_4_lighten)]'
      />
      {item}
    </li>
  )
}
