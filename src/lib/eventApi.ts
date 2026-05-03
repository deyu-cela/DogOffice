import { apiFetch } from './api';

// 與後端 internal/events/event_model.go 的常數對齊。
// `start_run` 與 `submit_leaderboard` 由後端內部寫入，前端不需要送。
export type EventType =
  | 'office_upgrade'
  | 'buy_shop_item';

type LogPayload = {
  type: EventType;
  payload?: Record<string, unknown>;
};

// 紀錄一筆遊戲事件。Server 自填 user_id 與 created_at。
// Fire-and-forget：未登入或網路失敗都靜默忽略，不阻擋遊戲流程。
export function logEvent(type: EventType, payload?: Record<string, unknown>): void {
  const body: LogPayload = { type, payload };
  void apiFetch<unknown>('/events', { method: 'POST', body, auth: true }).catch(() => {
    // 事件 log 是 best-effort，失敗不影響遊戲體驗
  });
}
