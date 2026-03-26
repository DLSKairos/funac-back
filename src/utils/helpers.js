/**
 * Genera una referencia unica tipo FUNAC-20260314-42
 * @param {number|string} id
 * @returns {string}
 */
const generateReference = (id) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  return `FUNAC-${dateStr}-${id}`;
};

/**
 * Formatea bytes a KB o MB legible
 * @param {number} bytes
 * @returns {string}
 */
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Sanitizacion basica de HTML: remueve tags script, on* handlers e iframes
 * @param {string} html
 * @returns {string}
 */
const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return '';

  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript\s*:/gi, '')
    .trim();
};

/**
 * Calcula la edad en años desde una fecha de nacimiento
 * @param {Date|string} fechaNacimiento
 * @returns {number|null}
 */
const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
};

/**
 * Construye la URL publica de un archivo subido
 * @param {string} subdir - 'carousel', 'pdfs', 'cvs'
 * @param {string} filename
 * @returns {string}
 */
const buildFileUrl = (subdir, filename) => {
  const baseUrl = process.env.API_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${subdir}/${filename}`;
};

module.exports = { generateReference, formatFileSize, sanitizeHtml, calcularEdad, buildFileUrl };
