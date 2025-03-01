'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

// 导入示例数据
import ipv4Data from '../../public/ipv4.json';
import ipv6Data from '../../public/ipv6.json';

import { TaskResult, PingData, TaskData } from './const';
import { generateTaskData } from '@/helper';
export default function Home() {
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [cookie, setCookie] = useState<string>('');
  const [results, setResults] = useState<TaskResult[]>([]);
  const [progress, setProgress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(30);
  const [maxLatency, setMaxLatency] = useState<number>(0);
  const [minLatency, setMinLatency] = useState<number>(0);
  const [isApiValid, setIsApiValid] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');

  // 验证API连接
  const validateApi = async () => {
    if (!baseUrl || !cookie) {
      setIsApiValid(false);
      setValidationMessage('请输入基础URL和Cookie');
      return false;
    }

    try {
      setValidationMessage('正在验证API连接...');
      const res = await axios.post('/api/list', {
        baseUrl,
        cookie,
      });
      if (res.data) {
        setIsApiValid(true);
        setValidationMessage('API连接验证成功');
        return true;
      } else {
        setIsApiValid(false);
        setValidationMessage('API连接验证失败');
        return false;
      }
    } catch (error: any) {
      setIsApiValid(false);
      setValidationMessage(`API连接验证失败: ${error.message}`);
      return false;
    }
  };

  // 当baseUrl或cookie变化时重置验证状态
  useEffect(() => {
    setIsApiValid(false);
    setValidationMessage('');
  }, [baseUrl, cookie]);

  // 处理URL输入完成时的自动补全
  const handleUrlChange = (url: string) => {
    let processedUrl = url.trim();

    // 自动补全协议
    if (
      !processedUrl.startsWith('http://') &&
      !processedUrl.startsWith('https://')
    ) {
      processedUrl = 'https://' + processedUrl;
    }

    setBaseUrl(processedUrl);
  };

  // 添加单个任务
  const addTask = async (data: TaskData) => {
    try {
      // 使用 Next.js API 路由代理请求
      const res = await axios.post('/api/import', {
        baseUrl,
        cookie,
        data,
      });
      // 检查响应中的 success 字段
      if (res.data && res.data.success) {
        return { success: true, data: res.data };
      } else {
        return { success: false, error: res.data || '未知错误' };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response ? error.response.data : error.message,
      };
    }
  };

  // 添加所有任务
  const addAllTasks = async (pingDataObj: PingData) => {
    setResults([]);
    let newResults: TaskResult[] = [];
    let total = 0;
    let completed = 0;
    let successCount = 0;
    let failCount = 0;

    // 计算总任务数
    for (const province in pingDataObj) {
      total += Object.keys(pingDataObj[province]).length;
    }

    setProgress(`进度: 0/${total}`);

    for (const province in pingDataObj) {
      const carriers = pingDataObj[province];
      for (const carrier in carriers) {
        const name = `${province}${carrier}`;
        const taskData = generateTaskData({
          name,
          target: carriers[carrier],
          duration,
          max_latency: maxLatency,
          min_latency: minLatency,
        });

        const result = await addTask(taskData);
        completed++;

        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }

        setProgress(`进度: ${completed}/${total}`);

        newResults.push({
          name,
          target: carriers[carrier],
          success: result.success,
          response: result.success ? result.data : result.error,
        });

        // 更新结果显示
        setResults([...newResults]);
      }
    }

    setProgress(
      `完成! 共添加 ${completed} 个任务，成功 ${successCount} 个，失败 ${failCount} 个`
    );
    return newResults;
  };

  // 处理添加任务
  const handleAddTasks = async (dataType: 'ipv4' | 'ipv6') => {
    if (!baseUrl) {
      setResults([
        { name: '错误', target: '', success: false, response: '请输入基础URL' },
      ]);
      return;
    }

    // 验证URL是否有效
    let isValidUrl = false;
    try {
      const url = new URL(baseUrl);
      if (['http:', 'https:'].includes(url.protocol)) {
        isValidUrl = true;
      } else {
        setResults([
          {
            name: '错误',
            target: '',
            success: false,
            response: 'URL必须以http://或https://开头',
          },
        ]);
        return;
      }
    } catch (error) {
      setResults([
        {
          name: '错误',
          target: '',
          success: false,
          response: 'URL格式不正确，请输入有效的URL',
        },
      ]);
      return;
    }

    // 如果URL无效，不继续执行
    if (!isValidUrl) {
      return;
    }

    if (!cookie) {
      setResults([
        { name: '错误', target: '', success: false, response: '请输入Cookie' },
      ]);
      return;
    }

    try {
      setIsLoading(true);

      // 先验证API连接
      const isValid = await validateApi();
      if (!isValid) {
        setResults([
          {
            name: '错误',
            target: '',
            success: false,
            response: `API连接验证失败: ${validationMessage}`,
          },
        ]);
        setIsLoading(false);
        return;
      }

      setProgress('开始添加任务...');
      if (dataType === 'ipv4') {
        await addAllTasks(ipv4Data);
      } else {
        await addAllTasks(ipv6Data);
      }
    } catch (error: any) {
      setResults([
        {
          name: '错误',
          target: '',
          success: false,
          response: `处理错误: ${error.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-500 text-white py-4 shadow-md">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">哪吒监控 - 三网监控导入工具</h1>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/ischanx/nezha-service-import"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="scale-150"
                src="https://img.shields.io/github/stars/ischanx/nezha-service-import"
                alt="GitHub Stars"
              />
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 bg-white rounded border border-gray-200 my-8 flex-grow">
        <div className="mb-4">
          <label
            htmlFor="baseUrl"
            className="block font-medium mb-1 text-gray-700"
          >
            基础URL:
          </label>
          <input
            type="text"
            id="baseUrl"
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            onBlur={e => handleUrlChange(e.target.value)}
            placeholder="通信地址, 如: https://nezha.example.com:8008"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="cookie"
            className="block font-medium mb-1 text-gray-700"
          >
            Cookie:
          </label>
          <input
            type="text"
            id="cookie"
            value={cookie}
            onChange={e => setCookie(e.target.value)}
            placeholder="接口请求头的Cookie, 如: nz-jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label
              htmlFor="duration"
              className="block font-medium mb-1 text-gray-700"
            >
              检测间隔(秒):
            </label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label
              htmlFor="maxLatency"
              className="block font-medium mb-1 text-gray-700"
            >
              最大延迟(ms):
            </label>
            <input
              type="number"
              id="maxLatency"
              value={maxLatency}
              onChange={e => setMaxLatency(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label
              htmlFor="minLatency"
              className="block font-medium mb-1 text-gray-700"
            >
              最小延迟(ms):
            </label>
            <input
              type="number"
              id="minLatency"
              value={minLatency}
              onChange={e => setMinLatency(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={validateApi}
            disabled={isLoading || !baseUrl || !cookie}
            className="transition-colors duration-300 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            验证API连接
          </button>
          <button
            onClick={() => handleAddTasks('ipv4')}
            disabled={isLoading || !isApiValid}
            className="transition-colors duration-300 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '处理中...' : '导入IPv4监控'}
          </button>
          <button
            onClick={() => handleAddTasks('ipv6')}
            disabled={isLoading || !isApiValid}
            className="transition-colors duration-300 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '处理中...' : '导入IPv6监控'}
          </button>
        </div>

        {(progress || validationMessage) && (
          <div className="text-sm text-gray-600 mb-3 p-2 rounded border border-gray-200 text-center">
            {progress || validationMessage}
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded border border-gray-200 overflow-auto h-64">
          {results.length === 0 ? (
            <div className="text-gray-500 text-center py-6 flex flex-col items-center justify-center h-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>结果将显示在这里...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border ${
                    result.success
                      ? 'border-l-2 border-gray-500'
                      : 'border-l-2 border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{result.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        result.success
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {result.success ? '成功' : '失败'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-1">
                    <span className="font-medium mr-1">目标:</span>
                    <code className="bg-gray-100 px-1 rounded">
                      {result.target}
                    </code>
                  </div>
                  <div className="text-xs text-gray-600 bg-white p-1 rounded border border-gray-200 max-h-16 overflow-y-auto">
                    {typeof result.response === 'object'
                      ? JSON.stringify(result.response, null, 2)
                      : result.response.toString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="py-4 text-center text-gray-600 text-sm border-t border-gray-200 mt-auto">
        <div className="max-w-3xl mx-auto px-4  flex items-center justify-center">
          <div className="font-medium inline-flex items-center">
            <a
              href="https://github.com/ischanx"
              target="_blank"
              rel="noopener noreferrer"
            >
              由 ischanx 开发
            </a>
          </div>
          <div className="mx-2">|</div>
          <div className="inline-flex items-center">
            <a
              href="https://github.com/ischanx/nezha-service-import"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 inline-flex items-center"
            >
              <svg
                className="h-4 w-4 mr-1"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              项目主页
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
