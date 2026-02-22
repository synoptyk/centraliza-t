/**
 * Motor de Cálculo de Remuneraciones - Chile (Actualizado a Feb 2026)
 * Basado en las normativas actuales del Código del Trabajo, SII, y Previred.
 */

// --- CONSTANTES LEGALES (FEB 2026) ---
const IMM = 500000; // Ingreso Mínimo Mensual
const TOPE_IMPONIBLE_AFP = 84.3; // UF
const TOPE_IMPONIBLE_AFC = 126.6; // UF
const VALOR_UF = 38500; // Valor aproximado de UF en CLP para cálculos si no se inyecta desde API
const VALOR_UTM = 65000; // Valor aproximado de UTM en CLP para el Impuesto Único

// Tasas de AFP (%)
const TASAS_AFP = {
    'Capital': 11.44,
    'Cuprum': 11.44,
    'Habitat': 11.27,
    'PlanVital': 11.16,
    'Provida': 11.45,
    'Modelo': 10.58,
    'UNO': 10.69
};

// Fonasa legal
const TASA_FONASA = 7.0; // %

// --- TRAMOS IMPUESTO ÚNICO DE SEGUNDA CATEGORÍA (Mensual, basado en factores UTM) ---
// Las bases imponibles tributarias (Renta Neta) se dividen en tramos.
// Renta Tributable = Total Imponible - AFP - Salud - AFC
// Estructura: [Desde, Hasta, Factor, Rebaja]
const TRAMOS_IMPUESTO_UNICO = [
    { desde: 0, hasta: 13.5 * VALOR_UTM, factor: 0.0, cantidadRebajar: 0 },
    { desde: 13.5 * VALOR_UTM, hasta: 30 * VALOR_UTM, factor: 0.04, cantidadRebajar: 0.54 * VALOR_UTM },
    { desde: 30 * VALOR_UTM, hasta: 50 * VALOR_UTM, factor: 0.08, cantidadRebajar: 1.74 * VALOR_UTM },
    { desde: 50 * VALOR_UTM, hasta: 70 * VALOR_UTM, factor: 0.135, cantidadRebajar: 4.49 * VALOR_UTM },
    { desde: 70 * VALOR_UTM, hasta: 90 * VALOR_UTM, factor: 0.23, cantidadRebajar: 11.14 * VALOR_UTM },
    { desde: 90 * VALOR_UTM, hasta: 120 * VALOR_UTM, factor: 0.304, cantidadRebajar: 17.8 * VALOR_UTM },
    { desde: 120 * VALOR_UTM, hasta: 310 * VALOR_UTM, factor: 0.35, cantidadRebajar: 23.32 * VALOR_UTM },
    { desde: 310 * VALOR_UTM, hasta: Infinity, factor: 0.40, cantidadRebajar: 38.82 * VALOR_UTM },
];

/**
 * Calcula la Gratificación Legal. Art 50. Tope mensual de 4.75 IMM anualizado dividido en 12.
 */
export const calcularGratificacion = (sueldoBase) => {
    const gratificacionNormal = sueldoBase * 0.25;
    const topeGratificacionMensual = (4.75 * IMM) / 12; // ~ $197.917
    return Math.min(gratificacionNormal, topeGratificacionMensual);
};

/**
 * Calcula la cotización de AFP obligatoria (+ comisión) aplicando el tope máximo imponible.
 */
export const calcularAFP = (baseImponible, pAfpName, valorUfActual = VALOR_UF) => {
    const topeCLP = TOPE_IMPONIBLE_AFP * valorUfActual;
    const imponibleTopeado = Math.min(baseImponible, topeCLP);

    // Normalizar nombre de AFP
    const normalName = Object.keys(TASAS_AFP).find(k => k.toLowerCase() === (pAfpName || '').toLowerCase()) || 'Habitat'; // Default Habitat si no existe
    const tasaAfp = TASAS_AFP[normalName];

    return Math.round(imponibleTopeado * (tasaAfp / 100));
};

/**
 * Calcula la cotización de Salud (Fonasa al 7% legal topado o Isapre)
 * healthSystem: { provider: 'Fonasa' | 'Isapre', ufAmount?: number }
 */
export const calcularSalud = (baseImponible, healthSystem, valorUfActual = VALOR_UF) => {
    const topeCLP = TOPE_IMPONIBLE_AFP * valorUfActual;
    const imponibleTopeado = Math.min(baseImponible, topeCLP);

    const fonasaLegal = Math.round(imponibleTopeado * 0.07);

    if (healthSystem?.provider?.toLowerCase() === 'isapre' && healthSystem?.ufAmount) {
        const pactadoIsapre = Math.round(healthSystem.ufAmount * valorUfActual);
        // La Isapre descuenta el 7% legal o el pacto UF si es mayor
        return Math.max(fonasaLegal, pactadoIsapre);
    }

    // Si es Fonasa o no hay datos, aplica el 7% legal topado
    return fonasaLegal;
};

/**
 * Calcula el Seguro de Cesantía (AFC) del trabajador.
 * Depende de si es Contrato Indefinido (0.6%) o Fijo (0%).
 */
export const calcularAFC = (baseImponible, tipoContrato = 'Indefinido', valorUfActual = VALOR_UF) => {
    // Si el contrato es Fijo/Por Obra, el trabajador paga 0%.
    if (tipoContrato?.toLowerCase().includes('fijo') || tipoContrato?.toLowerCase().includes('obra')) {
        return 0;
    }

    const topeCLP = TOPE_IMPONIBLE_AFC * valorUfActual;
    const imponibleTopeado = Math.min(baseImponible, topeCLP);

    return Math.round(imponibleTopeado * 0.006); // 0.6% cargo trabajador
};

/**
 * Calcula Impuesto Único de Segunda Categoría.
 */
export const calcularImpuestoUnico = (baseTributable) => {
    if (baseTributable <= 0) return 0;

    const tramo = TRAMOS_IMPUESTO_UNICO.find(t => baseTributable > t.desde && baseTributable <= t.hasta);
    if (!tramo || tramo.factor === 0) return 0;

    const impuestoCalculado = (baseTributable * tramo.factor) - tramo.cantidadRebajar;
    return Math.round(Math.max(0, impuestoCalculado));
};

/**
 * Función Maestra: Calcula Liquidación Completa.
 */
export const calcularLiquidacionReal = (workerData, ajustesPeriodo = {}) => {
    const {
        baseSalary = 0,
        afp = 'Habitat',
        health = { provider: 'Fonasa' },
        contractType = 'Indefinido'
    } = workerData;

    // 1. Extraer Ajustes Proporcionados Manualmente en la UI
    // ajustesPeriodo = { bonosImponibles: number, bonosNoImponibles: number, descuentosVarios: number }
    const bonosImponibles = ajustesPeriodo.bonosImponibles || 0;
    const bonosNoImponibles = ajustesPeriodo.bonosNoImponibles || 0; // Colación, movilización, etc.
    const descuentosVarios = ajustesPeriodo.descuentosVarios || 0;

    // 2. Cálculo Gratificación (Habitualmente Art 50 25%)
    const gratificacionLegal = calcularGratificacion(baseSalary);

    // 3. Determinar Total Imponible
    const totalImponible = baseSalary + gratificacionLegal + bonosImponibles;

    // 4. Determinar Descuentos Legales (Leyes Sociales)
    const descuentoAFP = calcularAFP(totalImponible, afp);
    const descuentoSalud = calcularSalud(totalImponible, health);
    const descuentoAFC = calcularAFC(totalImponible, contractType);
    const totalLeyesSociales = descuentoAFP + descuentoSalud + descuentoAFC;

    // 5. Determinar Base Tributable (Lo que queda tras descontar leyes sociales)
    const baseTributable = totalImponible - totalLeyesSociales;

    // 6. Cálculo de Impuesto Único
    const impuestoUnico = calcularImpuestoUnico(baseTributable);

    // 7. Agrupar Totales
    const totalHaberes = totalImponible + bonosNoImponibles;
    const totalDescuentosLegales = totalLeyesSociales + impuestoUnico;
    const totalDescuentosGenerales = totalDescuentosLegales + descuentosVarios;

    // 8. Líquido a Pagar
    const liquido = totalHaberes - totalDescuentosGenerales;

    return {
        // Entradas y Parciales
        sueldoBase: baseSalary,
        gratificacion: gratificacionLegal,
        bonosImponibles,
        bonosNoImponibles,
        totalImponible,

        // Descuentos Legales
        afp: descuentoAFP,
        salud: descuentoSalud,
        afc: descuentoAFC,
        totalLeyesSociales,

        // Impuestos
        baseTributable,
        impuestoUnico,

        // Descuentos Varios
        descuentosVarios,

        // Finales
        totalHaberes,
        totalDescuentos: totalDescuentosGenerales,
        liquidoAPagar: Math.max(0, liquido) // Prevenir líquidos negativos
    };
};
