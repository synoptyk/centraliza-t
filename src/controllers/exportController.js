const html_pdf = require('html-pdf-node');
const Applicant = require('../models/Applicant');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Generate PDF for an employee profile
 * @route   GET /api/exports/profile/:id
 */
const exportProfilePDF = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { format = 'A4', margin = '20mm', fitToPage = 'true' } = req.query;

    const applicant = await Applicant.findById(id);
    if (!applicant) {
        res.status(404);
        throw new Error('Colaborador no encontrado');
    }

    const content = `
        <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #1e293b; }
                    .header { text-align: center; border-bottom: 3px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { margin: 0; text-transform: uppercase; letter-spacing: 2px; }
                    .header p { margin: 5px 0 0; color: #64748b; font-weight: bold; }
                    .section { margin-bottom: 30px; }
                    .section-title { font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #4F46E5; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px; }
                    .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; }
                    .item { margin-bottom: 10px; }
                    .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 2px; }
                    .value { font-size: 13px; font-weight: 600; color: #334155; }
                    .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Ficha Maestra del Colaborador</h1>
                    <p>\${applicant.fullName} | RUT: \${applicant.rut}</p>
                </div>
                
                <div class="section">
                    <div class="section-title">Información Personal</div>
                    <div class="grid">
                        <div class="item">
                            <div class="label">Nombre Completo</div>
                            <div class="value">\${applicant.fullName}</div>
                        </div>
                        <div class="item">
                            <div class="label">RUT</div>
                            <div class="value">\${applicant.rut}</div>
                        </div>
                        <div class="item">
                            <div class="label">Email</div>
                            <div class="value">\${applicant.email}</div>
                        </div>
                        <div class="item">
                            <div class="label">Teléfono</div>
                            <div class="value">\${applicant.phone}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Información Contractual</div>
                    <div class="grid">
                        <div class="item">
                            <div class="label">Cargo</div>
                            <div class="value">\${applicant.position}</div>
                        </div>
                        <div class="item">
                            <div class="label">Estado Actual</div>
                            <div class="value">\${applicant.status}</div>
                        </div>
                        <div class="item">
                            <div class="label">Proyecto Asignado</div>
                            <div class="value">\${applicant.projectId?.name || 'CENTRALIZA-T MASTER'}</div>
                        </div>
                        <div class="item">
                            <div class="label">Fecha Ingreso</div>
                            <div class="value">\${applicant.hiring?.contractStartDate ? new Date(applicant.hiring.contractStartDate).toLocaleDateString() : 'No registrada'}</div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    Documento generado automáticamente por CENTRALIZA-T el \${new Date().toLocaleDateString()}
                </div>
            </body>
        </html>
    `;

    let options = {
        format: format,
        margin: { top: margin, right: margin, bottom: margin, left: margin },
        printBackground: true,
        scale: fitToPage === 'true' ? 0.8 : 1.0,
        pageRanges: fitToPage === 'true' ? '1' : undefined
    };
    let file = { content };

    html_pdf.generatePdf(file, options).then(pdfBuffer => {
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=Ficha_\${applicant.rut}.pdf`,
            'Content-Length': pdfBuffer.length
        });
        res.send(pdfBuffer);
    });
});

/**
 * @desc    Generate PDF Salary Slip (Liquidación)
 * @route   POST /api/exports/payslip
 */
const exportPayslipPDF = asyncHandler(async (req, res) => {
    const { employeeData, calculation, companyInfo, period, config = {} } = req.body;
    const { format = 'A4', margin = '10mm' } = config;

    const content = `
        <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', sans-serif; padding: 20px; font-size: 10px; color: #1e293b; }
                    .container { border: 2px solid #000; padding: 20px; }
                    .header { display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
                    .company-info { width: 50%; }
                    .title-box { text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; }
                    .employee-box { margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                    th { background: #f1f5f9; text-align: left; padding: 5px; border: 1px solid #000; text-transform: uppercase; font-size: 9px; }
                    td { padding: 5px; border: 1px solid #000; }
                    .bold { font-weight: bold; }
                    .text-right { text-align: right; }
                    .total-row { background: #f8fafc; font-weight: bold; }
                    .footer { margin-top: 60px; display: flex; justify-content: space-between; }
                    .sign-box { width: 200px; text-align: center; border-top: 1px solid #000; padding-top: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="company-info">
                            <div class="bold">\${companyInfo?.name || 'CENTRALIZA-T PERÚ SPA'}</div>
                            <div>RUT: \${companyInfo?.rut || '77.777.777-7'}</div>
                            <div>DIRECCIÓN: \${companyInfo?.address || 'AV. PROVIDENCIA 1234, SANTIAGO'}</div>
                        </div>
                        <div class="text-right">
                            <div class="bold">PERIODO: \${period}</div>
                        </div>
                    </div>

                    <div class="title-box">LIQUIDACIÓN DE SUELDO</div>

                    <div class="employee-box">
                        <table>
                            <tr>
                                <td class="bold">TRABAJADOR</td><td>\${employeeData.fullName}</td>
                                <td class="bold">RUT</td><td>\${employeeData.rut}</td>
                            </tr>
                            <tr>
                                <td class="bold">CARGO</td><td>\${employeeData.position}</td>
                                <td class="bold">AFP</td><td>\${employeeData.afp}</td>
                            </tr>
                            <tr>
                                <td class="bold">SALUD</td><td>\${employeeData.health}</td>
                                <td class="bold">F. INGRESO</td><td>\${employeeData.hiringDate || '-'}</td>
                            </tr>
                        </table>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>DESCRIPCIÓN HABERES</th>
                                <th class="text-right">MONTOS</th>
                                <th>DESCUENTOS LEGALES</th>
                                <th class="text-right">MONTOS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>SUELDO BASE</td>
                                <td class="text-right">$\${calculation.sueldoBase.toLocaleString()}</td>
                                <td>AFP (\${employeeData.afp})</td>
                                <td class="text-right">$\${calculation.totalLeyesSociales.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>GRATIFICACIÓN LEGAL</td>
                                <td class="text-right">$\${calculation.gratificacionLegal.toLocaleString()}</td>
                                <td>SALUD (\${employeeData.health})</td>
                                <td class="text-right">INCLUIDO</td>
                            </tr>
                            <tr>
                                <td>OTROS HABERES IMPONIBLES</td>
                                <td class="text-right">$\${(calculation.totalImponible - calculation.sueldoBase - calculation.gratificacionLegal).toLocaleString()}</td>
                                <td>IMPUESTO ÚNICO</td>
                                <td class="text-right">$\${calculation.impuestoUnico.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>HABERES NO IMPONIBLES</td>
                                <td class="text-right">$\${calculation.bonosNoImponibles.toLocaleString()}</td>
                                <td>OTROS DESCUENTOS</td>
                                <td class="text-right">$\${calculation.descuentosVarios.toLocaleString()}</td>
                            </tr>
                            <tr class="total-row">
                                <td>TOTAL HABERES</td>
                                <td class="text-right">$\${calculation.totalHaberes.toLocaleString()}</td>
                                <td>TOTAL DESCUENTOS</td>
                                <td class="text-right">$\${(calculation.totalLeyesSociales + calculation.impuestoUnico + calculation.descuentosVarios).toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="font-size: 16px; font-weight: bold; text-align: right; margin-top: 20px; border: 2px solid #000; padding: 10px; background: #f1f5f9;">
                        ALCANCE LÍQUIDO A PAGAR: $\${calculation.liquidoAPagar.toLocaleString()}
                    </div>

                    <div style="margin-top: 30px; font-size: 8px; color: #64748b;">
                        Certifico que he recibido de mi empleador a mi total y entera satisfacción el pago de mi remuneración correspondiente al periodo indicado, no teniendo reclamo alguno que formular.
                    </div>

                    <div class="footer">
                        <div class="sign-box">FIRMA EMPLEADOR</div>
                        <div class="sign-box">FIRMA TRABAJADOR</div>
                    </div>
                </div>
            </body>
        </html>
    `;

    let options = {
        format: format,
        margin: { top: margin, right: margin, bottom: margin, left: margin },
        printBackground: true,
        scale: 1.0
    };
    let file = { content };

    html_pdf.generatePdf(file, options).then(pdfBuffer => {
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=Liquidacion_\${employeeData.rut}.pdf`,
            'Content-Length': pdfBuffer.length
        });
        res.send(pdfBuffer);
    });
});

/**
 * @desc    Generate PDF for Finiquito (Termination)
 * @route   POST /api/exports/finiquito
 */
const exportFiniquitoPDF = asyncHandler(async (req, res) => {
    const { employeeData, calculation, causalLegal, companyInfo, config = {} } = req.body;
    const { format = 'A4', margin = '20mm', fitToPage = 'false' } = config;

    const content = `
        <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', sans-serif; padding: 40px; font-size: 11px; color: #1e293b; line-height: 1.6; }
                    .header { text-align: center; margin-bottom: 40px; }
                    .header h1 { text-transform: uppercase; font-size: 18px; font-weight: 900; margin-bottom: 5px; }
                    .company-header { margin-bottom: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; }
                    .section { margin-bottom: 25px; }
                    .section-title { font-weight: 900; text-transform: uppercase; color: #4F46E5; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    td { padding: 8px; border: 1px solid #f1f5f9; }
                    .label { font-weight: bold; width: 35%; color: #64748b; }
                    .total-row { background: #f8fafc; font-weight: 900; font-size: 14px; }
                    .legal-text { text-align: justify; margin-top: 30px; font-style: italic; color: #475569; }
                    .signature-area { margin-top: 80px; display: flex; justify-content: space-between; }
                    .sign-box { width: 220px; text-align: center; border-top: 1px solid #1e293b; padding-top: 10px; font-weight: bold; text-transform: uppercase; }
                </style>
            </head>
            <body>
                <div class="company-header">
                    <div style="font-weight: 900; font-size: 14px;">\${companyInfo?.name || 'LA EMPRESA'}</div>
                    <div>RUT: \${companyInfo?.rut || 'N/A'}</div>
                </div>

                <div class="header">
                    <h1>Finiquito de Contrato de Trabajo</h1>
                    <p>En cumplimiento con la legislación laboral vigente</p>
                </div>

                <div class="section">
                    <div class="section-title">Identificación del Trabajador</div>
                    <table>
                        <tr><td class="label">NOMBRE COMPLETO</td><td>\${employeeData.fullName}</td></tr>
                        <tr><td class="label">RUT</td><td>\${employeeData.rut}</td></tr>
                        <tr><td class="label">CARGO</td><td>\${employeeData.position}</td></tr>
                        <tr><td class="label">FECHA INGRESO</td><td>\${new Date(employeeData.hiringDate).toLocaleDateString()}</td></tr>
                        <tr><td class="label">FECHA TÉRMINO</td><td>\${new Date().toLocaleDateString()}</td></tr>
                    </table>
                </div>

                <div class="section">
                    <div class="section-title">Causal de Término</div>
                    <p>La relación laboral termina por la causal del <strong>Artículo \${causalLegal || '159 N° 4'}</strong> del Código del Trabajo.</p>
                </div>

                <div class="section">
                    <div class="section-title">Liquidación de Haberes y Descuentos</div>
                    <table>
                        <tr><td>Vacaciones Proporcionales (Feriado Legal)</td><td style="text-align: right;">$${calculation.desglose?.vacacionesProporcionales?.toLocaleString() || '0'}</td></tr>
                        ${calculation.desglose?.indemnizacionAñosServicio > 0 ? '<tr><td>Indemnización por Años de Servicio</td><td style="text-align: right;">$' + calculation.desglose.indemnizacionAñosServicio.toLocaleString() + '</td></tr>' : ''}
                        ${calculation.desglose?.indemnizacionAvisoPrevio > 0 ? '<tr><td>Indemnización Sustitutiva Aviso Previo</td><td style="text-align: right;">$' + calculation.desglose.indemnizacionAvisoPrevio.toLocaleString() + '</td></tr>' : ''}
                        <tr class="total-row">
                            <td>TOTAL LÍQUIDO A PAGAR</td>
                            <td style="text-align: right;">$${calculation.totalAPagar?.toLocaleString() || '0'}</td>
                        </tr>
                    </table>
                </div>

                <div class="legal-text">
                    El trabajador declara haber recibido de la empresa a su entera satisfacción, la suma total indicada, por concepto de finiquito de su contrato de trabajo, no teniendo reclamo alguno que formular por remuneraciones, feriado, indemnizaciones o cualquier otro concepto.
                </div>

                <div class="signature-area">
                    <div class="sign-box">FIRMA EMPLEADOR</div>
                    <div class="sign-box">FIRMA TRABAJADOR</div>
                </div>

                <div style="margin-top: 40px; text-align: center; font-size: 9px; color: #94a3b8;">
                    Documento generado por CENTRALIZA-T para fines informativos y de legalización.
                </div>
            </body>
        </html>
    `;

    let options = {
        format: format,
        margin: { top: margin, right: margin, bottom: margin, left: margin },
        printBackground: true,
        scale: fitToPage === 'true' ? 0.9 : 1.0
    };
    let file = { content };

    html_pdf.generatePdf(file, options).then(pdfBuffer => {
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=Finiquito_\${employeeData.rut}.pdf`,
            'Content-Length': pdfBuffer.length
        });
        res.send(pdfBuffer);
    });
});

/**
 * @desc    Generate PDF Vacation Proof
 * @route   POST /api/exports/vacation-proof
 */
const exportVacationProofPDF = asyncHandler(async (req, res) => {
    const { employeeData, requestData, companyInfo, config = {} } = req.body;
    const { format = 'A4', margin = '20mm' } = config;

    const content = `
        <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', sans-serif; padding: 50px; color: #1e293b; line-height: 1.8; }
                    .header { text-align: center; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 40px; }
                    .header h1 { margin: 0; text-transform: uppercase; font-size: 20px; }
                    .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
                    .label { font-weight: 900; font-size: 10px; color: #64748b; text-transform: uppercase; }
                    .value { font-size: 14px; font-weight: bold; border-bottom: 1px solid #f1f5f9; }
                    .main-text { font-size: 13px; text-align: justify; margin-bottom: 50px; }
                    .signature-block { margin-top: 100px; display: flex; justify-content: space-between; }
                    .sign-line { width: 200px; border-top: 1px solid #000; text-align: center; font-size: 10px; font-weight: bold; padding-top: 5px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Comprobante de Feriado Legal</h1>
                    <p>\${companyInfo?.name || 'CENTRALIZA-T SPA'}</p>
                </div>

                <div class="info-grid">
                    <div>
                        <div class="label">Colaborador</div>
                        <div class="value">\${employeeData.fullName}</div>
                    </div>
                    <div>
                        <div class="label">RUT</div>
                        <div class="value">\${employeeData.rut}</div>
                    </div>
                </div>

                <div class="main-text">
                    Por medio del presente, se deja constancia que el colaborador individualizado 
                    hará uso de su feriado legal (vacaciones) correspondiente a <strong>\${requestData.daysRequested} días hábiles</strong>, 
                    comenzando el día <strong>\${new Date(requestData.startDate).toLocaleDateString()}</strong> 
                    y finalizando el día <strong>\${new Date(requestData.endDate).toLocaleDateString()}</strong>, 
                    debiendo reintegrarse a sus labores el siguiente día hábil.
                </div>

                <div class="signature-block">
                    <div class="sign-line">FIRMA TRABAJADOR</div>
                    <div class="sign-line">FIRMA EMPLEADOR / RRHH</div>
                </div>

                <div style="position: absolute; bottom: 40px; width: 100%; text-align: center; font-size: 9px; color: #94a3b8;">
                    Este documento es un comprobante oficial de ausencia autorizada. SANTIAGO, \${new Date().toLocaleDateString()}
                </div>
            </body>
        </html>
    `;

    let options = {
        format: format,
        margin: { top: margin, right: margin, bottom: margin, left: margin },
        printBackground: true
    };
    let file = { content };

    html_pdf.generatePdf(file, options).then(pdfBuffer => {
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=Vacaciones_\${employeeData.rut}.pdf`,
            'Content-Length': pdfBuffer.length
        });
        res.send(pdfBuffer);
    });
});

/**
 * @desc    Generate PDF Disciplinary Action
 * @route   POST /api/exports/disciplinary
 */
const exportDisciplinaryActionPDF = asyncHandler(async (req, res) => {
    const { actionData, employeeData, companyInfo, config = {} } = req.body;
    const { format = 'A4', margin = '20mm' } = config;

    const content = `
        <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; font-size: 11px; }
                    .header { margin-bottom: 30px; font-weight: bold; }
                    .title { text-align: center; margin: 30px 0; font-size: 16px; text-transform: uppercase; text-decoration: underline; font-weight: 900; }
                    .content-section { margin-bottom: 20px; text-align: justify; }
                    .footer { margin-top: 80px; display: flex; justify-content: space-between; }
                    .sign-box { border-top: 1px solid #000; width: 220px; text-align: center; padding-top: 5px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>\${companyInfo?.name || 'LA EMPRESA'}</div>
                    <div>\${companyInfo?.rut || '77.777.777-7'}</div>
                    <div style="margin-top: 10px;">FECHA: \${new Date().toLocaleDateString()}</div>
                </div>

                <div class="title">Comunicación de Medida Disciplinaria: \${actionData.type}</div>

                <div class="content-section">
                    <strong>SR(A): \${employeeData.fullName}</strong><br/>
                    <strong>RUT: \${employeeData.rut}</strong><br/>
                    Presente
                </div>

                <div class="content-section">
                    Por intermedio de la presente, comunicamos a usted que la administración ha decidido aplicar una medida disciplinaria consistente en 
                    <strong>\${actionData.type}</strong> (\${actionData.severity}), debido a los hechos ocurridos con fecha \${new Date(actionData.date).toLocaleDateString()}, 
                    los cuales se detallan a continuación:
                </div>

                <div class="content-section" style="background: #f8fafc; padding: 15px; border-radius: 8px;">
                    \${actionData.incidentDetails}
                </div>

                <div class="content-section">
                    Esta medida se fundamenta legalmente en el <strong>Reglamento Interno de Orden, Higiene y Seguridad</strong> de la empresa, específicamente en el artículo 
                    <strong>\${actionData.internalRegArticle || '154'}</strong>, y tiene como finalidad mantener la disciplina y el cumplimiento de las obligaciones contractuales.
                </div>

                ${actionData.type === 'Multa' ? '<div class="content-section" style="border: 2px solid #e11d48; padding: 10px; color: #e11d48; font-weight: 900;">MONTO MULTA APLICADA: $' + actionData.fineAmount.toLocaleString() + ' (Se descontará de su próxima remuneración habitual).</div>' : ''}

                <div class="footer">
                    <div class="sign-box">FIRMA REPRESENTANTE EMPRESA</div>
                    <div class="sign-box">FIRMA RECEPCIÓN TRABAJADOR</div>
                </div>
            </body>
        </html>
    `;

    let options = {
        format: format,
        margin: { top: margin, right: margin, bottom: margin, left: margin },
        printBackground: true
    };
    let file = { content };

    html_pdf.generatePdf(file, options).then(pdfBuffer => {
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=Disciplina_\${employeeData.rut}.pdf`,
            'Content-Length': pdfBuffer.length
        });
        res.send(pdfBuffer);
    });
});

module.exports = {
    exportProfilePDF,
    exportPayslipPDF,
    exportFiniquitoPDF,
    exportVacationProofPDF,
    exportDisciplinaryActionPDF
};

