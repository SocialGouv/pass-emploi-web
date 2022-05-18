import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResizingMultilineInput from 'components/ui/ResizingMultilineInput'

describe('<ResizingMultilineInput/>', () => {
  let form: HTMLSpanElement
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
          style={{ padding: '10px', lineHeight: '20px', width: '1px' }}
          minRows={3}
          maxRows={7}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
        />
      </form>
    )

    form = container.querySelector('form')!
    textarea = container.querySelector('textarea')!
  })

  it('contains a multiline textarea', () => {
    // THEN
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('aria-multiline', 'true')
  })

  it('fires onFocus event on textarea', () => {
    // WHEN
    textarea.focus()

    // THEN
    expect(handleFocus).toHaveBeenCalled()
  })

  it('fires onBlur event on textarea', () => {
    // GIVEN
    textarea.focus()

    // WHEN
    textarea.blur()

    // THEN
    expect(handleBlur).toHaveBeenCalled()
  })

  it('fires onChange event', () => {
    // WHEN
    fireEvent.change(textarea, { target: { value: 'new value' } })

    // THEN
    expect(handleChange).toHaveBeenCalled()
  })

  it('resizes depending on content', () => {
    // GIVEN
    jest.spyOn(textarea, 'scrollHeight', 'get').mockReturnValue(120)

    // WHEN
    fireEvent.change(textarea, { target: { value: 'new value' } })

    // THEN
    expect(textarea).toHaveStyle({ height: '120px' })
  })

  it('limits size depending on minRows', () => {
    // GIVEN
    jest.spyOn(textarea, 'scrollHeight', 'get').mockReturnValue(20)

    // WHEN
    fireEvent.change(textarea, { target: { value: 'new value' } })

    // THEN
    expect(textarea).toHaveStyle({ height: '80px' })
  })

  it('limits size depending on maxRows', () => {
    // GIVEN
    jest.spyOn(textarea, 'scrollHeight', 'get').mockReturnValue(200)

    // WHEN
    fireEvent.change(textarea, { target: { value: 'new value' } })

    // THEN
    expect(textarea).toHaveStyle({ height: '160px' })
  })

  it('clears input on form submit', async () => {
    // GIVEN
    await userEvent.type(textarea, 'input value')
    expect(textarea).toHaveValue('input value')

    // WHEN
    fireEvent.submit(form)

    // THEN
    expect(textarea).toHaveValue('')
  })

  it('resets height to min height on form submit', async () => {
    // GIVEN
    jest.spyOn(textarea, 'scrollHeight', 'get').mockReturnValue(200)
    await userEvent.type(textarea, 'input value')
    expect(textarea).toHaveValue('input value')

    // WHEN
    fireEvent.submit(form)

    // THEN
    expect(textarea).toHaveStyle({ height: '80px' })
  })
})
