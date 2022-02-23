import {
  ChangeEventHandler,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import styles from 'styles/components/ResizingMultilineInput.module.css'

interface ResizingMultilineInputProps {
  onChange: ChangeEventHandler<HTMLTextAreaElement>
  id?: string
  minRows?: number
  maxRows?: number
  className?: string
  placeholder?: string
  onFocus?: () => void
  onBlur?: () => void
}

export default function ResizingMultilineInput({
  onChange,
  id,
  minRows = 1,
  maxRows,
  className,
  placeholder,
  onFocus,
  onBlur,
}: ResizingMultilineInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const spanRef = useRef<HTMLSpanElement>(null)

  const [heightStyle, setHeightStyle] = useState<{
    minHeight: string
    maxHeight: string
  }>({ minHeight: '0px', maxHeight: '' })

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
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
      />
      <span
        aria-hidden={true}
        ref={spanRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        style={heightStyle}
        className={`${className ?? ''} overflow-y-auto ${
          placeholder ? styles.placeholder : ''
        }`}
        onFocus={onFocus}
        onBlur={onBlur}
        onInput={triggerTextAreaChange}
        data-placeholder={placeholder}
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
}
