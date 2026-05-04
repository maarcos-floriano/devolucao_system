const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 200;

function parsePositiveInteger(value, fallback, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
}

function getPagination({ page = 1, limit = DEFAULT_LIMIT } = {}) {
  const safePage = parsePositiveInteger(page, 1);
  const safeLimit = parsePositiveInteger(limit, DEFAULT_LIMIT, MAX_LIMIT);

  return {
    page: safePage,
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  };
}

function getSearchTokens(search = '') {
  return String(search || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);
}

function buildSearchWhere(fields, search = '') {
  const tokens = getSearchTokens(search);

  if (tokens.length === 0) {
    return { clause: '1 = 1', params: [] };
  }

  const clause = tokens
    .map(() => `(${fields.map((field) => `LOWER(COALESCE(${field}, '')) LIKE ?`).join(' OR ')})`)
    .join(' AND ');

  const params = tokens.flatMap((token) => fields.map(() => `%${token}%`));

  return { clause, params };
}

function normalizeForMatch(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function isLooseMatch(source, target) {
  const sourceText = normalizeForMatch(source);
  const targetText = normalizeForMatch(target);

  if (!sourceText || !targetText) {
    return false;
  }

  return sourceText.includes(targetText) || targetText.includes(sourceText);
}

module.exports = {
  buildSearchWhere,
  getPagination,
  getSearchTokens,
  isLooseMatch,
  normalizeForMatch,
};
