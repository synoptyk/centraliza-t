/**
 * Chilean RUT Utilities
 */

/**
 * Clean a RUT string removing dots and dash
 * @param {string} rut 
 * @returns {string}
 */
export const cleanRut = (rut) => {
    return typeof rut === 'string'
        ? rut.replace(/[^0-9kK]/g, '').toUpperCase()
        : '';
};

/**
 * Format a RUT string (e.g. 12345678-k -> 12.345.678-K)
 * @param {string} rut 
 * @returns {string}
 */
export const formatRut = (rut) => {
    const cleaned = cleanRut(rut);
    if (!cleaned) return '';

    const dv = cleaned.slice(-1);
    const body = cleaned.slice(0, -1);

    return body.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + dv;
};

/**
 * Validate Chilean RUT
 * @param {string} rutFull 
 * @returns {boolean}
 */
export const validateRut = (rutFull) => {
    if (!rutFull || typeof rutFull !== 'string') return false;

    const cleaned = cleanRut(rutFull);
    if (cleaned.length < 8) return false;

    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1).toUpperCase();

    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body.charAt(i)) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDv = 11 - (sum % 11);
    const dvString = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();

    return dv === dvString;
};
