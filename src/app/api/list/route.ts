import { NextRequest, NextResponse } from 'next/server';
import { getList } from '@/helper';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { baseUrl, cookie } = body;

  if (!baseUrl || !cookie) {
    return NextResponse.json({ message: '缺少必要参数' }, { status: 400 });
  }

  const response = await getList({ baseUrl, cookie });
  return NextResponse.json(response);
}
