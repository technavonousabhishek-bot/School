export type NoticePayload = {
  audience: 'students' | 'teachers';
  title: string;
  description: string;
  className?: string;
  applicableDate?: string;
  validTill?: string | null;
  applicableTo?: string[] | undefined;
  postedBy: string;
};

export type Notice = NoticePayload & { id: string; createdAt: string };

import { SCHOOL_API_BASE, buildApiUrl } from '../config/api';

// Re-export for backward compatibility with files that import API_BASE from this module
export const API_BASE = SCHOOL_API_BASE;


async function handleResponse(resp: Response) {
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`API error ${resp.status}: ${text}`);
  }
  const contentType = resp.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return resp.json();
  return null;
}

export async function fetchNotices(audience?: 'students' | 'teachers', className?: string): Promise<Notice[]> {
  const url = new URL(buildApiUrl(API_BASE, 'notices/'));
  if (audience) url.searchParams.set('audience', audience);
  if (className) url.searchParams.set('class_name', className);
  const res = await fetch(String(url), { method: 'GET' });
  return (await handleResponse(res)) as Notice[];
}

export async function createNotice(payload: NoticePayload): Promise<Notice> {
  const res = await fetch(buildApiUrl(API_BASE, 'notices/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await handleResponse(res)) as Notice;
}

export async function updateNotice(id: string, payload: NoticePayload): Promise<Notice> {
  const res = await fetch(buildApiUrl(API_BASE, 'notices', `${encodeURIComponent(id)}/`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await handleResponse(res)) as Notice;
}

export async function deleteNotice(id: string): Promise<void> {
  const res = await fetch(buildApiUrl(API_BASE, 'notices', `${encodeURIComponent(id)}/`), { method: 'DELETE' });
  await handleResponse(res);
}
