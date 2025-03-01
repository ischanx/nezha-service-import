import axios from 'axios';
import { TaskData } from '../app/const';

export const addTask = async (data: TaskData, options: { baseUrl: string, cookie: string }) => {
  const response = await axios.post(`${options.baseUrl}/api/v1/service`, data, {
    headers: {
      accept: '*/*',
      'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      pragma: 'no-cache',
      priority: 'u=1, i',
      'sec-ch-ua':
        '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      cookie: options.cookie,
      Referer: `${options.baseUrl}/dashboard/service`,
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  });

  return response.data;
};


export const generateTaskData = (options: { name: string, target: string } & Partial<TaskData>): TaskData => {
  const defaultData: TaskData = {
    cover: 0,
    duration: 30,
    enable_trigger_task: true,
    enable_show_in_service: false,
    fail_trigger_tasks: [],
    fail_trigger_tasks_raw: '',
    max_latency: 0,
    min_latency: 0,
    name: options.name,
    notification_group_id: 0,
    recover_trigger_tasks: [],
    recover_trigger_tasks_raw: '',
    skip_servers: {},
    target: `${options.target}:80`,
    type: 3,
  };

  // 合并默认值和用户提供的选项
  return {
    ...defaultData,
    ...options,
  };
};