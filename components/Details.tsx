import React, {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import InfoAction from 'components/action/InfoAction'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Action } from 'interfaces/action'
import { toShortDate } from 'utils/date'

interface DetailsProps {
  summary: string
  children: ReactNode
}

function Details(
  { summary, children }: DetailsProps,
  ref: ForwardedRef<{ focusSummary: () => void }>
) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  useImperativeHandle(ref, () => ({
    focusSummary: () => detailsRef.current!.querySelector('summary')!.focus(),
  }))

  const [expanded, setExpanded] = useState<boolean>()

  useEffect(() => {
    function toggleExpanded() {
      setExpanded(detailsRef.current!.open)
    }

    const detailsNode = detailsRef.current!
    detailsNode.addEventListener('toggle', toggleExpanded)
    return () => detailsNode.removeEventListener('toggle', toggleExpanded)
  }, [])

  return (
    <details
      ref={detailsRef}
      className='bg-primary_lighten p-6 mt-8 rounded-base shadow-base'
    >
      <summary
        className={`text-m-bold text-primary relative flex justify-between items-center cursor-pointer ${expanded ? 'mb-5' : ''}`}
      >
        {summary}
        <IconComponent
          name={expanded ? IconName.ChevronUp : IconName.ChevronDown}
          title={`${expanded ? 'Cacher' : 'Voir'} ${summary}`}
          className='h-6 w-6 fill-current'
          focusable={false}
          aria-hidden={true}
        />
      </summary>

      {children}
    </details>
  )
}

export default forwardRef(Details)
