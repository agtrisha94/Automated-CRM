/**
 * NotificationsPanel Component
 * Dropdown panel showing HOT lead alerts
 */
import { useAppDispatch, useAppSelector } from '@/store'
import { selectNotifications, selectUnreadCount, markAllNotificationsRead, removeNotification } from '@/store/slices/uiSlice'
import { Button } from '@/components/ui'
import type { NotificationItem } from '@/types/Ui.types'

export function NotificationsPanel({ isOpen }: { isOpen: boolean }) {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectNotifications)
  const unreadCount = useAppSelector(selectUnreadCount)

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead())
  }

  const handleRemoveNotification = (id: string) => {
    dispatch(removeNotification(id))
  }

  if (!isOpen) return null

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">
          Notifications {unreadCount > 0 && <span className="text-red-500">({unreadCount})</span>}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">No notifications yet</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif: NotificationItem) => (
              <div
                key={notif.id}
                className={`p-3 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">🔥 {notif.leadName}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{notif.company}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveNotification(notif.id)}
                    className="text-slate-400 hover:text-slate-600 text-lg"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-slate-100">
          <Button variant="secondary" size="sm" className="w-full text-xs">
            View All Notifications
          </Button>
        </div>
      )}
    </div>
  )
}
