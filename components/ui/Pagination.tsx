import React, { ReactNode } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface PaginationProps {
  pageCourante: number
  nombreDePages: number
  allerALaPage: (page: number) => void
  nomListe?: string
}

export default function Pagination({
  pageCourante,
  nombreDePages,
  allerALaPage,
  nomListe,
}: PaginationProps) {
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
    return <span key={`ellipse-${position}`}>&#8230;</span>
  }

  function getPages() {
    const pages = []

    if (nombreDePages <= 6) {
      for (let page = 1; page <= nombreDePages; page++) {
        pages.push(renderPaginationPage(page))
      }
      return pages
    }

    if (pageCourante > 3) {
      pages.push(renderPaginationPage(1))
    }

    if (pageCourante > 4) {
      pages.push(renderEllipse('debut'))
    }

    let groupStart: number = Math.max(1, pageCourante - 2)
    if (pageCourante >= nombreDePages - 1) {
      groupStart = nombreDePages - 4
    }

    for (
      let page = groupStart;
      page <= Math.min(groupStart + 4, nombreDePages);
      page++
    ) {
      pages.push(renderPaginationPage(page))
    }

    if (nombreDePages > 6 && pageCourante < nombreDePages - 3) {
      pages.push(renderEllipse('fin'))
    }

    if (nombreDePages > 5 && pageCourante < nombreDePages - 2) {
      pages.push(renderPaginationPage(nombreDePages))
    }

    return pages
  }

  return (
    <nav aria-label={`pagination ${nomListe ?? ''}`}>
      <ul className='flex justify-between items-center'>
        <PaginationItem
          page={1}
          label='Première page'
          onClick={allerALaPage}
          disabled={pageCourante <= 1}
        >
          <IconComponent
            name={IconName.ChevronFirst}
            className={`fill-inherit w-6 h-6`}
          />
        </PaginationItem>
        <PaginationItem
          page={pageCourante - 1}
          label='Page précédente'
          onClick={allerALaPage}
          disabled={pageCourante <= 1}
        >
          <IconComponent
            name={IconName.ChevronLeft}
            className='fill-inherit w-6 h-6'
          />
        </PaginationItem>
        {getPages()}
        <PaginationItem
          page={pageCourante + 1}
          label='Page suivante'
          onClick={allerALaPage}
          disabled={pageCourante >= nombreDePages}
        >
          <IconComponent
            name={IconName.ChevronRight}
            className={`fill-inherit w-6 h-6`}
          />
        </PaginationItem>
        <PaginationItem
          page={nombreDePages}
          label='Dernière page'
          onClick={allerALaPage}
          disabled={pageCourante >= nombreDePages}
        >
          <IconComponent
            name={IconName.ChevronLast}
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
  const activeStyle = isActive && 'bg-primary text-blanc'
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
        className={`rounded-full px-3 py-1 fill-primary_darken disabled:cursor-not-allowed disabled:fill-grey_700 disabled:text-grey_700 ${activeStyle} ${hoverStyle}`}
      >
        {children}
      </button>
    </li>
  )
}
