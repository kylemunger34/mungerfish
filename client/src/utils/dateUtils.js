export function parseDateValue(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = String(value).trim();

  if (!text) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [year, month, day] = text.split("-").map(Number);
    const localDate = new Date(year, month - 1, day, 12, 0, 0);

    if (!Number.isNaN(localDate.getTime())) {
      return localDate;
    }
  }

  const directParse = new Date(text);

  if (!Number.isNaN(directParse.getTime())) {
    return directParse;
  }

  const normalized = text.includes(" ")
    ? text.replace(" ", "T")
    : text;

  const normalizedParse = new Date(normalized);

  if (!Number.isNaN(normalizedParse.getTime())) {
    return normalizedParse;
  }

  return null;
}

export function formatDateKey(value) {
  const date = parseDateValue(value);

  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDateTime(value) {
  const date = parseDateValue(value);

  if (!date) {
    return "";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDateOnly(value) {
  const date = parseDateValue(value);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
