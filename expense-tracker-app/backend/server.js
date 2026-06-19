// backend/server.js

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// ---------- MIDDLEWARE (Gateway) ----------
// 1. CORS enable karo - Frontend (port 5500) ko backend (port 5000) se baat karne do
app.use(cors());
// 2. JSON data ko samajhne ke liye (POST requests ke liye)
app.use(express.json());

// ---------- DATABASE (Memory Storage) ----------
// Practical mein ye database hota, abhi hum array mein rakhenge
const today = new Date();
const todayISO = today.toISOString().slice(0, 10);
const earlierDate = new Date(today);
earlierDate.setDate(today.getDate() - 8);
const earlierISO = earlierDate.toISOString().slice(0, 10);

let expenses = [
    {
        id: 1,
        billId: 'BILL-001',
        vendorCompany: 'Google Ads',
        vendorName: 'Robert Fox',
        service: 'Freelancing',
        category: 'Marketing',
        amount: 15000,
        date: todayISO,
        status: 'Paid',
        description: 'Marketing campaign bill'
    },
    {
        id: 2,
        billId: 'BILL-002',
        vendorCompany: 'Spotify subscription',
        vendorName: 'Jason Momoa',
        service: 'Entertainment',
        category: 'Software',
        amount: 16000,
        date: earlierISO,
        status: 'Overdue',
        description: 'Monthly team music plan'
    }
];
let nextId = 3; // Agli entry ka ID

// ---------- API ROUTES (Endpoints) ----------

// 1. GET /api/expenses  -> (READ) Saare expenses fetch karna
// Idempotency: YES (Safe to retry)
app.get('/api/expenses', (req, res) => {
    // Status 200 (OK) aur JSON bhejna (Serialization)
    res.status(200).json(expenses);
});

// 2. POST /api/expenses -> (CREATE) Naya expense add karna
// Idempotency: NO (Har baar naya expense banega)
app.post('/api/expenses', (req, res) => {
    // Request body se data nikalna (Deserialization)
    const {
        vendorCompany,
        vendorName,
        service,
        category,
        amount,
        date,
        status,
        description
    } = req.body;

    // ---------- INPUT VALIDATION (Error Handling) ----------
    if (!vendorCompany) {
        return res.status(400).json({ message: 'Vendor company is required!' });
    }
    if (!vendorName) {
        return res.status(400).json({ message: 'Vendor name is required!' });
    }
    if (!service) {
        return res.status(400).json({ message: 'Service is required!' });
    }
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Valid positive amount is required!' });
    }
    if (!date) {
        return res.status(400).json({ message: 'Date is required!' });
    }
    if (!status) {
        return res.status(400).json({ message: 'Status is required!' });
    }

    const newExpense = {
        id: nextId,
        billId: `BILL-${String(nextId).padStart(3, '0')}`,
        vendorCompany: vendorCompany,
        vendorName: vendorName,
        service: service,
        category: category || 'Other',
        amount: parseFloat(amount),
        date: date,
        status: status,
        description: description || ''
    };
    nextId += 1;

    // Array mein add karna
    expenses.push(newExpense);

    // Status 201: Created (Resource ban gaya)
    res.status(201).json(newExpense);
});

// 3. DELETE /api/expenses/:id -> (DELETE) Expense delete karna
// Idempotency: YES (Baar baar karo toh farq nahi parta)
app.delete('/api/expenses/:id', (req, res) => {
    const id = parseInt(req.params.id); // URL se id nikalna

    // Us ID wala expense dhoondna
    const expenseIndex = expenses.findIndex(exp => exp.id === id);

    if (expenseIndex === -1) {
        // Status 404: Not Found
        return res.status(404).json({ message: 'Expense not found' });
    }

    // Array se remove karo
    expenses.splice(expenseIndex, 1);

    // Status 204: No Content (Success, but kuch return nahi karna)
    res.status(204).send();
});

// 4. PUT /api/expenses/:id -> (UPDATE) Expense update karna
// Idempotency: YES (Same request repeatedly results in same state)
app.put('/api/expenses/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const expenseIndex = expenses.findIndex(exp => exp.id === id);

    if (expenseIndex === -1) {
        return res.status(404).json({ message: 'Expense not found' });
    }

    const {
        vendorCompany,
        vendorName,
        service,
        category,
        amount,
        date,
        status,
        description
    } = req.body;

    // ---------- INPUT VALIDATION ----------
    if (!vendorCompany) {
        return res.status(400).json({ message: 'Vendor company is required!' });
    }
    if (!vendorName) {
        return res.status(400).json({ message: 'Vendor name is required!' });
    }
    if (!service) {
        return res.status(400).json({ message: 'Service is required!' });
    }
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Valid positive amount is required!' });
    }
    if (!date) {
        return res.status(400).json({ message: 'Date is required!' });
    }
    if (!status) {
        return res.status(400).json({ message: 'Status is required!' });
    }

    // Keep the ID and BillID intact, update the rest
    const updatedExpense = {
        ...expenses[expenseIndex],
        vendorCompany,
        vendorName,
        service,
        category: category || 'Other',
        amount: parseFloat(amount),
        date,
        status,
        description: description || ''
    };

    expenses[expenseIndex] = updatedExpense;

    res.status(200).json(updatedExpense);
});

// ---------- SERVER START ----------
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`💰 API URL: http://localhost:${PORT}/api/expenses`);
});