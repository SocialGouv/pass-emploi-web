import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import InputError from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { ValueWithError } from 'components/ValueWithError'
import { SimpleConseiller } from 'interfaces/conseiller'
import { StructureReaffectation } from 'interfaces/structure'

type ChoixConseillerProps = {
  name: string
  onInput: () => void
  onChoixConseiller: (conseiller: SimpleConseiller) => void
  idConseillerSelectionne?: string
  structureReaffectation?: StructureReaffectation
  errorInput?: string
  errorChoice?: string
}

function ChoixConseiller(
  {
    idConseillerSelectionne,
    structureReaffectation,
    name,
    onChoixConseiller,
    onInput,
    errorInput,
    errorChoice,
  }: ChoixConseillerProps,
  ref: ForwardedRef<{
    resetRechercheConseiller: () => void
  }>
) {
  const id = 'conseiller-' + name

  const inputRef = useRef<HTMLInputElement>(null)
  const listeRef = useRef<HTMLFieldSetElement>(null)

  const [queryConseiller, setQueryConseiller] = useState<ValueWithError>({
    value: '',
  })
  const [choixConseillers, setChoixConseillers] = useState<
    SimpleConseiller[] | undefined
  >()

  const [rechercheConseillerEnCours, setRechercheConseillerEnCours] =
    useState<boolean>(false)

  function handleInputQuery(value: string) {
    setChoixConseillers(undefined)
    setQueryConseiller({ value })
    onInput()
  }

  useImperativeHandle(ref, () => ({
    resetRechercheConseiller: resetRechercheConseiller,
  }))

  function resetRechercheConseiller() {
    inputRef.current!.value = ''
    setChoixConseillers(undefined)
    setQueryConseiller({ value: '' })
  }

  async function rechercherConseiller() {
    if (queryConseiller.value.length < 2) return
    if (choixConseillers) return

    const { getConseillers } = await import('services/conseiller.service')
    setRechercheConseillerEnCours(true)
    const conseillers = await getConseillers(
      queryConseiller.value,
      structureReaffectation
    )
    if (conseillers.length) setChoixConseillers(conseillers)
    else {
      setQueryConseiller({
        ...queryConseiller,
        error: 'Aucun conseiller ne correspond',
      })
    }
    setRechercheConseillerEnCours(false)
  }

  function choisirConseiller(conseiller: SimpleConseiller): void {
    if (conseiller.id !== idConseillerSelectionne) {
      onChoixConseiller(conseiller)
    }
  }

  useEffect(() => {
    if (queryConseiller.error) inputRef.current!.focus()
    else if (choixConseillers?.length) {
      listeRef.current!.setAttribute('tabIndex', '-1')
      listeRef.current!.focus()
    }
  }, [choixConseillers, queryConseiller.error])

  return (
    <>
      <Label htmlFor={id}>E-mail ou nom et prénom du conseiller</Label>
      {queryConseiller.error && (
        <InputError id={id + '--error'} className='mb-2'>
          {queryConseiller.error}
        </InputError>
      )}
      {errorInput && (
        <InputError id={id + '--error'} className='mb-2'>
          {errorInput}
        </InputError>
      )}

      <div className='flex'>
        <Input
          type='search'
          id={id}
          onChange={handleInputQuery}
          required={true}
          invalid={Boolean(queryConseiller.error || errorInput)}
          ref={inputRef}
        />

        <Button
          className='ml-4 shrink-0'
          label={'Rechercher un conseiller ' + name}
          style={ButtonStyle.SECONDARY}
          disabled={queryConseiller.value.length < 2}
          type='button'
          onClick={rechercherConseiller}
          isLoading={rechercheConseillerEnCours}
        >
          <IconComponent
            name={IconName.Search}
            focusable={false}
            aria-hidden={true}
            className='w-6 h-6'
          />
          Rechercher un conseiller
        </Button>
      </div>

      {choixConseillers && choixConseillers.length > 0 && (
        <>
          {errorChoice && (
            <InputError
              ref={(e) => e?.focus()}
              id={'choix-' + name + '--error'}
              className='mb-2'
            >
              {errorChoice}
            </InputError>
          )}
          <fieldset
            ref={listeRef}
            className='grid grid-cols-[auto_1fr_2fr] gap-2 pb-2'
          >
            <legend className='sr-only'>Choix du conseiller {name}</legend>
            {choixConseillers.map((conseiller) => (
              <label
                key={conseiller.id}
                className={`grid grid-cols-subgrid grid-rows-1 col-span-3 cursor-pointer rounded-base p-4 ${idConseillerSelectionne === conseiller.id ? 'bg-primary_lighten shadow-m' : 'shadow-base'} focus-within:bg-primary_lighten hover:bg-primary_lighten`}
              >
                <input
                  type='radio'
                  name={'choix-' + name}
                  checked={idConseillerSelectionne === conseiller.id}
                  required={true}
                  onChange={() => choisirConseiller(conseiller)}
                  aria-describedby={
                    errorChoice ? 'choix-' + name + '--error' : undefined
                  }
                />

                <span className='text-base-bold'>
                  {conseiller.firstName} {conseiller.lastName}
                </span>
                {conseiller.email && (
                  <>
                    <span className='sr-only'>, e-mail : </span>
                    {conseiller.email}
                  </>
                )}
                {!conseiller.email && (
                  <span aria-label='e-mail non renseignée'>-</span>
                )}
              </label>
            ))}
          </fieldset>
        </>
      )}
    </>
  )
}

export default forwardRef(ChoixConseiller)
