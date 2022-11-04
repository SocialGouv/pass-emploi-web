import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'

import ResizingMultilineInput from 'components/ui/Form/ResizingMultilineInput'

describe('<ResizingMultilineInput/>', () => {
  let submitButton: HTMLButtonElement
  let textarea: HTMLTextAreaElement
  let handleFocus: jest.Mock
  let handleBlur: jest.Mock
  let handleChange: jest.Mock
  let inputRef
  beforeEach(() => {
    // GIVEN
    inputRef = createRef<HTMLTextAreaElement>()
    handleFocus = jest.fn()
    handleBlur = jest.fn()
    handleChange = jest.fn()

    render(
      <form onSubmit={(e) => e.preventDefault()}>
        <ResizingMultilineInput
          inputRef={inputRef}
          style={{ padding: '10px', lineHeight: '20px', width: '1px' }}
          minRows={3}
          maxRows={7}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
        />
        <button type='submit'>Soumettre</button>
      </form>
    )

    submitButton = screen.getByRole('button', { name: 'Soumettre' })
    textarea = screen.getByRole('textbox')
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

  it('fires onChange event', async () => {
    // WHEN
    await userEvent.type(textarea, 'new value')

    // THEN
    expect(handleChange).toHaveBeenCalled()
  })

  it('resizes depending on content', async () => {
    // GIVEN
    jest.spyOn(textarea, 'scrollHeight', 'get').mockReturnValue(120)

    // WHEN
    await userEvent.type(textarea, 'new value')

    // THEN
    expect(textarea).toHaveStyle({ height: '120px' })
  })

  it('limits size depending on minRows', async () => {
    // GIVEN
    jest.spyOn(textarea, 'scrollHeight', 'get').mockReturnValue(20)

    // WHEN
    await userEvent.type(textarea, 'new value')

    // THEN
    expect(textarea).toHaveStyle({ height: '80px' })
  })

  it('limits size depending on maxRows', async () => {
    // GIVEN
    jest.spyOn(textarea, 'scrollHeight', 'get').mockReturnValue(200)

    // WHEN
    await userEvent.type(textarea, 'new value')

    // THEN
    expect(textarea).toHaveStyle({ height: '160px' })
  })

  it('clears input on form submit', async () => {
    // GIVEN
    await userEvent.type(textarea, 'input value')
    expect(textarea).toHaveValue('input value')

    // WHEN
    await userEvent.click(submitButton)

    // THEN
    expect(textarea).toHaveValue('')
  })

  it('resets height to min height on form submit', async () => {
    // GIVEN
    jest.spyOn(textarea, 'scrollHeight', 'get').mockReturnValue(200)
    await userEvent.type(textarea, 'input value')
    expect(textarea).toHaveValue('input value')

    // WHEN
    await userEvent.click(submitButton)

    // THEN
    expect(textarea).toHaveStyle({ height: '80px' })
  })
})
