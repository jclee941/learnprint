/**
 * 안전한 고유 ID 생성.
 *
 * `crypto.randomUUID()`는 보안 컨텍스트(HTTPS 또는 localhost)에서만 제공된다.
 * LAN IP(예: http://192.168.x.x) 등 비보안 origin에서는 정의되지 않아
 * 호출 시 TypeError가 발생하므로, 사용 가능할 때만 쓰고 그렇지 않으면
 * 시간+난수 기반 fallback으로 고유 ID를 생성한다.
 */
export function createId(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
}
