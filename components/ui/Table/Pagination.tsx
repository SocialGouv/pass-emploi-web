import React, { ReactNode } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface PaginationProps {
  pageCourante: number
  nombreDePages: number
  allerALaPage: (page: number) => void
  nomListe?: string
  nombrePagesLimite?: number
}

export default function Pagination({
  pageCourante,
  nombreDePages,
  allerALaPage,
  nomListe,
  nombrePagesLimite,
}: PaginationProps) {
  const dernierePage = nombrePagesLimite
    ? Math.min(nombreDePages, nombrePagesLimite)
    : nombreDePages

  function renderPaginationPage(page: number) {
    return (
      <PaginationItem
        key={`Page-${page}`}
        page={page}
        label={`Page ${page}`}
        onClick={allerALaPage}
        isActive={pageCourante === page}
      >
        {page}
      </PaginationItem>
    )
  }

  function renderEllipse(position: string) {
    return <li key={`ellipse-${position}`}>&#8230;</li>
  }

  function renderPagination() {
    const pages = []

    const debutGroupe = Math.max(
      1,
      Math.min(dernierePage - 4, pageCourante - 2)
    )
    const finGroupe = Math.min(dernierePage, debutGroupe + 4)

    for (let page = debutGroupe; page <= finGroupe; page++) {
      pages.push(renderPaginationPage(page))
    }

    if (debutGroupe > 2) pages.unshift(renderEllipse('debut'))
    if (debutGroupe > 1) pages.unshift(renderPaginationPage(1))
    if (finGroupe < dernierePage - 1) pages.push(renderEllipse('fin'))
    if (finGroupe < dernierePage) pages.push(renderPaginationPage(dernierePage))

    return pages
  }

  return (
    <nav aria-label={`pagination ${nomListe ?? ''}`}>
      <ul className='flex items-center justify-center gap-1'>
        <PaginationItem
          page={1}
          label='Première page'
          onClick={allerALaPage}
          disabled={pageCourante <= 1}
        >
          <IconComponent
            name={IconName.FirstPage}
            className={`fill-inherit w-6 h-6`}
          />
        </PaginationItem>
        <PaginationItem
          page={pageCourante - 1}
          label='Page précédente'
          onClick={allerALaPage}
          disabled={pageCourante <= 1}
        >
          <div className='flex pr-2 gap-2'>
            <IconComponent
              name={IconName.ChevronLeft}
              className='fill-inherit w-6 h-6'
            />
            Page précédente
          </div>
        </PaginationItem>
        {renderPagination()}
        <PaginationItem
          page={pageCourante + 1}
          label='Page suivante'
          onClick={allerALaPage}
          disabled={pageCourante >= dernierePage}
        >
          <div className='flex pl-2 gap-2'>
            Page suivante
            <IconComponent
              name={IconName.ChevronRight}
              className={`fill-inherit w-6 h-6`}
            />
          </div>
        </PaginationItem>
        <PaginationItem
          page={dernierePage}
          label='Dernière page'
          onClick={allerALaPage}
          disabled={pageCourante >= dernierePage}
        >
          <IconComponent
            name={IconName.LastPage}
            className={`fill-inherit w-6 h-6`}
          />
        </PaginationItem>
      </ul>
    </nav>
  )
}

interface PaginationItemProps {
  page: number
  label: string
  onClick: (page: number) => void
  children: ReactNode
  disabled?: boolean
  isActive?: boolean
}

function PaginationItem({
  children,
  label,
  onClick,
  page,
  disabled,
  isActive,
}: PaginationItemProps) {
  const activeStyle = isActive && 'bg-primary text-white'
  const hoverStyle =
    !disabled && !isActive && 'hover:bg-primary_lighten hover:text-primary'

  return (
    <li>
      <button
        onClick={() => onClick(page)}
        aria-label={label}
        aria-current={isActive && 'page'}
        title={label}
        disabled={disabled}
        className={`rounded-full ${
          typeof children === 'number' ? 'px-3' : 'px-1'
        } py-1 fill-primary_darken disabled:cursor-not-allowed disabled:fill-grey_700 disabled:text-grey_700 ${activeStyle} ${hoverStyle}`}
        type='button'
      >
        {children}
      </button>
    </li>
  )
}
