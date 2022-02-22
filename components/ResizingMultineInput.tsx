import {
  ChangeEventHandler,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react'

interface ResizingMultineInputProps {
  onChange: ChangeEventHandler<HTMLTextAreaElement>
  id?: string
  minRows?: number
  maxRows?: number
  className?: string
  placeholder?: string
  onFocus?: () => void
  onBlur?: () => void
}

export default function ResizingMultineInput({
  onChange,
  id,
  minRows = 1,
  maxRows,
  className,
  placeholder,
  onFocus,
  onBlur,
}: ResizingMultineInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const spanRef = useRef<HTMLSpanElement>(null)

  const [heightStyle, setHeightStyle] = useState<{
    minHeight: string
    maxHeight: string
  }>({ minHeight: '0px', maxHeight: '' })
  const [placeholderStyle, setPlaceholderStyle] = useState<string>('')

  function triggerTextAreaChange(e: FormEvent<HTMLSpanElement>): void {
    const value: string = e.currentTarget.innerText
    const input: HTMLTextAreaElement = inputRef.current!

    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value'
    )!.set!
    valueSetter.call(inputRef.current, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }

  usePlaceholderWhenEmpty(placeholder)
  useAutoresizingHeight(minRows, maxRows)
  useClearInputOnSubmit()

  return (
    <>
      <textarea
        id={id ?? undefined}
        ref={inputRef}
        aria-multiline={true}
        className='sr-only'
        placeholder={placeholder}
        onChange={onChange}
      />
      <span
        aria-hidden={true}
        ref={spanRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        style={heightStyle}
        className={`${
          className ?? ''
        } overflow-y-auto ${placeholderStyle} empty:before:text-bleu`}
        onFocus={onFocus}
        onBlur={onBlur}
        onInput={triggerTextAreaChange}
      />
    </>
  )

  function useAutoresizingHeight(min: number, max?: number): void {
    useEffect(() => {
      function fetchStyleValue(propName: string): number {
        const match: RegExpMatchArray | null = window
          .getComputedStyle(spanRef.current!, null)
          .getPropertyValue(propName)
          .match(/\d+/)
        return match ? parseInt(match[0], 10) : 0
      }

      const paddingTop = fetchStyleValue('padding-top')
      const paddingBottom = fetchStyleValue('padding-bottom')
      const lineHeight = fetchStyleValue('line-height')
      setHeightStyle({
        minHeight: `${paddingTop + paddingBottom + min * lineHeight}px`,
        maxHeight: max
          ? `${paddingTop + paddingBottom + max * lineHeight}px`
          : '',
      })
    }, [max, min])
  }

  function useClearInputOnSubmit(): void {
    useEffect(() => {
      const clearEditableSpan = () => {
        spanRef.current!.innerText = ''
      }
      const form = inputRef.current!.form!

      form.addEventListener('submit', clearEditableSpan)
      return () => {
        form.removeEventListener('submit', clearEditableSpan)
      }
    }, [])
  }

  function usePlaceholderWhenEmpty(value?: string): void {
    useEffect(() => {
      if (value) {
        const placeholderContent = value.replace(/\s/g, '_')
        setPlaceholderStyle(`empty:before:content-['${placeholderContent}']`)
      } else {
        setPlaceholderStyle('')
      }
    }, [value])
  }
}
