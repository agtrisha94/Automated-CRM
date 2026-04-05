/**
 * Notifications API Service
 * Handles notification endpoints (NestJS backend)
 * Used for HOT lead alerts from n8n webhook
 */
import { nestjsClient } from '../clients'
import type { NotificationItem } from '@/types/Ui.types'
import { config } from '../config'

export interface NotificationsListResponse {
  data: NotificationItem[]
  total: number
  unreadCount: number
}

/**
 * Get all notifications (HOT lead alerts)
 */
export async function getNotifications(): Promise<NotificationsListResponse> {
  if (config.USE_MOCKS) {
    // Mock: return empty notifications (no HOT leads yet in mock)
    return {
      data: [],
      total: 0,
      unreadCount: 0,
    }
  }

  const { data } = await nestjsClient.get<NotificationsListResponse>('/notifications')
  return data
}

/**
 * Mark all notifications as read
 * Resets unread count in badge
 */
export async function markAllRead(): Promise<void> {
  if (config.USE_MOCKS) {
    // Mock: no-op
    return
  }

  await nestjsClient.put('/notifications/read', {})
}
