/**
 * Motor de Cálculo de Finiquitos - Normativa Chilena (Art. 159, 160, 161)
 */

const TOPE_INDEMNIZACION_UF = 90; // Tope legal 90 UF por cálculo de años de servicio / Mes de aviso
const DIAS_VACACIONES_POR_MES = 1.25; // 15 días hábiles al año
const MAX_AÑOS_SERVICIO = 11; // La ley topa la indemnización a 330 días (11 años)

/**
 * Calcula el tiempo trabajado en meses y días.
 */
export const calcularTiempoTrabajado = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    let meses = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
    let diasExtra = fin.getDate() - inicio.getDate();

    if (diasExtra < 0) {
        meses--;
        const lastMonth = new Date(fin.getFullYear(), fin.getMonth(), 0);
        diasExtra += lastMonth.getDate();
    }

    // Si la fracción de meses > 6, suma 1 año (Art 163). Lo calcularemos en la indemnización.
    return { meses, diasExtra };
};

/**
 * Calcula Días de Vacaciones Proporcionales (Matemática Pura - Omitiendo festivos para el MVP)
 */
export const calcularVacacionesProporcionales = (fechaInicio, fechaFin, sueldoBase, diasTomados = 0) => {
    const { meses, diasExtra } = calcularTiempoTrabajado(fechaInicio, fechaFin);
    const totalMesesDecimal = meses + (diasExtra / 30);

    const diasAcumulados = totalMesesDecimal * DIAS_VACACIONES_POR_MES;
    const saldoDias = Math.max(0, diasAcumulados - diasTomados);
    const valorDia = sueldoBase / 30;

    return Math.round(saldoDias * valorDia);
};

/**
 * Calcula Indemnización por Años de Servicio (Solamente aplica para Art 161)
 */
export const calcularAñosServicio = (fechaInicio, fechaFin, sueldoImponible, valorUF) => {
    const topeCLP = TOPE_INDEMNIZACION_UF * valorUF;
    const baseCalculo = Math.min(sueldoImponible, topeCLP);

    const { meses } = calcularTiempoTrabajado(fechaInicio, fechaFin);

    let añosCalc = Math.floor(meses / 12);
    const mesesSobrantes = meses % 12;

    if (mesesSobrantes >= 6) {
        añosCalc++; // La fracción superior a 6 meses se considera año completo
    }

    const añosTopados = Math.min(añosCalc, MAX_AÑOS_SERVICIO);
    return Math.round(baseCalculo * añosTopados);
};

/**
 * Calcula Mes de Aviso (Aviso Previo)
 */
export const calcularAvisoPrevio = (sueldoImponible, valorUF) => {
    const topeCLP = TOPE_INDEMNIZACION_UF * valorUF;
    return Math.round(Math.min(sueldoImponible, topeCLP));
};

/**
 * Máster: Calcula Finiquito Dinámico basado en Causal Legal y Tipo de Contrato.
 */
export const calcularFiniquitoReal = (workerData, config) => {
    const {
        fechaInicio,      // ISO string
        fechaFin,         // ISO string
        causal,           // "159-1" (Mutuo), "159-2" (Renuncia), "160" (Culposo), "161" (Necesidades)
        daAvisoPrevio,    // boolean (True si se le avisó con 30 días, eximiendo el pago sustitutivo en el art 161)
        sueldoBase,
        totalImponible,
        contractType = 'Indefinido', // Default to Indefinido if missing
        vacationsTaken = 0
    } = workerData;

    const { ufValue = 38500 } = config; // Inyectado desde BancoCentral API / GlobalSettings

    // 1. CASO ESPECIAL: Honorarios -> No tienen finiquito legal.
    if (contractType?.toLowerCase() === 'honorarios') {
        return {
            causalLegal: 'N/A (Honorarios)',
            desglose: {
                vacacionesProporcionales: 0,
                indemnizacionAñosServicio: 0,
                indemnizacionAvisoPrevio: 0
            },
            totalAPagar: 0
        };
    }

    // 2. Vacaciones (Base de todo finiquito dependiente sin importar la causal)
    const montoVacaciones = calcularVacacionesProporcionales(fechaInicio, fechaFin, sueldoBase, vacationsTaken);

    let montoAvisoPrevio = 0;
    let montoAñosServicio = 0;

    // 3. Indemnizaciones (Solo Art. 161 exige pago por años de servicio y aviso previo)
    // REGLA: Los contratos a Plazo Fijo o Por Obra/Faena NO tienen indemnización por años de servicio ni mes de aviso por el art 161 (el fin es por el 159).
    const isIndefinido = contractType?.toLowerCase() === 'indefinido';

    if (causal.startsWith('161') && isIndefinido) {
        montoAñosServicio = calcularAñosServicio(fechaInicio, fechaFin, totalImponible, ufValue);

        if (!daAvisoPrevio) {
            montoAvisoPrevio = calcularAvisoPrevio(totalImponible, ufValue);
        }
    }

    // 4. Causales de mutuo acuerdo pueden pactar indemnizaciones, pero fuera del MVP nos regimos por el piso legal restrictivo.

    const totalFiniquito = montoVacaciones + montoAñosServicio + montoAvisoPrevio;

    return {
        causalLegal: causal,
        desglose: {
            vacacionesProporcionales: montoVacaciones,
            indemnizacionAñosServicio: montoAñosServicio,
            indemnizacionAvisoPrevio: montoAvisoPrevio
        },
        totalAPagar: totalFiniquito
    };
};
