import { LucideIcon } from 'lucide-react'

type StatCardProps = {
  title: string
  value: number
  color: string
  icon: LucideIcon // This type comes from the icon library
}

export function StatCard({ title, value, color, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-20 text-white`}>
          <Icon size={24} />
        </div>
        <span className="text-3xl font-bold text-white">{value}%</span>
      </div>

      <h3 className="text-gray-400 font-medium">{title}</h3>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 h-1.5 mt-4 rounded-full overflow-hidden">
        <div
          className={`h-full ${color}`}
          style={{ width: `${value}%`, transition: 'width 0.5s ease-out' }}
        />
      </div>
    </div>
  )
}
