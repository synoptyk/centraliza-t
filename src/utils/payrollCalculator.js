/**
 * Motor de Cálculo de Remuneraciones - Chile (v2.0)
 * Ahora soporta Inyección Dinámica de Parámetros Globales (Sueldo Mínimo, UF, UTM, SIS).
 */

// Estas son solo constantes DEFAULT por seguridad en caso de que fallen las inyecciones de DB/API
const DEFAULT_IMM = 539000; // IMM vigente Ley N°21.751 (2026)
const DEFAULT_TOPE_AFP = 89.9; // UF - Tope imponible AFP/Salud 2026 (Sup. de Pensiones)
const DEFAULT_TOPE_AFC = 135.1; // UF - Tope imponible Seguro Cesantía 2026 (AFC Chile)
const DEFAULT_VALOR_UF = 39731; // UF referencia enero 2026
const DEFAULT_VALOR_UTM = 68000; // UTM referencia 2026
const DEFAULT_SIS_RATE = 1.54; // % SIS vigente enero 2026 (licitación AFP)
const DEFAULT_MUTUAL_BASE = 0.90; // %
const RETENCION_HONORARIOS = 13.75; // % Retención legal para boletas de honorarios 2024-2026

// Tasas AFP 2026 (10% legal + comisión administradora) según Sup. de Pensiones
const DEFAULT_TASAS_AFP = {
    'Capital': 11.44,
    'Cuprum': 11.44,
    'Habitat': 11.27,
    'PlanVital': 11.16,
    'Provida': 11.45,
    'Modelo': 10.58,
    'UNO': 10.46  // Actualizado oct 2025 -> 0.46% comisión = 10.46% total
};

const TRAMOS_IMPUESTO_UNICO = [
    { desde: 0, hasta: 13.5, factor: 0.0, cantidadRebajar: 0 },
    { desde: 13.5, hasta: 30, factor: 0.04, cantidadRebajar: 0.54 },
    { desde: 30, hasta: 50, factor: 0.08, cantidadRebajar: 1.74 },
    { desde: 50, hasta: 70, factor: 0.135, cantidadRebajar: 4.49 },
    { desde: 70, hasta: 90, factor: 0.23, cantidadRebajar: 11.14 },
    { desde: 90, hasta: 120, factor: 0.304, cantidadRebajar: 17.8 },
    { desde: 120, hasta: 310, factor: 0.35, cantidadRebajar: 23.32 },
    { desde: 310, hasta: Infinity, factor: 0.40, cantidadRebajar: 38.82 },
];

export const calcularGratificacion = (sueldoBase, params) => {
    const imm = params?.sueldoMinimo || DEFAULT_IMM;
    const gratificacionNormal = sueldoBase * 0.25;
    const topeGratificacionMensual = (4.75 * imm) / 12;
    return Math.min(gratificacionNormal, topeGratificacionMensual);
};

export const calcularAFP = (baseImponible, pAfpName, params) => {
    const uf = params?.ufValue || params?.manualUfValue || DEFAULT_VALOR_UF;
    const topeUF = params?.topeImponibleAFP || DEFAULT_TOPE_AFP;
    const topeCLP = topeUF * uf;
    const imponibleTopeado = Math.min(baseImponible, topeCLP);

    const tasas = params?.afpRates || DEFAULT_TASAS_AFP;
    const normalName = Object.keys(tasas).find(k => k.toLowerCase() === (pAfpName || '').toLowerCase()) || 'Habitat';
    const tasaAfp = tasas[normalName];

    return Math.round(imponibleTopeado * (tasaAfp / 100));
};

export const calcularSalud = (baseImponible, healthSystem, params) => {
    const uf = params?.ufValue || params?.manualUfValue || DEFAULT_VALOR_UF;
    const topeUF = params?.topeImponibleAFP || DEFAULT_TOPE_AFP;
    const topeCLP = topeUF * uf;
    const imponibleTopeado = Math.min(baseImponible, topeCLP);

    const fonasaLegal = Math.round(imponibleTopeado * 0.07);

    if (healthSystem?.provider?.toLowerCase() === 'isapre' && healthSystem?.ufAmount) {
        const pactadoIsapre = Math.round(healthSystem.ufAmount * uf);
        return Math.max(fonasaLegal, pactadoIsapre);
    }

    return fonasaLegal;
};

// AFC Trabajador (Liquidación) -> 0.6% si es Indefinido
export const calcularAFC_Trabajador = (baseImponible, tipoContrato, params) => {
    if (tipoContrato?.toLowerCase().includes('fijo') || tipoContrato?.toLowerCase().includes('obra')) {
        return 0;
    }
    const uf = params?.ufValue || params?.manualUfValue || DEFAULT_VALOR_UF;
    const topeUF = params?.topeImponibleAFC || DEFAULT_TOPE_AFC;
    const topeCLP = topeUF * uf;
    const imponibleTopeado = Math.min(baseImponible, topeCLP);

    return Math.round(imponibleTopeado * 0.006);
};

// AFC Empleador (Costo Empresa) -> 2.4% si es Indefinido, 3.0% si es Fijo
export const calcularAFC_Empleador = (baseImponible, tipoContrato, params) => {
    const uf = params?.ufValue || params?.manualUfValue || DEFAULT_VALOR_UF;
    const topeUF = params?.topeImponibleAFC || DEFAULT_TOPE_AFC;
    const topeCLP = topeUF * uf;
    const imponibleTopeado = Math.min(baseImponible, topeCLP);

    const tasa = (tipoContrato?.toLowerCase().includes('fijo') || tipoContrato?.toLowerCase().includes('obra')) ? 0.03 : 0.024;
    return Math.round(imponibleTopeado * tasa);
};

// Seguro Invalidez y Sobrevivencia (SIS) - Cargo exclusivo del empleador
export const calcularSIS = (baseImponible, params) => {
    const uf = params?.ufValue || params?.manualUfValue || DEFAULT_VALOR_UF;
    const topeUF = params?.topeImponibleAFP || DEFAULT_TOPE_AFP;
    const topeCLP = topeUF * uf;
    const imponibleTopeado = Math.min(baseImponible, topeCLP);

    const sisRate = params?.sisRate || DEFAULT_SIS_RATE;
    return Math.round(imponibleTopeado * (sisRate / 100));
};

// Mutual de Seguridad (Ley de Accidentes de Trabajo) - Empleador
export const calcularMutual = (baseImponible, params) => {
    // La mutual no tiene "tope" per se como la AFP (o sí, en algunos casos se usa el de 84.3 UF), 
    // pero legalmente se calcula sobre remuneración imponible con el mismo tope de AFP en la práctica.
    const uf = params?.ufValue || params?.manualUfValue || DEFAULT_VALOR_UF;
    const topeUF = params?.topeImponibleAFP || DEFAULT_TOPE_AFP;
    const topeCLP = topeUF * uf;
    const imponibleTopeado = Math.min(baseImponible, topeCLP);

    const mutualRate = params?.mutualBaseRate || DEFAULT_MUTUAL_BASE;
    return Math.round(imponibleTopeado * (mutualRate / 100));
};

export const calcularImpuestoUnico = (baseTributable, params) => {
    if (baseTributable <= 0) return 0;
    const utm = params?.utmValue || params?.manualUtmValue || DEFAULT_VALOR_UTM;

    const tramosCalculados = TRAMOS_IMPUESTO_UNICO.map(t => ({
        desde: t.desde * utm,
        hasta: t.hasta * utm,
        factor: t.factor,
        cantidadRebajar: t.cantidadRebajar * utm
    }));

    const tramo = tramosCalculados.find(t => baseTributable > t.desde && baseTributable <= t.hasta);
    if (!tramo || tramo.factor === 0) return 0;

    const impuestoCalculado = (baseTributable * tramo.factor) - tramo.cantidadRebajar;
    return Math.round(Math.max(0, impuestoCalculado));
};

/**
 * Función Maestra V2: Integra cálculos de trabajador (Líquido) y cálculos de empresa (Patronal).
 * Se inyectan `globalParams` obtenidos idealmente de DB/API.
 */
export const calcularLiquidacionReal = (workerData, ajustesPeriodo = {}, globalParams = {}) => {
    const {
        baseSalary = 0,
        afp = 'Habitat',
        health = { provider: 'Fonasa' },
        contractType = 'Indefinido'
    } = workerData;

    const bonosImponibles = ajustesPeriodo.bonosImponibles || 0;
    const bonosNoImponibles = ajustesPeriodo.bonosNoImponibles || 0;
    const descuentosVarios = ajustesPeriodo.descuentosVarios || 0;
    const diasVacaciones = ajustesPeriodo.diasVacaciones || 0;

    // --- CASO ESPECIAL: HONORARIOS ---
    if (contractType?.toLowerCase() === 'honorarios') {
        const totalBruto = baseSalary + bonosImponibles + bonosNoImponibles;
        const retencionLegal = Math.round(totalBruto * (RETENCION_HONORARIOS / 100));
        const totalDescuentosGenerales = retencionLegal + descuentosVarios;
        const liquido = totalBruto - totalDescuentosGenerales;

        return {
            sueldoBase: baseSalary,
            gratificacion: 0,
            bonosImponibles,
            bonosNoImponibles,
            totalImponible: totalBruto,

            afp: 0,
            salud: 0,
            afc: 0,
            totalLeyesSociales: 0,

            baseTributable: totalBruto,
            impuestoUnico: retencionLegal, // Usamos este campo para la retención por simplicidad visual
            descuentosVarios,

            totalHaberes: totalBruto,
            totalDescuentos: totalDescuentosGenerales,
            liquidoAPagar: Math.max(0, liquido),

            // Aportes patronales 0 para honorarios
            aportesPatronales: {
                afc: 0,
                sis: 0,
                mutual: 0,
                total: 0,
                costoFinalEmpresa: totalBruto
            }
        };
    }

    // --- CASO NORMAL: CONTRATO DEPENDIENTE ---
    const gratificacionLegal = calcularGratificacion(baseSalary, globalParams);
    const totalImponible = baseSalary + gratificacionLegal + bonosImponibles;

    // --- DESCUENTOS TRABAJADOR ---
    const descuentoAFP = calcularAFP(totalImponible, afp, globalParams);
    const descuentoSalud = calcularSalud(totalImponible, health, globalParams);
    const descuentoAFC_Trabajador = calcularAFC_Trabajador(totalImponible, contractType, globalParams);
    const totalLeyesSociales = descuentoAFP + descuentoSalud + descuentoAFC_Trabajador;

    const baseTributable = totalImponible - totalLeyesSociales;
    const impuestoUnico = calcularImpuestoUnico(baseTributable, globalParams);

    const totalHaberes = totalImponible + bonosNoImponibles;
    const totalDescuentosLegales = totalLeyesSociales + impuestoUnico;
    const totalDescuentosGenerales = totalDescuentosLegales + descuentosVarios;
    const liquido = totalHaberes - totalDescuentosGenerales;

    // --- COSTOS PATRONALES (EMPRESA) ---
    const afcEmpleador = calcularAFC_Empleador(totalImponible, contractType, globalParams);
    const sisEmpleador = calcularSIS(totalImponible, globalParams);
    const mutualEmpleador = calcularMutual(totalImponible, globalParams);
    const totalAportesPatronales = afcEmpleador + sisEmpleador + mutualEmpleador;

    // Costo Empresa Real = Total Haberes + Aportes Patronales
    const costoEmpresa = totalHaberes + totalAportesPatronales;

    return {
        // --- LIQUIDACIÓN TRABAJADOR ---
        sueldoBase: baseSalary,
        gratificacion: gratificacionLegal,
        bonosImponibles,
        bonosNoImponibles,
        totalImponible,

        afp: descuentoAFP,
        salud: descuentoSalud,
        afc: descuentoAFC_Trabajador,
        totalLeyesSociales,

        baseTributable,
        impuestoUnico,
        descuentosVarios,
        diasVacaciones,

        totalHaberes,
        totalDescuentos: totalDescuentosGenerales,
        liquidoAPagar: Math.max(0, liquido),

        // --- APORTE EMPRESA (PREVIRED) ---
        aportesPatronales: {
            afc: afcEmpleador,
            sis: sisEmpleador,
            mutual: mutualEmpleador,
            total: totalAportesPatronales,
            costoFinalEmpresa: costoEmpresa
        }
    };
};
