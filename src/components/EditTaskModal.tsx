import { useState } from 'react'
import { usePlannerStore } from '../store/usePlannerStore'
import type { MasterTask, TaskInstance } from '../store/usePlannerStore'
import { X } from 'lucide-react'

const COLORS = [
  '#FF6B6B', // Red
  '#FFA07A', // Light Coral
  '#FFD93D', // Yellow
  '#6BCB77', // Green
  '#4D96FF', // Blue
  '#9D4EDD', // Purple
  '#FF006E', // Pink
  '#FB5607', // Orange
  '#00B4D8', // Cyan
  '#808080', // Gray
]

interface EditTaskModalProps {
  task?: MasterTask // For creating/editing master tasks
  instance?: TaskInstance // For editing specific instances
  onClose: () => void
}

export function EditTaskModal({ task, instance, onClose }: EditTaskModalProps) {
  const { addMasterTask, updateMasterTask, updateInstance } = usePlannerStore()
  
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [color, setColor] = useState(task?.color || COLORS[0])
  const [duration, setDuration] = useState(instance?.duration?.toString() || '1')

  const handleSave = () => {
    if (instance) {
      updateMasterTask(instance.masterTaskId, { title, description, color })
      updateInstance(instance.id, { duration: parseFloat(duration) || 1 })
    } else if (task) {
      // Editing an existing master task
      updateMasterTask(task.id, { title, description, color })
    } else {
      // Creating a new master task
      addMasterTask({ title, description, color })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-800">
            {instance ? 'Edit Scheduled Task' : (task ? 'Edit Master Task' : 'Create New Task')}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-24 resize-none"
              placeholder="Add details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {instance && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <span className="text-sm text-gray-500">hours</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:bg-blue-300"
          >
            {task || instance ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
