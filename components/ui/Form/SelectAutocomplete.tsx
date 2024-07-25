import React, { forwardRef, useEffect, useState } from 'react'

import Input, { InputProps } from 'components/ui/Form/Input'
import { IconName } from 'components/ui/IconComponent'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import FailureAlert from 'components/ui/Notifications/FailureAlert'

export type OptionAutocomplete = { id: string; value: string }

const SelectAutocomplete = forwardRef<
  HTMLInputElement,
  InputProps & {
    options: OptionAutocomplete[]
    onContactSupport: () => void
  }
>(
  (
    {
      disabled,
      id,
      invalid,
      multiple,
      onChange,
      options,
      required,
      onBlur,
      value,
      onContactSupport,
      ['aria-describedby']: ariaDescribedBy,
      ...rest
    },
    ref
  ) => {
    const [navigateurEstEdge, setNavigateurEstEdge] = useState<boolean>(false)
    const mailSupportObject =
      'Portail conseiller Mission Locale - problème champ d’autocomplétion sous Edge'

    useEffect(() => {
      setNavigateurEstEdge(/Edg/.test(navigator.userAgent))
    }, [])

    return (
      <>
        {navigateurEstEdge && (
          <FailureAlert
            label='Cette fonctionnalité peut être dégradée sur votre navigateur (Edge).'
            sub={
              <p>
                Nous recommandons l’usage de Firefox ou de Chrome. Si vous ne
                pouvez pas changer de navigateur, veuillez&nbsp;
                <span className={'text-warning hover:text-primary'}>
                  <ExternalLink
                    href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_MAIL}?subject=${encodeURIComponent(mailSupportObject)}`}
                    label={'contacter le support'}
                    iconName={IconName.OutgoingMail}
                    onClick={onContactSupport}
                  />
                </span>
              </p>
            }
          />
        )}

        <Input
          type='text'
          id={id}
          ref={ref}
          list={`${id}--options`}
          multiple={multiple ?? false}
          autoComplete='off'
          aria-autocomplete='list'
          aria-required={required}
          onChange={onChange}
          invalid={invalid}
          disabled={disabled}
          onBlur={onBlur}
          value={value}
          aria-describedby={ariaDescribedBy + (invalid ? ` ${id}--error` : '')}
          {...rest}
        />
        <datalist id={`${id}--options`}>
          {options.map(({ id: optionId, value: optionValue }) => (
            <option key={optionId} value={optionValue}>
              {optionValue}
            </option>
          ))}
        </datalist>
      </>
    )
  }
)
SelectAutocomplete.displayName = 'SelectAutocomplete'

export default SelectAutocomplete
