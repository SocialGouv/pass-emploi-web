import {
  ChangeEvent,
  ChangeEventHandler,
  CSSProperties,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from 'react'

interface ResizingMultilineInputProps {
  onChange: ChangeEventHandler<HTMLTextAreaElement>
  id?: string
  name?: string
  ref?: MutableRefObject<HTMLTextAreaElement>
  minRows?: number
  maxRows?: number
  className?: string
  style?: CSSProperties
  placeholder?: string
  onFocus?: () => void
  onBlur?: () => void
}

export default function ResizingMultilineInput({
  onChange,
  id,
  name,
  ref,
  minRows = 1,
  maxRows,
  className,
  style,
  placeholder,
  onFocus,
  onBlur,
}: ResizingMultilineInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const actualRef = ref ?? inputRef

  const [height, setHeight] = useState<number | undefined>(undefined)
  const [minHeight, setMinHeight] = useState<number>(0)

  function computeHeight(e: ChangeEvent<HTMLTextAreaElement>) {
    function fetchStyleValue(propName: string): number {
      const match: RegExpMatchArray | null = window
        .getComputedStyle(e.target, null)
        .getPropertyValue(propName)
        .match(/\d+/)
      return match ? parseInt(match[0], 10) : 0
    }

    const paddingTop = fetchStyleValue('padding-top')
    const paddingBottom = fetchStyleValue('padding-bottom')
    const lineHeight = fetchStyleValue('line-height') || 16
    const scrollHeight = e.target.scrollHeight
    const newMinHeight = paddingTop + paddingBottom + minRows * lineHeight
    const newMaxHeight = maxRows
      ? paddingTop + paddingBottom + maxRows * lineHeight
      : scrollHeight

    setHeight(Math.min(Math.max(scrollHeight, newMinHeight), newMaxHeight))
    setMinHeight(newMinHeight)
  }

  useEffect(() => {
    const clearInput = () => {
      actualRef.current!.value = ''
      setHeight(minHeight)
    }

    const form = actualRef.current!.form
    if (!form) {
      console.warn('ResizingMultilineInput should be in a <form>')
      return
    }

    if (minHeight > 0) form.addEventListener('submit', clearInput)
    return () => form.removeEventListener('submit', clearInput)
  }, [actualRef, minHeight])

  return (
    <textarea
      id={id ?? undefined}
      name={name ?? undefined}
      ref={actualRef}
      aria-multiline={true}
      rows={minRows}
      className={className ?? undefined}
      style={{ height, ...style }}
      placeholder={placeholder}
      onFocus={onFocus}
      onBlur={onBlur}
      onChange={(e) => {
        computeHeight(e)
        onChange(e)
      }}
    />
  )
}
