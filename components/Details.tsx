import React, {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface DetailsProps {
  summary: string
  children: ReactNode
  initiallyOpened?: boolean
}

function Details(
  { summary, children, initiallyOpened = false }: DetailsProps,
  ref: ForwardedRef<{ focusSummary: () => void }>
) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  useImperativeHandle(ref, () => ({
    focusSummary: () => detailsRef.current!.querySelector('summary')!.focus(),
  }))

  const [expanded, setExpanded] = useState<boolean>(initiallyOpened)

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
      open={initiallyOpened}
    >
      <summary
        className={`text-m-bold text-primary relative flex justify-between items-center cursor-pointer ${expanded ? 'mb-5' : ''}`}
        title={`${expanded ? 'Cacher' : 'Voir'} ${summary}`}
      >
        {summary}
        <IconComponent
          name={expanded ? IconName.ChevronUp : IconName.ChevronDown}
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
