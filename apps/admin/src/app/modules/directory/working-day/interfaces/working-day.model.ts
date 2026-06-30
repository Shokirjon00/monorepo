export interface TimeRange {
  start: string;
  end: string;
  enabled: boolean;
}

export interface IResponse<T = any> {
  status: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string | string[]>;
}

