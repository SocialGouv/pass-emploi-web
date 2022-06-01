import IconComponent, { IconName } from 'components/ui/IconComponent'

export default function SortIcon({
  isSorted,
  isDesc,
}: {
  isSorted: boolean
  isDesc: boolean
}) {
  return (
    <IconComponent
      name={isSorted ? IconName.ArrowDown : IconName.ArrowDouble}
      focusable='false'
      aria-hidden='true'
      className={`w-6 h-6 ${isDesc ? 'rotate-180' : ''}`}
    />
  )
}
