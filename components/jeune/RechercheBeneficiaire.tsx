import { FormEvent, useState } from 'react'

import { InputError } from 'components/ui/Form/InputError'
import ResettableTextInput from 'components/ui/Form/ResettableTextInput'
import IconComponent, { IconName } from 'components/ui/IconComponent'

interface RechercheBeneficiaireProps {
  onSearchFilterBy: (query: string) => void
  minCaracteres?: number
}

export default function RechercheBeneficiaire({
  onSearchFilterBy,
  minCaracteres,
}: RechercheBeneficiaireProps) {
  const [query, setQuery] = useState<string>('')
  const [error, setError] = useState<string>()

  function onReset() {
    setQuery('')
    setError(undefined)
    onSearchFilterBy('')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()

    if (minCaracteres && query.length < minCaracteres) {
      setError(`Veuillez saisir au moins ${minCaracteres} caractères`)
    } else {
      setError(undefined)
      onSearchFilterBy(query)
    }
  }

  return (
    <form role='search' onSubmit={onSubmit} className='grow max-w-[75%]'>
      <label
        htmlFor='rechercher-beneficiaires'
        className='text-base-medium text-content_color'
      >
        Rechercher un bénéficiaire par son nom ou prénom
      </label>
      {error && (
        <InputError id='rechercher-beneficiaires--error'>{error}</InputError>
      )}
      <div className='flex mt-3'>
        <ResettableTextInput
          id='rechercher-beneficiaires'
          value={query}
          onChange={setQuery}
          onReset={onReset}
          invalid={Boolean(error)}
          className='flex-1 border border-solid border-grey_700 rounded-l-base border-r-0 text-base-medium text-primary_darken'
        />

        <button
          className='flex p-3 items-center text-base-bold text-primary border border-primary rounded-r-base hover:bg-primary_lighten'
          type='submit'
        >
          <IconComponent
            name={IconName.Search}
            focusable={false}
            aria-hidden={true}
            className='w-6 h-6 fill-current'
          />
          <span className='ml-1 sr-only layout_s:not-sr-only'>Rechercher</span>
        </button>
      </div>
    </form>
  )
}
