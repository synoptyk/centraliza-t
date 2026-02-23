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

const fetchMindicador = async () => {
    const res = await axios.get(MINDICADOR_API, { timeout: 8000 });
    return res.data;
};

// =============================================
// SYNC TASKS BY FREQUENCY
// =============================================

/**
 * 🔴 SINCRONIZACIÓN DIARIA
 * Corre cada 6 horas. Actualiza indicadores que cambian diariamente:
 * UF, Dólar, Euro, Bitcoin, Libra de Cobre
 */
const syncDailyIndicators = async (settings) => {
    if (!isOlderThan(settings.lastDailySync, 6 * 60 * 60 * 1000)) {
        return false; // No necesita actualización
    }

    log('INFO', 'Syncing daily indicators (UF, USD, EUR, BTC, Copper)...');

    const data = await fetchMindicador();
    let changed = false;

    if (data.uf?.valor && data.uf.valor !== settings.ufValue) {
        settings.ufValue = data.uf.valor;
        changed = true;
    }
    if (data.dolar?.valor && data.dolar.valor !== settings.dolarValue) {
        settings.dolarValue = data.dolar.valor;
        changed = true;
    }
    if (data.euro?.valor) {
        settings.euroValue = data.euro.valor;
        changed = true;
    }
    if (data.bitcoin?.valor) {
        settings.bitcoinValue = data.bitcoin.valor;
        changed = true;
    }
    if (data.libra_cobre?.valor) {
        settings.libraCobre = data.libra_cobre.valor;
        changed = true;
    }

    settings.lastDailySync = new Date();
    settings.lastIndicatorsUpdate = new Date(); // Backward compat
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

    const data = await fetchMindicador();
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

    // Force stale timestamps to trigger all syncs
    settings.lastDailySync = null;
    settings.lastMonthlySync = null;

    const data = await fetchMindicador();

    // Apply all available indicators
    if (data.uf?.valor) settings.ufValue = data.uf.valor;
    if (data.dolar?.valor) settings.dolarValue = data.dolar.valor;
    if (data.euro?.valor) settings.euroValue = data.euro.valor;
    if (data.bitcoin?.valor) settings.bitcoinValue = data.bitcoin.valor;
    if (data.libra_cobre?.valor) settings.libraCobre = data.libra_cobre.valor;
    if (data.utm?.valor) settings.utmValue = data.utm.valor;
    if (data.ipc?.valor) settings.ipcValue = data.ipc.valor;
    if (data.tpm?.valor) settings.tpmValue = data.tpm.valor;
    if (data.imacec?.valor) settings.imacecValue = data.imacec.valor;

    settings.lastDailySync = new Date();
    settings.lastMonthlySync = new Date();
    settings.lastIndicatorsUpdate = new Date();

    await settings.save();
    log('OK', 'Manual sync complete. All indicators updated.');

    return settings;
};
