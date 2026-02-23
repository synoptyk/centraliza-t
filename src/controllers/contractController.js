const Contract = require('../models/Contract');
const Applicant = require('../models/Applicant');
const html_pdf = require('html-pdf-node');

// @desc    Get all contracts for a company
// @route   GET /api/contracts
// @access  Private
exports.getContracts = async (req, res) => {
    try {
        const contracts = await Contract.find({ companyId: req.user.companyId })
            .populate('applicantId', 'fullName rut position')
            .sort({ createdAt: -1 });
        res.json(contracts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener contratos' });
    }
};

// @desc    Create/Generate a new contract
// @route   POST /api/contracts
// @access  Private
exports.createContract = async (req, res) => {
    try {
        const { applicantId, title, type, content, hiringDetails } = req.body;

        const contract = await Contract.create({
            applicantId,
            companyId: req.user.companyId,
            title,
            type,
            content,
            metadata: {
                generatedBy: req.user._id,
                hiringDetails
            }
        });

        res.status(201).json(contract);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear contrato' });
    }
};

// @desc    Generate PDF for a contract
// @route   GET /api/contracts/:id/pdf
// @access  Private
exports.generatePDF = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id);
        if (!contract) return res.status(404).json({ message: 'Contrato no encontrado' });

        const { format = 'A4', margin = '20mm', fitToPage = 'false' } = req.query;

        let options = {
            format: format,
            margin: { top: margin, right: margin, bottom: margin, left: margin },
            printBackground: true,
            scale: fitToPage === 'true' ? 0.9 : 1.0
        };
        let file = { content: contract.content };

        html_pdf.generatePdf(file, options).then(pdfBuffer => {
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=${contract.title.replace(/\s+/g, '_')}.pdf`,
                'Content-Length': pdfBuffer.length
            });
            res.send(pdfBuffer);
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al generar PDF' });
    }
};
