import { AppProcess } from 'types'

type ProcessTableProps = {
  processes: AppProcess[]
}

export function ProcessTable({ processes }: ProcessTableProps) {
  const handleKill = async (pid: number) => {
    // Optimistic UI: You could remove it from state immediately,
    // but the next poll will fix it anyway.
    await window.api.killProcess(pid)
  }

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-gray-400 font-medium">Top Processes</h3>
      </div>

      <table className="w-full text-left text-sm text-gray-400">
        <thead className="bg-gray-700/50 text-gray-200 uppercase font-medium">
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">CPU</th>
            <th className="px-6 py-3">Mem</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {processes.map((proc) => (
            <tr key={proc.pid} className="hover:bg-gray-700/30 transition-colors">
              <td className="px-6 py-4 font-medium text-white">{proc.name}</td>
              <td className="px-6 py-4 text-blue-400">{proc.cpu.toFixed(1)}%</td>
              <td className="px-6 py-4 text-purple-400">{proc.memory.toFixed(1)}%</td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => handleKill(proc.pid)}
                  className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1 rounded-lg text-xs transition-all border border-red-500/30"
                >
                  Kill
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
