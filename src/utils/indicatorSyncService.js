/**
 * ============================================================
 * CENTRALIZA-T :: LIVING INDICATORS SYNC SERVICE
 * ============================================================
 * Servicio de sincronización automática de indicadores económicos
 * y previsionales de Chile. Opera en tres frecuencias:
 *
 *  🔴 DIARIO   → UF, Dólar, Euro, Bitcoin, Libra de Cobre
 *  🟡 MENSUAL  → UTM, IPC, IMACEC, TPM
 *  🟢 ANUAL    → Topes AFP/AFC, SIS, Tasas AFP (cada 1 enero)
 *
 * Fuente: mindicador.cl (proxy oficial del Banco Central + SII)
 * ============================================================
 */

const axios = require('axios');
const GlobalSettings = require('../models/GlobalSettings');

const MINDICADOR_API = 'https://mindicador.cl/api';

// =============================================
// HELPERS
// =============================================

const isOlderThan = (date, ms) => {
    if (!date) return true;
    return (Date.now() - new Date(date).getTime()) > ms;
};

const log = (level, message) => {
    const levels = { INFO: '📊', WARN: '⚠️ ', ERROR: '🔴', OK: '✅' };
    console.log(`[IndicatorSync] ${levels[level] || ''} ${message}`);
};

// =============================================
// FETCH HELPERS
// =============================================

// Formatea la fecha actual como DD-MM-YYYY para mindicador.cl
const getTodayStr = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
};

// Consulta UN indicador específico por FECHA EXACTA (fecha = DD-MM-YYYY)
// Devuelve el valor numérico o null si no está disponible
const fetchIndicatorByDate = async (codigo, fechaStr) => {
    try {
        const url = `${MINDICADOR_API}/${codigo}/${fechaStr}`;
        const res = await axios.get(url, { timeout: 8000 });
        const serie = res.data?.serie;
        if (serie && serie.length > 0) {
            return { valor: serie[0].valor, fecha: serie[0].fecha };
        }
        return null;
    } catch (err) {
        log('WARN', `Could not fetch ${codigo} for ${fechaStr}: ${err.message}`);
        return null;
    }
};

// Consulta el endpoint genérico para indicadores sin fecha diaria (UTM, IPC, TPM, etc.)
const fetchMindicadorGeneric = async () => {
    const res = await axios.get(MINDICADOR_API, { timeout: 8000 });
    return res.data;
};

// =============================================
// SYNC TASKS BY FREQUENCY
// =============================================

/**
 * 🔴 SINCRONIZACIÓN DIARIA
 * Usa endpoints con FECHA EXACTA para garantizar el valor del DÍA.
 * ⚠️  El endpoint genérico /api puede tener datos de días anteriores
 *     (ej: mindicador.cl actualizó el 15-feb y hoy es 22-feb = 6 días de retraso)
 *
 * Codigos con fecha diaria: uf, dolar, euro, bitcoin, libra_cobre
 */
const syncDailyIndicators = async (settings) => {
    if (!isOlderThan(settings.lastDailySync, 6 * 60 * 60 * 1000)) {
        return false; // No necesita actualización
    }

    const hoy = getTodayStr();
    log('INFO', `Syncing daily indicators for date: ${hoy} (UF, USD, EUR, BTC, Copper)...`);

    let changed = false;

    // Fetch each indicator by exact today's date — ensures we get the Banco Central value for TODAY
    const uf = await fetchIndicatorByDate('uf', hoy);
    if (uf && uf.valor !== settings.ufValue) {
        settings.ufValue = uf.valor;
        changed = true;
        log('INFO', `UF actualizada: $${uf.valor} (fecha: ${new Date(uf.fecha).toLocaleDateString('es-CL')})`);
    }

    const dolar = await fetchIndicatorByDate('dolar', hoy);
    if (dolar && dolar.valor !== settings.dolarValue) {
        settings.dolarValue = dolar.valor;
        changed = true;
    }

    const euro = await fetchIndicatorByDate('euro', hoy);
    if (euro && euro.valor) {
        settings.euroValue = euro.valor;
        changed = true;
    }

    const bitcoin = await fetchIndicatorByDate('bitcoin', hoy);
    if (bitcoin && bitcoin.valor) {
        settings.bitcoinValue = bitcoin.valor;
        changed = true;
    }

    const libraCobre = await fetchIndicatorByDate('libra_cobre', hoy);
    if (libraCobre && libraCobre.valor) {
        settings.libraCobre = libraCobre.valor;
        changed = true;
    }

    settings.lastDailySync = new Date();
    settings.lastIndicatorsUpdate = new Date();
    log('OK', `Daily sync complete. UF: $${settings.ufValue} | USD: $${settings.dolarValue} | EUR: $${settings.euroValue}`);
    return changed;
};

/**
 * 🟡 SINCRONIZACIÓN MENSUAL
 * Corre cada 24 horas. Actualiza indicadores que cambian mensualmente:
 * UTM, IPC mensual, IMACEC, TPM
 */
const syncMonthlyIndicators = async (settings) => {
    if (!isOlderThan(settings.lastMonthlySync, 24 * 60 * 60 * 1000)) {
        return false;
    }

    log('INFO', 'Syncing monthly indicators (UTM, IPC, TPM, IMACEC)...');

    // UTM, IPC, TPM, IMACEC change monthly — generic endpoint is valid for these
    const data = await fetchMindicadorGeneric();
    let changed = false;

    if (data.utm?.valor && data.utm.valor !== settings.utmValue) {
        settings.utmValue = data.utm.valor;
        changed = true;
    }
    if (data.ipc?.valor) {
        settings.ipcValue = data.ipc.valor;
        changed = true;
    }
    if (data.tpm?.valor) {
        settings.tpmValue = data.tpm.valor;
        changed = true;
    }
    if (data.imacec?.valor) {
        settings.imacecValue = data.imacec.valor;
        changed = true;
    }

    settings.lastMonthlySync = new Date();
    log('OK', `Monthly sync complete. UTM: $${settings.utmValue} | IPC: ${settings.ipcValue}% | TPM: ${settings.tpmValue}%`);
    return changed;
};

/**
 * 🟢 SINCRONIZACIÓN ANUAL
 * Corre cada 7 días. Detecta inicio de nuevo año y valida
 * que los topes estén actualizados. Emite advertencia si los topes
 * tienen más de 1 año sin actualización manual.
 */
const syncAnnualValidation = async (settings) => {
    if (!isOlderThan(settings.lastAnnualCheck, 7 * 24 * 60 * 60 * 1000)) {
        return false;
    }

    const currentYear = new Date().getFullYear();
    const lastUpdatedYear = settings.lastAnnualUpdate
        ? new Date(settings.lastAnnualUpdate).getFullYear()
        : 0;

    log('INFO', `Annual validation check. Current: ${currentYear}, Last update year: ${lastUpdatedYear}`);

    if (currentYear > lastUpdatedYear) {
        // Emitir advertencia en logs - el CEO debe revisar Parámetros Legales
        log('WARN', `⚡ NEW YEAR DETECTED (${currentYear}). Annual constants (Topes, SIS, IMM) may need manual review in Parámetros Legales!`);
        settings.annualUpdateRequired = true;
    } else {
        settings.annualUpdateRequired = false;
    }

    settings.lastAnnualCheck = new Date();
    return true;
};

// =============================================
// ORCHESTRATOR: Main sync loop
// =============================================

const runSync = async () => {
    let settings;
    try {
        settings = await GlobalSettings.findOne({ id: 'UNIQUE_CONFIG_DOCUMENT' });
        if (!settings) {
            settings = await GlobalSettings.create({ id: 'UNIQUE_CONFIG_DOCUMENT' });
            log('INFO', 'GlobalSettings created for the first time.');
        }
    } catch (dbErr) {
        log('ERROR', `Cannot access DB: ${dbErr.message}`);
        return;
    }

    let needsSave = false;

    try {
        const dailyChanged = await syncDailyIndicators(settings);
        if (dailyChanged !== false) needsSave = true;
    } catch (err) {
        log('ERROR', `Daily sync failed: ${err.message}`);
    }

    try {
        const monthlyChanged = await syncMonthlyIndicators(settings);
        if (monthlyChanged !== false) needsSave = true;
    } catch (err) {
        log('ERROR', `Monthly sync failed: ${err.message}`);
    }

    try {
        const annualChanged = await syncAnnualValidation(settings);
        if (annualChanged) needsSave = true;
    } catch (err) {
        log('ERROR', `Annual check failed: ${err.message}`);
    }

    if (needsSave) {
        try {
            await settings.save();
            log('OK', 'All indicator changes persisted to DB.');
        } catch (saveErr) {
            log('ERROR', `DB save failed: ${saveErr.message}`);
        }
    }
};

// =============================================
// PUBLIC EXPORT: Worker starter
// =============================================

exports.startIndicatorSyncWorker = () => {
    log('INFO', '🚀 Indicator Sync Worker starting...');

    // Run immediately on boot
    runSync().catch(err => log('ERROR', `Boot sync failed: ${err.message}`));

    // Then run every 2 hours
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    setInterval(() => {
        runSync().catch(err => log('ERROR', `Scheduled sync failed: ${err.message}`));
    }, TWO_HOURS);

    log('OK', `Indicator Sync Worker scheduled: every 2h. Daily/Monthly/Annual logic inside.`);
};

// Manual sync trigger (for admin API endpoint)
exports.runManualSync = async () => {
    log('INFO', 'Manual sync triggered by admin...');

    const settings = await GlobalSettings.findOne({ id: 'UNIQUE_CONFIG_DOCUMENT' });
    if (!settings) throw new Error('No GlobalSettings document found');

    const hoy = getTodayStr();
    log('INFO', `Manual sync for date: ${hoy}`);

    // Daily: Fetch each by EXACT DATE for precision
    const [uf, dolar, euro, bitcoin, libraCobre] = await Promise.allSettled([
        fetchIndicatorByDate('uf', hoy),
        fetchIndicatorByDate('dolar', hoy),
        fetchIndicatorByDate('euro', hoy),
        fetchIndicatorByDate('bitcoin', hoy),
        fetchIndicatorByDate('libra_cobre', hoy)
    ]);

    if (uf.value?.valor) { settings.ufValue = uf.value.valor; }
    if (dolar.value?.valor) { settings.dolarValue = dolar.value.valor; }
    if (euro.value?.valor) { settings.euroValue = euro.value.valor; }
    if (bitcoin.value?.valor) { settings.bitcoinValue = bitcoin.value.valor; }
    if (libraCobre.value?.valor) { settings.libraCobre = libraCobre.value.valor; }

    // Monthly: Generic endpoint is fine for UTM, IPC, TPM, IMACEC
    try {
        const generic = await fetchMindicadorGeneric();
        if (generic.utm?.valor) settings.utmValue = generic.utm.valor;
        if (generic.ipc?.valor) settings.ipcValue = generic.ipc.valor;
        if (generic.tpm?.valor) settings.tpmValue = generic.tpm.valor;
        if (generic.imacec?.valor) settings.imacecValue = generic.imacec.valor;
    } catch (err) {
        log('WARN', `Monthly indicators partial fail: ${err.message}`);
    }

    settings.lastDailySync = new Date();
    settings.lastMonthlySync = new Date();
    settings.lastIndicatorsUpdate = new Date();

    await settings.save();
    log('OK', `Manual sync complete. UF: $${settings.ufValue} | USD: $${settings.dolarValue}`);

    return settings;
};
