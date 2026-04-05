import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ToastItem, ModalKey, NotificationItem } from '@/types/Ui.types'
import { v4 as uuidv4 } from 'uuid'

export interface UiState {
  modals: Record<ModalKey, boolean>
  toasts: ToastItem[]
  notifications: NotificationItem[]
  notificationCount: number
  sidebarCollapsed: boolean
}

const initialState: UiState = {
  modals: {
    newLead: false,
    leadDetail: false,
    addInteraction: false,
  },
  toasts: [],
  notifications: [],
  notificationCount: 0,
  sidebarCollapsed: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<ModalKey>) => {
      state.modals[action.payload] = true
    },
    closeModal: (state, action: PayloadAction<ModalKey>) => {
      state.modals[action.payload] = false
    },
    addToast: (state, action: PayloadAction<Omit<ToastItem, 'id'>>) => {
      state.toasts.push({
        id: uuidv4(),
        ...action.payload,
      })
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
    addNotification: (state, action: PayloadAction<Omit<NotificationItem, 'id'>>) => {
      state.notifications.unshift({
        id: uuidv4(),
        ...action.payload,
      })
      state.notificationCount += 1
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find((n) => n.id === action.payload)
      if (notif && !notif.read) {
        notif.read = true
        state.notificationCount -= 1
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true
      })
      state.notificationCount = 0
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find((n) => n.id === action.payload)
      if (notif && !notif.read) {
        state.notificationCount -= 1
      }
      state.notifications = state.notifications.filter((n) => n.id !== action.payload)
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
  },
})

export const {
  openModal,
  closeModal,
  addToast,
  removeToast,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  toggleSidebar,
} = uiSlice.actions
export default uiSlice.reducer

// Selectors
export const selectModals = (state: any) => state.ui.modals
export const selectToasts = (state: any) => state.ui.toasts
export const selectNotifications = (state: any) => state.ui.notifications
export const selectUnreadCount = (state: any) => state.ui.notificationCount
export const selectSidebarCollapsed = (state: any) => state.ui.sidebarCollapsed
