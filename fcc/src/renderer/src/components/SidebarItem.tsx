import { LucideIcon } from 'lucide-react'
import { View } from 'types'

type SidebarItemProps = {
  view: View
  activeView: View
  label: string
  icon: LucideIcon
  onClick: (view: View) => void
}

export function SidebarItem({ view, activeView, label, icon: Icon, onClick }: SidebarItemProps) {
  // Check if this item is currently selected
  const isActive = activeView === view

  return (
    <button
      onClick={() => onClick(view)}
      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  )
}
