export enum TelegramSubscriptionStatus {
  NOT_REGISTERED = -2,
  UNVERIFIED = -1,
  DISABLED = 0,
  ENABLED = 1
}

export interface ITelegramStatusResponse {
  status: TelegramSubscriptionStatus;
  telegramBotSubscriberId?: string;
  telegramLink?: string;
}
