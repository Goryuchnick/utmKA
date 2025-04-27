/**
 * Converts a Russian month name to its English equivalent.
 */
const monthTranslations: { [key: string]: string } = {
  'январь': 'january',
  'февраль': 'february',
  'март': 'march',
  'апрель': 'april',
  'май': 'may',
  'июнь': 'june',
  'июль': 'july',
  'август': 'august',
  'сентябрь': 'september',
  'октябрь': 'october',
  'ноябрь': 'november',
  'декабрь': 'december',
};

/**
 * Converts a Russian month name to its English equivalent.
 *
 * @param russianMonth The month name in Russian (lowercase).
 * @returns The month name in English, or the original input if not found.
 */
export function translateMonth(russianMonth: string): string {
  return monthTranslations[russianMonth] || russianMonth;
}
