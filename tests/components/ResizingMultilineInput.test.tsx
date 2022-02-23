import { fireEvent, render } from '@testing-library/react'
import ResizingMultilineInput from 'components/ResizingMultilineInput'

describe('<ResizingMultilineInput/>', () => {
  let form: HTMLSpanElement
  let span: HTMLSpanElement
  let textarea: HTMLTextAreaElement
  let handleFocus: jest.Mock
  let handleBlur: jest.Mock
  let handleChange: jest.Mock
  beforeEach(() => {
    // GIVEN
    handleFocus = jest.fn()
    handleBlur = jest.fn()
    handleChange = jest.fn()

    const { container } = render(
      <form>
        <ResizingMultilineInput
          name='multiline'
          style={{ padding: '10px', lineHeight: '20px' }}
          minRows={3}
          maxRows={7}
          onFocus={() => handleFocus()}
          onBlur={() => handleBlur()}
          onChange={() => handleChange()}
        />
      </form>
    )

    form = container.querySelector('form')!
    span = container.querySelector('span')!
    textarea = container.querySelector('textarea')!
  })

  it('contains a aria-hidden contenteditable span', () => {
    // THEN
    expect(span).toBeInTheDocument()
    expect(span).toHaveAttribute('contenteditable', 'true')
    expect(span).toHaveAttribute('aria-hidden', 'true')
  })

  it('contains a sr-only multiline textarea', () => {
    // THEN
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('aria-multiline', 'true')
    expect(textarea).toHaveClass('sr-only')
  })

  it('sets min-height', () => {
    // GIVEN
    expect(span).toHaveStyle('min-height: 80px')
  })

  it('sets max-height', () => {
    // GIVEN
    expect(span).toHaveStyle('max-height: 160px')
  })

  it('synchronises span text input to sr-only textarea', () => {
    // GIVEN
    expect(textarea).toHaveValue('')

    // WHEN
    span.innerText = 'new input\nvalue'
    span.dispatchEvent(new Event('input', { bubbles: true }))

    // THEN
    expect(textarea).toHaveValue('new input\nvalue')
  })

  it('fires onFocus event on textarea', () => {
    // WHEN
    textarea.focus()

    // THEN
    expect(handleFocus).toHaveBeenCalled()
  })

  it('fires onFocus event on span', () => {
    // WHEN
    span.focus()

    // THEN
    expect(handleFocus).toHaveBeenCalled()
  })

  it('fires onFocus event on textarea', () => {
    // GIVEN
    textarea.focus()

    // WHEN
    textarea.blur()

    // THEN
    expect(handleBlur).toHaveBeenCalled()
  })

  it('fires onFocus event on span', () => {
    // GIVEN
    span.focus()

    // WHEN
    span.blur()

    // THEN
    expect(handleBlur).toHaveBeenCalled()
  })

  it('fires onChange event', () => {
    // WHEN
    span.innerText = 'new input\nvalue'
    span.dispatchEvent(new Event('input', { bubbles: true }))

    // THEN
    expect(handleChange).toHaveBeenCalled()
  })

  it('clears input on form submit', () => {
    // GIVEN
    textarea.value = 'input value'
    span.innerText = 'input value'

    // WHEN
    fireEvent.submit(form)

    // THEN
    expect(textarea).toHaveValue('')
    expect(span.innerText).toEqual('')
  })
})
