import { KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react'

interface TabListProps {
  children: ReactNode
  label: string
  className?: string
}

export default function TabList({ children, className, label }: TabListProps) {
  const [tabs, setTabs] = useState<HTMLLIElement[]>()
  const tablistRef = useRef<HTMLUListElement>(null)

  function switchTabOnSideArrow({ key }: KeyboardEvent<HTMLUListElement>) {
    if (!tabs || !tabs.length) return
    const indexCurrentTab = tabs.findIndex(
      (tab) => document.activeElement === tab
    )

    if (key === 'ArrowLeft') {
      const previousTab =
        indexCurrentTab === 0
          ? tabs[tabs.length - 1]
          : tabs[indexCurrentTab - 1]
      previousTab.focus()
      previousTab.click()
    }

    if (key === 'ArrowRight') {
      const nextTab =
        indexCurrentTab === tabs.length - 1
          ? tabs[0]
          : tabs[indexCurrentTab + 1]
      nextTab.focus()
      nextTab.click()
    }
  }

  useEffect(() => {
    const focusableTabs: NodeListOf<HTMLLIElement> =
      tablistRef.current!.querySelectorAll('li>button[role="tab"]')
    setTabs(Array.from(focusableTabs))
  }, [])

  return (
    <ul
      role='tablist'
      ref={tablistRef}
      className={`flex ${className ?? ''}`}
      aria-label={label}
      onKeyDown={switchTabOnSideArrow}
    >
      {children}
    </ul>
  )
}
