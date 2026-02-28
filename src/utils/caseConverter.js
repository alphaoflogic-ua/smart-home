import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

/**
 * Преобразует объект в camelCase
 * @param {any} obj 
 * @returns {any}
 */
export const toCamel = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  return camelcaseKeys(obj, { deep: true });
};

/**
 * Преобразует объект в snake_case
 * @param {any} obj 
 * @returns {any}
 */
export const toSnake = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  return snakecaseKeys(obj, { deep: true });
};
