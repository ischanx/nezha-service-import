import { NextRequest, NextResponse } from 'next/server';
import { addTask } from '@/helper';


interface RequestBody {
  baseUrl: string;
  cookie: string;
  data: any;
}

// 添加 GET 方法，用于测试 API 是否正常工作
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Import API 正常工作',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { baseUrl, cookie, data } = body;

    if (!baseUrl || !cookie || !data) {
      return NextResponse.json({ message: '缺少必要参数' }, { status: 400 });
    }

    const response = await addTask(data, { baseUrl, cookie });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      error.response?.data || { message: error.message },
      { status: error.response?.status || 500 }
    );
  }
}

