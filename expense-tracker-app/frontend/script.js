const API_URL = 'http://localhost:5000/api/expenses';
const LOCAL_STORAGE_KEY = 'expenseTrackerOfflineExpenses';

const searchInput = document.getElementById('searchInput');
const vendorFilter = document.getElementById('vendorFilter');
const periodFilter = document.getElementById('periodFilter');
const expenseTableBody = document.getElementById('expenseTableBody');
const emptyState = document.getElementById('emptyState');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const monthTotal = document.getElementById('monthTotal');
const overallTotal = document.getElementById('overallTotal');
const paidCount = document.getElementById('paidCount');
const pendingCount = document.getElementById('pendingCount');
const upcomingAmount = document.getElementById('upcomingAmount');
const vendorCount = document.getElementById('vendorCount');
const marketingTotal = document.getElementById('marketingTotal');
const softwareTotal = document.getElementById('softwareTotal');
const officeTotal = document.getElementById('officeTotal');
const hostingTotal = document.getElementById('hostingTotal');
const exportBtn = document.getElementById('exportBtn');
const refreshBtn = document.getElementById('refreshBtn');
const openExpenseModalBtn = document.getElementById('openExpenseModalBtn');
const addVendorBtn = document.getElementById('addVendorBtn');
const expenseModal = document.getElementById('expenseModal');
const vendorModal = document.getElementById('vendorModal');
const closeExpenseModal = document.getElementById('closeExpenseModal');
const closeVendorModal = document.getElementById('closeVendorModal');
const cancelExpense = document.getElementById('cancelExpense');
const cancelVendor = document.getElementById('cancelVendor');
const saveExpenseBtn = document.getElementById('saveExpenseBtn');
const saveVendorBtn = document.getElementById('saveVendorBtn');
const expenseVendorCompany = document.getElementById('expenseVendorCompany');
const expenseVendorName = document.getElementById('expenseVendorName');
const expenseService = document.getElementById('expenseService');
const expenseCategory = document.getElementById('expenseCategory');
const expenseAmount = document.getElementById('expenseAmount');
const expenseDate = document.getElementById('expenseDate');
const expenseStatus = document.getElementById('expenseStatus');
const expenseDescription = document.getElementById('expenseDescription');
const newVendorName = document.getElementById('newVendorName');
const vendorCompaniesDataList = document.getElementById('vendorCompanies');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const navLinks = document.querySelectorAll('.nav-link[data-page]');
const dashboardPage = document.getElementById('dashboardPage');
const purchasesPage = document.getElementById('purchasesPage');
const salesPage = document.getElementById('salesPage');
const reportsPage = document.getElementById('reportsPage');
const payrollPage = document.getElementById('payrollPage');
const taxPage = document.getElementById('taxPage');
const settingsPage = document.getElementById('settingsPage');
const helpPage = document.getElementById('helpPage');
const settingsName = document.getElementById('settingsName');
const settingsEmail = document.getElementById('settingsEmail');
const settingsCurrency = document.getElementById('settingsCurrency');
const settingsTheme = document.getElementById('settingsTheme');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const salesPaidTotal = document.getElementById('salesPaidTotal');
const salesPendingTotal = document.getElementById('salesPendingTotal');
const salesVendorCount = document.getElementById('salesVendorCount');
const salesUpcomingTotal = document.getElementById('salesUpcomingTotal');
const reportsTotalExpenses = document.getElementById('reportsTotalExpenses');
const reportsBillCount = document.getElementById('reportsBillCount');
const reportsVendorsCount = document.getElementById('reportsVendorsCount');
const taxDue = document.getElementById('taxDue');
const taxRate = document.getElementById('taxRate');
const taxMessage = document.getElementById('taxMessage');
const pageActions = document.querySelector('.page-actions');

const APP_SETTINGS_KEY = 'expenseTrackerSettings';

let allExpenses = [];
let knownVendors = [];
let currentPage = 'dashboard';
let currentCurrency = 'PKR';
let appTheme = 'light';
let editingExpenseId = null;

function formatCurrency(value) {
    const locale = currentCurrency === 'PKR' ? 'en-PK' : currentCurrency === 'USD' ? 'en-US' : 'en-IE';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currentCurrency,
        maximumFractionDigits: 0
    }).format(value);
}

function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function statusClass(status) {
    if (status === 'Paid') return 'status-paid';
    if (status === 'Pending') return 'status-pending';
    return 'status-overdue';
}

function showError(text) {
    errorMessage.textContent = text;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 4500);
}

function showLoading(show) {
    loadingSpinner.style.display = show ? 'flex' : 'none';
}

function loadLocalExpenses() {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveLocalExpenses() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allExpenses));
}

function generateLocalBillId() {
    const existing = allExpenses.map(exp => exp.billId || '').filter(Boolean);
    const maxNumber = existing.reduce((max, id) => {
        const match = id.match(/BILL-(\d+)/);
        if (!match) return max;
        return Math.max(max, parseInt(match[1], 10));
    }, 0);
    return `BILL-${String(maxNumber + 1).padStart(3, '0')}`;
}

function showPage(pageId) {
    currentPage = pageId;
    if (pageId !== 'purchases') {
        searchInput.value = '';
    }
    const pageMap = {
        dashboard: dashboardPage,
        purchases: purchasesPage,
        sales: salesPage,
        reports: reportsPage,
        payroll: payrollPage,
        tax: taxPage,
        settings: settingsPage,
        help: helpPage
    };

    Object.values(pageMap).forEach(page => page.classList.add('hidden'));
    pageMap[pageId]?.classList.remove('hidden');

    navLinks.forEach(link => link.classList.toggle('active', link.dataset.page === pageId));

    if (pageId === 'dashboard') {
        pageTitle.textContent = 'Purchase Bills';
        pageSubtitle.textContent = 'Purchases Summary';
        renderSummary();
    } else if (pageId === 'purchases') {
        pageTitle.textContent = 'Purchase Bills';
        pageSubtitle.textContent = 'Manage your purchased bills and payments';
        renderTable();
    } else if (pageId === 'sales') {
        pageTitle.textContent = 'Sales';
    } else if (pageId === 'reports') {
        pageTitle.textContent = 'Reports';
        renderReportsPage();
    } else if (pageId === 'payroll') {
        pageTitle.textContent = 'Payroll';
    } else if (pageId === 'tax') {
        pageTitle.textContent = 'Tax';
        renderTaxPage();
    } else if (pageId === 'settings') {
        pageTitle.textContent = 'Settings';
        pageSubtitle.textContent = 'Manage your account preferences and app appearance.';
    } else if (pageId === 'help') {
        pageTitle.textContent = 'Help Center';
        pageSubtitle.textContent = 'Find answers and support resources quickly.';
    }

    if (pageId === 'dashboard' || pageId === 'purchases') {
        pageActions.style.display = 'flex';
    } else {
        pageActions.style.display = 'none';
    }
}

function populateVendorFilters() {
    const uniqueVendors = [...new Set(allExpenses.map(exp => exp.vendorCompany).filter(Boolean))].sort();
    knownVendors = uniqueVendors;
    vendorFilter.innerHTML = '<option value="all">All Clients</option>' + uniqueVendors.map(vendor => `<option value="${vendor}">${vendor}</option>`).join('');
    vendorCompaniesDataList.innerHTML = uniqueVendors.map(vendor => `<option value="${vendor}"></option>`).join('');
}

function filterExpenses() {
    let filtered = [...allExpenses];

    const vendorValue = vendorFilter.value;
    if (vendorValue !== 'all') {
        filtered = filtered.filter(exp => exp.vendorCompany === vendorValue);
    }

    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        filtered = filtered.filter(exp =>
            (exp.vendorCompany || '').toLowerCase().includes(query) ||
            (exp.vendorName || '').toLowerCase().includes(query) ||
            (exp.service || '').toLowerCase().includes(query) ||
            (exp.description || '').toLowerCase().includes(query) ||
            (exp.billId || '').toLowerCase().includes(query)
        );
    }

    const today = new Date();
    const periodValue = periodFilter.value;
    filtered = filtered.filter(exp => {
        const expDate = new Date(exp.date);
        if (periodValue === 'this-month') {
            return expDate.getMonth() === today.getMonth() && expDate.getFullYear() === today.getFullYear();
        }
        if (periodValue === 'last-month') {
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            return expDate.getMonth() === lastMonth.getMonth() && expDate.getFullYear() === lastMonth.getFullYear();
        }
        return true;
    });

    return filtered;
}

function renderSummary() {
    const now = new Date();
    const monthExpenses = allExpenses.filter(exp => {
        const expenseDate = new Date(exp.date);
        return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
    });

    monthTotal.textContent = formatCurrency(monthExpenses.reduce((sum, exp) => sum + exp.amount, 0));
    overallTotal.textContent = formatCurrency(allExpenses.reduce((sum, exp) => sum + exp.amount, 0));
    paidCount.textContent = allExpenses.filter(exp => exp.status === 'Paid').length;
    pendingCount.textContent = allExpenses.filter(exp => exp.status === 'Pending').length;
    const upcomingSum = allExpenses.filter(exp => {
        const expenseDate = new Date(exp.date);
        return expenseDate > now && exp.status !== 'Paid';
    }).reduce((sum, exp) => sum + exp.amount, 0);
    upcomingAmount.textContent = formatCurrency(upcomingSum);
    vendorCount.textContent = new Set(monthExpenses.map(exp => exp.vendorCompany)).size;

    const totals = {
        Marketing: 0,
        Software: 0,
        Office: 0,
        Hosting: 0,
        Other: 0
    };

    allExpenses.forEach(exp => {
        totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    });

    marketingTotal.textContent = formatCurrency(totals.Marketing);
    softwareTotal.textContent = formatCurrency(totals.Software);
    officeTotal.textContent = formatCurrency(totals.Office);
    hostingTotal.textContent = formatCurrency(totals.Hosting);
}

function renderSalesPage() {
    const paidTotal = allExpenses.filter(exp => exp.status === 'Paid').reduce((sum, exp) => sum + exp.amount, 0);
    const pendingTotal = allExpenses.filter(exp => exp.status === 'Pending').reduce((sum, exp) => sum + exp.amount, 0);
    const upcomingTotal = allExpenses.filter(exp => new Date(exp.date) > new Date() && exp.status !== 'Paid').reduce((sum, exp) => sum + exp.amount, 0);
    const uniqueVendorCount = new Set(allExpenses.map(exp => exp.vendorCompany).filter(Boolean)).size;

    salesPaidTotal.textContent = formatCurrency(paidTotal);
    salesPendingTotal.textContent = formatCurrency(pendingTotal);
    salesUpcomingTotal.textContent = formatCurrency(upcomingTotal);
    salesVendorCount.textContent = uniqueVendorCount;
}

function renderReportsPage() {
    reportsTotalExpenses.textContent = formatCurrency(allExpenses.reduce((sum, exp) => sum + exp.amount, 0));
    reportsBillCount.textContent = allExpenses.length;
    reportsVendorsCount.textContent = new Set(allExpenses.map(exp => exp.vendorCompany).filter(Boolean)).size;
}

function renderTaxPage() {
    const taxPercent = 5;
    const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const taxAmount = Math.round(totalExpenses * (taxPercent / 100));
    taxDue.textContent = formatCurrency(taxAmount);
    taxRate.textContent = `${taxPercent}%`;
    taxMessage.textContent = `Based on ${allExpenses.length} bill${allExpenses.length === 1 ? '' : 's'} and PKR ${totalExpenses.toLocaleString()} total expenses.`;
}

function renderTable() {
    const filteredExpenses = filterExpenses();
    expenseTableBody.innerHTML = '';

    if (!filteredExpenses.length) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    filteredExpenses.forEach(exp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${exp.vendorCompany}</td>
            <td>${exp.billId}</td>
            <td>${exp.vendorName}</td>
            <td>${exp.service}</td>
            <td>${formatCurrency(exp.amount)}</td>
            <td>${formatDate(exp.date)}</td>
            <td><span class="status-pill ${statusClass(exp.status)}">${exp.status}</span></td>
            <td>
                <button class="edit-action" data-id="${exp.id}">Edit</button>
                <button class="delete-action" data-id="${exp.id}">Delete</button>
            </td>
        `;

        row.querySelector('.edit-action').addEventListener('click', () => editExpense(exp.id));
        row.querySelector('.delete-action').addEventListener('click', () => deleteExpense(exp.id));
        expenseTableBody.appendChild(row);
    });
}

function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

function resetExpenseForm() {
    expenseVendorCompany.value = '';
    expenseVendorName.value = '';
    expenseService.value = '';
    expenseCategory.value = 'Marketing';
    expenseAmount.value = '';
    expenseDate.value = '';
    expenseStatus.value = 'Paid';
    expenseDescription.value = '';
}

function editExpense(id) {
    const exp = allExpenses.find(e => e.id === id);
    if (!exp) return;

    editingExpenseId = id;
    
    expenseVendorCompany.value = exp.vendorCompany || '';
    expenseVendorName.value = exp.vendorName || '';
    expenseService.value = exp.service || '';
    expenseCategory.value = exp.category || 'Marketing';
    expenseAmount.value = exp.amount || '';
    expenseDate.value = exp.date ? exp.date.slice(0, 10) : '';
    expenseStatus.value = exp.status || 'Paid';
    expenseDescription.value = exp.description || '';

    expenseModal.querySelector('.modal-top h2').textContent = 'Edit Expense';
    saveExpenseBtn.textContent = 'Save Changes';

    openModal(expenseModal);
}

async function loadExpenses() {
    try {
        showLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }
        allExpenses = await response.json();
        allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        populateVendorFilters();
        renderSummary();
        renderTable();
        renderSalesPage();
        renderReportsPage();
        renderTaxPage();
    } catch (error) {
        console.error('Load Error:', error);
        allExpenses = loadLocalExpenses();
        if (!allExpenses.length) {
            showError('Backend unavailable. Use the app offline and expenses will be stored locally.');
        } else {
            showError('Backend unavailable. Showing saved local expenses.');
        }
        allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        populateVendorFilters();
        renderSummary();
        renderTable();
        renderSalesPage();
        renderReportsPage();
        renderTaxPage();
    } finally {
        showLoading(false);
    }
}

async function saveExpense() {
    const expenseData = {
        vendorCompany: expenseVendorCompany.value.trim(),
        vendorName: expenseVendorName.value.trim(),
        service: expenseService.value.trim(),
        category: expenseCategory.value,
        amount: Number(expenseAmount.value),
        date: expenseDate.value,
        status: expenseStatus.value,
        description: expenseDescription.value.trim()
    };

    if (!expenseData.vendorCompany) {
        showError('Vendor company is required.');
        return;
    }
    if (!expenseData.vendorName) {
        showError('Vendor name is required.');
        return;
    }
    if (!expenseData.service) {
        showError('Service description is required.');
        return;
    }
    if (!expenseData.amount || expenseData.amount <= 0) {
        showError('Amount must be a positive number.');
        return;
    }
    if (!expenseData.date) {
        showError('Date is required.');
        return;
    }

    try {
        if (!expenseData.date) {
            expenseData.date = new Date().toISOString().slice(0, 10);
        }

        showLoading(true);
        saveExpenseBtn.disabled = true;

        const method = editingExpenseId ? 'PUT' : 'POST';
        const url = editingExpenseId ? `${API_URL}/${editingExpenseId}` : API_URL;

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenseData)
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.message || `HTTP Error ${response.status}`);
        }

        await loadExpenses();
        editingExpenseId = null;
        resetExpenseForm();
        closeModal(expenseModal);
    } catch (error) {
        console.error('Save Error:', error);
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            const isEditing = !!editingExpenseId;
            if (isEditing) {
                const idx = allExpenses.findIndex(exp => exp.id === editingExpenseId);
                if (idx !== -1) {
                    allExpenses[idx] = {
                        ...allExpenses[idx],
                        ...expenseData
                    };
                    saveLocalExpenses();
                }
            } else {
                const localExpense = {
                    id: Date.now(),
                    billId: generateLocalBillId(),
                    ...expenseData
                };
                allExpenses.unshift(localExpense);
                saveLocalExpenses();
            }
            populateVendorFilters();
            renderSummary();
            renderTable();
            editingExpenseId = null;
            resetExpenseForm();
            closeModal(expenseModal);
            showError(isEditing ? 'Expense updated locally because the backend is unavailable.' : 'Expense saved locally because the backend is unavailable.');
        } else {
            showError(error.message);
        }
    } finally {
        saveExpenseBtn.disabled = false;
        showLoading(false);
    }
}

async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) {
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok && response.status !== 204) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.message || `HTTP Error ${response.status}`);
        }
        await loadExpenses();
    } catch (error) {
        console.error('Delete Error:', error);
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            allExpenses = allExpenses.filter(exp => exp.id !== id);
            saveLocalExpenses();
            populateVendorFilters();
            renderSummary();
            renderTable();
            showError('Expense deleted locally because backend is unavailable.');
        } else {
            showError(error.message || 'Unable to delete expense.');
        }
    } finally {
        showLoading(false);
    }
}

function addVendor() {
    const vendorNameValue = newVendorName.value.trim();
    if (!vendorNameValue) {
        showError('Please enter a vendor company name.');
        return;
    }
    if (!knownVendors.includes(vendorNameValue)) {
        knownVendors.push(vendorNameValue);
        vendorFilter.innerHTML += `<option value="${vendorNameValue}">${vendorNameValue}</option>`;
        vendorCompaniesDataList.innerHTML += `<option value="${vendorNameValue}"></option>`;
    }

    newVendorName.value = '';
    closeModal(vendorModal);
    showError(`Vendor added: ${vendorNameValue}`);
}

function applyTheme(theme) {
    appTheme = theme;
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

function loadSettings() {
    const saved = localStorage.getItem(APP_SETTINGS_KEY);
    if (!saved) {
        applyTheme(appTheme);
        return;
    }

    try {
        const settings = JSON.parse(saved);
        settingsName.value = settings.name || '';
        settingsEmail.value = settings.email || '';
        settingsCurrency.value = settings.currency || 'PKR';
        settingsTheme.value = settings.theme || 'light';
        currentCurrency = settings.currency || 'PKR';
        applyTheme(settings.theme || 'light');
    } catch {
        applyTheme(appTheme);
    }
}

function saveSettings() {
    const settings = {
        name: settingsName.value.trim(),
        email: settingsEmail.value.trim(),
        currency: settingsCurrency.value,
        theme: settingsTheme.value
    };

    currentCurrency = settings.currency;
    applyTheme(settings.theme);
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
    showError('Settings have been saved successfully.');
    if (currentPage === 'dashboard') {
        renderSummary();
    }
    if (currentPage === 'purchases') {
        renderTable();
    }
    if (currentPage === 'sales') {
        renderSalesPage();
    }
    if (currentPage === 'reports') {
        renderReportsPage();
    }
    if (currentPage === 'tax') {
        renderTaxPage();
    }
}

function setupFaq() {
    document.querySelectorAll('.faq-item').forEach(item => {
        const button = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        button.addEventListener('click', () => {
            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0px';
            }
        });
    });
}

function downloadCsv(rows) {
    const header = ['Vendor Company Name', 'Bill ID', 'Vendor Name', 'Service', 'Category', 'Amount', 'Date', 'Status', 'Description'];
    const csv = [header.join(',')];

    rows.forEach(exp => {
        const line = [
            exp.vendorCompany,
            exp.billId,
            exp.vendorName,
            exp.service,
            exp.category,
            exp.amount,
            exp.date,
            exp.status,
            exp.description
        ].map(value => `"${String(value || '').replace(/"/g, '""')}"`).join(',');
        csv.push(line);
    });

    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function exportData() {
    const filtered = filterExpenses();
    if (!filtered.length) {
        showError('No expenses available for export.');
        return;
    }
    downloadCsv(filtered);
}

vendorFilter.addEventListener('change', renderTable);
periodFilter.addEventListener('change', () => {
    renderTable();
    renderSummary();
});
searchInput.addEventListener('input', () => {
    if (currentPage !== 'purchases') {
        showPage('purchases');
    } else {
        renderTable();
    }
});
navLinks.forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault();
        const page = link.dataset.page;
        if (page) showPage(page);
    });
});

refreshBtn.addEventListener('click', loadExpenses);
exportBtn.addEventListener('click', exportData);
openExpenseModalBtn.addEventListener('click', () => {
    editingExpenseId = null;
    expenseModal.querySelector('.modal-top h2').textContent = 'Add Expense';
    saveExpenseBtn.textContent = 'Save Expense';
    resetExpenseForm();
    openModal(expenseModal);
});
addVendorBtn.addEventListener('click', () => openModal(vendorModal));
closeExpenseModal.addEventListener('click', () => closeModal(expenseModal));
closeVendorModal.addEventListener('click', () => closeModal(vendorModal));
cancelExpense.addEventListener('click', () => closeModal(expenseModal));
cancelVendor.addEventListener('click', () => closeModal(vendorModal));
saveExpenseBtn.addEventListener('click', saveExpense);
saveVendorBtn.addEventListener('click', addVendor);
saveSettingsBtn.addEventListener('click', saveSettings);

loadSettings();
setupFaq();
loadExpenses().then(() => showPage('dashboard'));
