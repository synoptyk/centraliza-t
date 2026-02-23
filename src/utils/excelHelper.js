import * as XLSX from 'xlsx';

/**
 * Utility to export data to an Excel (.xlsx) file
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Name of the file (without extension)
 * @param {String} sheetName - Name of the worksheet
 * @param {Object} headers - Optional mapping of keys to custom header names
 */
export const exportToExcel = (data, fileName, sheetName = 'Datos', headers = null) => {
    let processedData = data;

    // Map headers if provided
    if (headers) {
        processedData = data.map(item => {
            const newItem = {};
            Object.keys(headers).forEach(key => {
                if (item[key] !== undefined) {
                    newItem[headers[key]] = item[key];
                }
            });
            return newItem;
        });
    }

    const worksheet = XLSX.utils.json_to_sheet(processedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate buffer and trigger download
    XLSX.writeFile(workbook, `\${fileName}.xlsx`);
};

/**
 * Specifically for Previred format (can be expanded)
 */
export const exportToPrevired = (payrollData, fileName) => {
    // Standard Previred columns for remunerations
    const data = payrollData.map(emp => ({
        'RUT': emp.rut,
        'Nombre': emp.fullName,
        'Sueldo Base': emp.payrollData?.calculation?.sueldoBase || 0,
        'Gratificacion': emp.payrollData?.calculation?.gratificacionLegal || 0,
        'Bonos Imponibles': emp.periodAdjustments?.bonosImponibles || 0,
        'Total Imponible': emp.payrollData?.calculation?.totalImponible || 0,
        'Movilizacion': 0, // Mocked for now
        'Colacion': 0, // Mocked for now
        'Bonos No Imponibles': emp.periodAdjustments?.bonosNoImponibles || 0,
        'Total Haberes': emp.payrollData?.calculation?.totalHaberes || 0,
        'AFP': emp.workerData?.prevision?.afp || 'Habitat',
        'Salud': emp.workerData?.prevision?.healthSystem?.provider || 'Fonasa',
        'Total Leyes Sociales': emp.payrollData?.calculation?.totalLeyesSociales || 0,
        'Liquido a Pagar': emp.payrollData?.calculation?.liquidoAPagar || 0
    }));

    exportToExcel(data, fileName, 'PREVIRED_REMUNERACIONES');
};
