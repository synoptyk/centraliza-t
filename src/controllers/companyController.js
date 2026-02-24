const Company = require('../models/Company');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Register a new company (SuperAdmin only)
// @route   POST /api/companies
const registerCompany = asyncHandler(async (req, res) => {
    const {
        name, rut, address, phone, email, web, industry,
        // New Fields
        businessLine,
        serviceMode,
        legalRepresentatives, // Expecting Array
        commercialContacts,   // Expecting Array
        contractStartDate, contractDurationMonths, contractedUsersLimit,
        userValueUF, monthlyTotalUF,
        modules
    } = req.body;

    const companyExists = await Company.findOne({ rut });

    if (companyExists) {
        res.status(400);
        throw new Error('Company with this RUT already exists');
    }

    // Calculate Contract End Date
    let contractEndDate = null;
    if (contractStartDate && contractDurationMonths) {
        const start = new Date(contractStartDate);
        contractEndDate = new Date(start.setMonth(start.getMonth() + Number(contractDurationMonths)));
    }

    const company = await Company.create({
        name,
        rut,
        address,
        phone,
        email,
        web,
        industry,

        // New Fields
        businessLine,
        serviceMode: serviceMode || 'FULL_HR_360',
        legalRepresentatives: legalRepresentatives || [],
        commercialContacts: commercialContacts || [],

        contractStartDate,
        contractDurationMonths,
        contractEndDate,
        contractedUsersLimit: contractedUsersLimit || 5,
        userValueUF,
        monthlyTotalUF,
        modules: modules || []
    });

    res.status(201).json(company);
});

// @desc    Get all companies
// @route   GET /api/companies
const getCompanies = asyncHandler(async (req, res) => {
    const companies = await Company.find({});
    res.json(companies);
});

// @desc    Update company
// @route   PUT /api/companies/:id
const updateCompany = asyncHandler(async (req, res) => {
    const company = await Company.findById(req.params.id);

    if (company) {
        company.name = req.body.name || company.name;
        company.rut = req.body.rut || company.rut;
        company.address = req.body.address || company.address;
        company.phone = req.body.phone || company.phone;
        company.email = req.body.email || company.email;
        company.web = req.body.web || company.web;
        company.industry = req.body.industry || company.industry;

        // New Fields
        company.businessLine = req.body.businessLine || company.businessLine;
        if (req.body.serviceMode) company.serviceMode = req.body.serviceMode;

        // Update Arrays if provided (User sends full array to replace)
        if (req.body.legalRepresentatives) {
            company.legalRepresentatives = req.body.legalRepresentatives;
        }
        if (req.body.commercialContacts) {
            company.commercialContacts = req.body.commercialContacts;
        }

        // Contract Logic
        if (req.body.contractStartDate) company.contractStartDate = req.body.contractStartDate;
        if (req.body.contractDurationMonths) company.contractDurationMonths = req.body.contractDurationMonths;

        // Recalculate End Date if start or duration exists (either new or existing)
        const startDate = company.contractStartDate;
        const duration = company.contractDurationMonths;

        if (startDate && duration) {
            const start = new Date(startDate);
            company.contractEndDate = new Date(start.setMonth(start.getMonth() + Number(duration)));
        }

        if (req.body.contractedUsersLimit !== undefined) company.contractedUsersLimit = req.body.contractedUsersLimit;
        if (req.body.userValueUF !== undefined) company.userValueUF = req.body.userValueUF;
        if (req.body.monthlyTotalUF !== undefined) company.monthlyTotalUF = req.body.monthlyTotalUF;
        if (req.body.status) company.status = req.body.status;
        if (req.body.country) company.country = req.body.country;

        company.legalRepresentative = req.body.legalRepresentative || company.legalRepresentative; // Legacy

        const updatedCompany = await company.save();
        res.json(updatedCompany);
    } else {
        res.status(404);
        throw new Error('Company not found');
    }
});

// @desc    Delete company
// @route   DELETE /api/companies/:id
const deleteCompany = asyncHandler(async (req, res) => {
    const company = await Company.findById(req.params.id);

    if (company) {
        await company.deleteOne();
        res.json({ message: 'Company removed' });
    } else {
        res.status(404);
        throw new Error('Company not found');
    }
});

const bulkRegisterCompanies = asyncHandler(async (req, res) => {
    const companies = req.body; // Array of company objects

    if (!Array.isArray(companies)) {
        res.status(400);
        throw new Error('Invalid data format. Expected an array of companies.');
    }

    const results = {
        created: 0,
        skipped: 0,
        errors: []
    };

    for (const comp of companies) {
        try {
            const existing = await Company.findOne({ rut: comp.rut });
            if (existing) {
                results.skipped++;
                continue;
            }
            await Company.create(comp);
            results.created++;
        } catch (error) {
            results.errors.push({ rut: comp.rut, error: error.message });
        }
    }

    res.status(201).json(results);
});

// @desc    Get company public info (Name only)
// @route   GET /api/companies/:id/public
const getCompanyPublic = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || id === 'undefined' || id === 'null') {
        res.status(400);
        throw new Error('ID de Agencia no válido');
    }

    try {
        const company = await Company.findById(id).select('name');
        if (company) {
            res.json(company);
        } else {
            res.status(404);
            throw new Error('Agencia no encontrada');
        }
    } catch (error) {
        res.status(400);
        throw new Error('Error al buscar la agencia');
    }
});

module.exports = {
    registerCompany,
    getCompanies,
    updateCompany,
    deleteCompany,
    bulkRegisterCompanies,
    getCompanyPublic
};
