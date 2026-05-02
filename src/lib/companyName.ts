// 公司名稱驗證 + 髒話過濾。前端做第一道防線，後端會二次校驗。

export const COMPANY_NAME_MIN = 2;
export const COMPANY_NAME_MAX = 8;
export const COMPANY_NAME_FALLBACK = '狗狗公司';

// 白名單：CJK Unified Ideographs (含擴展) + 英數 + ASCII 空白
const VALID_RE = /^[\p{Script=Han}A-Za-z0-9 ]+$/u;

// 髒話小詞庫（中英文）。後端有獨立清單做二次校驗。
const PROFANITY = [
  // 中文
  '幹', '靠北', '靠杯', '操你', '幹你', '草泥馬', '雞掰', '雞八', '機掰',
  '王八蛋', '畜生', '智障', '白癡', '低能', '北七', '婊子', '妓女', '賤人',
  '狗娘', '婊', '幹爆', '幹妳', '操妳',
  // 英文
  'fuck', 'shit', 'cunt', 'bitch', 'asshole', 'bastard', 'dick', 'pussy',
  'whore', 'slut', 'nigger', 'faggot',
];

export type ValidationOk = { ok: true; name: string };
export type ValidationError = { ok: false; error: string };
export type ValidationResult = ValidationOk | ValidationError;

function codepointLength(s: string): number {
  return [...s].length;
}

export function validateCompanyName(raw: string): ValidationResult {
  const name = raw.trim();
  if (name.length === 0) return { ok: false, error: '請輸入公司名稱' };
  const len = codepointLength(name);
  if (len < COMPANY_NAME_MIN) return { ok: false, error: `至少 ${COMPANY_NAME_MIN} 個字` };
  if (len > COMPANY_NAME_MAX) return { ok: false, error: `最多 ${COMPANY_NAME_MAX} 個字` };
  if (!VALID_RE.test(name)) return { ok: false, error: '只能使用中文、英數字與空白' };
  const lower = name.toLowerCase();
  for (const word of PROFANITY) {
    if (lower.includes(word.toLowerCase())) {
      return { ok: false, error: '名稱包含不雅字詞，請重新輸入' };
    }
  }
  return { ok: true, name };
}

export function displayCompanyName(name: string | undefined | null): string {
  const n = (name ?? '').trim();
  return n.length > 0 ? n : COMPANY_NAME_FALLBACK;
}
