import type { ScoreCategory } from './Scoring.types';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string | null;
  durationMs: number;
}

export type ModalKey = 'newLead' | 'leadDetail' | 'addInteraction';

export type ModalState = Record<ModalKey, boolean>;

export interface NotificationItem {
  id: string;
  leadId: string;
  leadName: string;
  company: string;
  score: number;
  category: ScoreCategory;
  message: string;
  createdAt: string; // ISO 8601
  read: boolean;
}

export interface SidebarState {
  collapsed: boolean;
}