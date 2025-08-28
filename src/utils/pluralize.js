/**
 * Список регулярных выражений для проверки слов-исключений в единственном
 * числе, которые заканчиваются на "s" и требуют особого обращения.
 * Использование /word$/i позволяет корректно обрабатывать camelCase
 * и snake_case строки.
 */
const singularExceptions = [
  /access$/i,
  /address$/i,
  /alias$/i,
  /bonus$/i,
  /boss$/i,
  /bus$/i,
  /business$/i,
  /canvas$/i,
  /class$/i,
  /cross$/i,
  /dress$/i,
  /focus$/i,
  /gas$/i,
  /glass$/i,
  /kiss$/i,
  /lens$/i,
  /loss$/i,
  /pass$/i,
  /plus$/i,
  /process$/i,
  /status$/i,
  /success$/i,
  /virus$/i,
];

/**
 * Pluralize.
 *
 * @param {string} input
 * @returns {string}
 */
export function pluralize(input) {
  if (!input || typeof input !== 'string') {
    return input;
  }
  // если слово уже во множественном числе,
  // то возвращается без изменений
  if (/s$/i.test(input) && !singularExceptions.some(re => re.test(input))) {
    return input;
  }
  // определение регистра для окончания по последнему символу
  // учитывает случай, когда последним символом является цифра
  const lastChar = input.slice(-1);
  const isLastCharUpper =
    lastChar === lastChar.toUpperCase() && lastChar !== lastChar.toLowerCase();
  // если заканчивается на s, x, z, ch, sh -> добавляем "es"
  if (/(s|x|z|ch|sh)$/i.test(input)) {
    return input + (isLastCharUpper ? 'ES' : 'es');
  }
  // если заканчивается на согласную + y -> меняем "y" на "ies"
  if (/[^aeiou]y$/i.test(input)) {
    return input.slice(0, -1) + (isLastCharUpper ? 'IES' : 'ies');
  }
  // по умолчанию добавляется "s"
  return input + (isLastCharUpper ? 'S' : 's');
}
