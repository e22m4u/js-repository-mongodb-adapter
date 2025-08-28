import {pluralize} from './pluralize.js';
import {toCamelCase} from './to-camel-case.js';

/**
 * Создает имя таблицы/коллекции по названию модели.
 *
 * @param {string} modelName
 * @returns {string}
 */
export function modelNameToCollectionName(modelName) {
  // приведение имени класса к стандартному camelCase
  // "UserModel" -> "userModel", "Article" -> "article"
  const ccName = toCamelCase(modelName);
  // удаление постфикса "Model" с конца строки
  // "userModel" -> "user", "myModel" -> "my"
  const woModel = ccName.replace(/Model$/i, '');
  // если базовое имя слишком короткое (как "my" для "myModel"),
  // то используется имя, включающее постфикс "Model"
  if (woModel.length <= 2) {
    // pluralize('myModel') -> "myModels"
    return pluralize(ccName);
  }
  // для обычных имен обрабатывается без суффикса
  // pluralize('user') -> "users"
  return pluralize(woModel);
}
