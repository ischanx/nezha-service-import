// 定义类型
export interface CarrierData {
  [carrier: string]: string;
}

export interface PingData {
  [province: string]: CarrierData;
}

export interface TaskData {
  cover: number;
  duration: number;
  enable_trigger_task: boolean;
  enable_show_in_service: boolean;
  fail_trigger_tasks: string[];
  fail_trigger_tasks_raw: string;
  max_latency: number;
  min_latency: number;
  name: string;
  notification_group_id: number;
  recover_trigger_tasks: string[];
  recover_trigger_tasks_raw: string;
  skip_servers: Record<string, unknown>;
  target: string;
  type: number;
}

export interface TaskResult {
  name: string;
  target: string;
  success: boolean;
  response: any;
}