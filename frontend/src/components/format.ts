export function formatDate(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });
}

export function errorText(e: unknown): string {
  return e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
}
