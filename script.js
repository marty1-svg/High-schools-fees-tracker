
"use strict";

/* =========================================
   FEETRACKER - SCHOOL FEE MANAGEMENT SYSTEM
   ========================================= */

const DB_KEY = "feetracker_database_v1";

const defaultDB = {
    students: [],
    parents: [],
    feeStructures: [
        { id: 1, className: "Form 1", amount: 50000 },
        { id: 2, className: "Form 2", amount: 50000 },
        { id: 3, className: "Form 3", amount: 55000 },
        { id: 4, className: "Form 4", amount: 55000 }
    ],
    payments: [],
    settings: {
        schoolName: "FeeTracker School"
    }
};

let db;

try {
    db = JSON.parse(localStorage.getItem(DB_KEY)) || defaultDB;
} catch (error) {
    db = defaultDB;
}

function saveDB() {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function money(amount) {
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0
    }).format(Number(amount) || 0);
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function notify(message) {
    let box = document.getElementById("ft-notification");

    if (!box) {
        box = document.createElement("div");
        box.id = "ft-notification";
        document.body.appendChild(box);
    }

    box.textContent = message;
    box.style.cssText =
        "position:fixed;bottom:25px;right:20px;background:#172554;" +
        "color:white;padding:15px 22px;border-radius:8px;" +
        "z-index:99999;box-shadow:0 4px 15px #0003;";

    setTimeout(() => box.remove(), 3000);
}

function getStudentPayments(studentId) {
    return db.payments
        .filter(p => Number(p.studentId) === Number(studentId))
        .reduce((sum, p) => sum + Number(p.amount), 0);
}

function getStudentFee(student) {
    const structure = db.feeStructures.find(
        f => f.className === student.className
    );

    return structure ? Number(structure.amount) : 0;
}

function getBalance(student) {
    return Math.max(
        0,
        getStudentFee(student) - getStudentPayments(student.id)
    );
}

function totalExpected() {
    return db.students.reduce(
        (sum, student) => sum + getStudentFee(student), 0
    );
}

function totalCollected() {
    return db.payments.reduce(
        (sum, payment) => sum + Number(payment.amount), 0
    );
}

function totalOutstanding() {
    return db.students.reduce(
        (sum, student) => sum + getBalance(student), 0
    );
}

/* =========================================
   CREATE APPLICATION AREA
   ========================================= */

let app = document.getElementById("feetracker-content");

function initializeApp() {
    let container =
        document.querySelector(".main-content") ||
        document.querySelector("main") ||
        document.querySelector(".content");

    if (!container) {
        container = document.createElement("main");
        document.body.appendChild(container);
    }

    app = document.getElementById("feetracker-content");

    if (!app) {
        app = document.createElement("div");
        app.id = "feetracker-content";
        container.appendChild(app);
    }

    app.style.cssText = "width:100%;box-sizing:border-box;";
    addStyles();
    setupNavigation();
    showSection("Dashboard");
}

function addStyles() {
    if (document.getElementById("ft-styles")) return;

    const style = document.createElement("style");
    style.id = "ft-styles";

    style.textContent = `
        #feetracker-content {
            padding:20px;
            color:#172033;
            font-family:Arial,sans-serif;
        }
        #feetracker-content * {box-sizing:border-box;}
        .ft-grid {
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(190px,1fr));
            gap:16px;
            margin:20px 0;
        }
        .ft-card {
            background:white;
            padding:20px;
            border-radius:12px;
            box-shadow:0 2px 10px #00000012;
            border-left:5px solid #2563eb;
        }
        .ft-card h3 {font-size:15px;color:#64748b;}
        .ft-card strong {font-size:25px;}
        .ft-panel {
            background:white;
            padding:20px;
            margin:18px 0;
            border-radius:12px;
            box-shadow:0 2px 10px #00000010;
            overflow-x:auto;
        }
        .ft-form {
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
            gap:14px;
        }
        .ft-form label {
            display:block;
            font-weight:bold;
            margin-bottom:6px;
        }
        .ft-form input,.ft-form select {
            width:100%;
            padding:12px;
            border:1px solid #cbd5e1;
            border-radius:7px;
            margin-top:5px;
        }
        .ft-btn {
            padding:11px 16px;
            border:0;
            border-radius:7px;
            background:#2563eb;
            color:white;
            cursor:pointer;
            margin:4px;
        }
        .ft-danger {background:#dc2626;}
        .ft-success {background:#15803d;}
        .ft-table {
            width:100%;
            border-collapse:collapse;
            min-width:600px;
        }
        .ft-table th,.ft-table td {
            padding:12px;
            border-bottom:1px solid #e2e8f0;
            text-align:left;
        }
        .ft-table th {background:#f1f5f9;}
        .ft-search {
            width:100%;
            max-width:400px;
            padding:12px;
            border:1px solid #cbd5e1;
            border-radius:7px;
            margin:10px 0;
        }
        .ft-heading {
            display:flex;
            justify-content:space-between;
            flex-wrap:wrap;
            align-items:center;
            gap:10px;
        }
        .ft-empty {padding:20px;color:#64748b;}
        @media(max-width:600px) {
            #feetracker-content {padding:12px;}
            .ft-panel {padding:13px;}
        }
    `;

    document.head.appendChild(style);
}

/* =========================================
   NAVIGATION
   ========================================= */

const sections = [
    "Dashboard",
    "Students",
    "Parents",
    "Fee Structure",
    "Payments",
    "Fee Balances",
    "Reports",
    "Settings"
];

function setupNavigation() {
    const navItems = document.querySelectorAll(
        "nav a, nav button, .sidebar a, .sidebar button, " +
        ".nav a, .nav button, [data-section]"
    );

    navItems.forEach(item => {
        const label = item.dataset.section ||
            item.textContent.trim();

        const section = sections.find(
            name => name.toLowerCase() === label.toLowerCase()
        );

        if (section) {
            item.addEventListener("click", event => {
                event.preventDefault();
                showSection(section);

                navItems.forEach(nav => nav.classList.remove("active"));
                item.classList.add("active");
            });
        }
    });

    document.querySelectorAll(".logout").forEach(button => {
        button.addEventListener("click", logout);
    });

    // Also recognize logout buttons by their visible text.
    document.querySelectorAll("button, a").forEach(button => {
        if (button.textContent.trim().toLowerCase() === "logout") {
            button.addEventListener("click", logout);
        }
    });
}

function showSection(section) {
    if (!sections.includes(section)) return;

    const views = {
        "Dashboard": dashboardView,
        "Students": studentsView,
        "Parents": parentsView,
        "Fee Structure": feeStructureView,
        "Payments": paymentsView,
        "Fee Balances": balancesView,
        "Reports": reportsView,
        "Settings": settingsView
    };

    app.innerHTML = views[section]();
    app.dataset.currentSection = section;
}

/* =========================================
   DASHBOARD
   ========================================= */

function dashboardView() {
    return `
        <h2>Dashboard</h2>
        <p>School Fee Management System</p>

        <div class="ft-grid">
            <div class="ft-card">
                <h3>Total Students</h3>
                <strong>${db.students.length}</strong>
            </div>

            <div class="ft-card">
                <h3>Expected Fees</h3>
                <strong>${money(totalExpected())}</strong>
            </div>

            <div class="ft-card">
                <h3>Fees Collected</h3>
                <strong>${money(totalCollected())}</strong>
            </div>

            <div class="ft-card">
                <h3>Outstanding Fees</h3>
                <strong>${money(totalOutstanding())}</strong>
            </div>
        </div>

        <div class="ft-panel">
            <h3>Recent Payments</h3>
            ${paymentTable(db.payments.slice().reverse().slice(0, 5))}
        </div>
    `;
}

/* =========================================
   STUDENTS
   ========================================= */

function studentsView() {
    return `
        <div class="ft-heading">
            <h2>Student Management</h2>
            <button class="ft-btn" data-action="student-form">
                + Register Student
            </button>
        </div>

        <div id="student-form-area"></div>

        <div class="ft-panel">
            <h3>Registered Students (${db.students.length})</h3>

            <input class="ft-search" id="student-search"
                placeholder="Search name, admission number or class..."
                oninput="searchStudents(this.value)">

            <div id="student-table">
                ${studentTable(db.students)}
            </div>
        </div>
    `;
}

function studentForm(student = null) {
    const editing = student !== null;

    return `
        <div class="ft-panel">
            <h3>${editing ? "Edit Student" : "Register New Student"}</h3>

            <form id="student-form" class="ft-form">
                <label>Full Name
                    <input name="name" required
                        value="${escapeHTML(student?.name || "")}">
                </label>

                <label>Admission Number
                    <input name="admission" required
                        value="${escapeHTML(student?.admission || "")}">
                </label>

                <label>Class
                    <select name="className" required>
                        <option value="">Select Class</option>
                        ${db.feeStructures.map(f => `
                            <option value="${escapeHTML(f.className)}"
                            ${student?.className === f.className ? "selected" : ""}>
                                ${escapeHTML(f.className)}
                            </option>
                        `).join("")}
                    </select>
                </label>

                <label>Parent
                    <select name="parentId">
                        <option value="">Select Parent (optional)</option>
                        ${db.parents.map(p => `
                            <option value="${p.id}"
                            ${Number(student?.parentId) === p.id ? "selected" : ""}>
                                ${escapeHTML(p.name)}
                            </option>
                        `).join("")}
                    </select>
                </label>

                <div>
                    <button class="ft-btn" type="submit">
                        ${editing ? "Update Student" : "Save Student"}
                    </button>
                    <button class="ft-btn ft-danger"
                        type="button" data-action="cancel-form">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;
}

function studentTable(students) {
    if (!students.length) {
        return `<p class="ft-empty">No students registered yet.</p>`;
    }

    return `
        <table class="ft-table">
            <thead>
                <tr>
                    <th>Admission No.</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Fees</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${students.map(s => `
                    <tr>
                        <td>${escapeHTML(s.admission)}</td>
                        <td>${escapeHTML(s.name)}</td>
                        <td>${escapeHTML(s.className)}</td>
                        <td>${money(getStudentFee(s))}</td>
                        <td>${money(getStudentPayments(s.id))}</td>
                        <td>${money(getBalance(s))}</td>
                        <td>
                            <button class="ft-btn"
                                data-action="edit-student"
                                data-id="${s.id}">Edit</button>

                            <button class="ft-btn ft-danger"
                                data-action="delete-student"
                                data-id="${s.id}">Delete</button>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

function searchStudents(query) {
    const term = query.toLowerCase();

    const results = db.students.filter(s =>
        [s.name, s.admission, s.className]
            .some(value => value.toLowerCase().includes(term))
    );

    document.getElementById("student-table").innerHTML =
        studentTable(results);
}

/* =========================================
   PARENTS
   ========================================= */

function parentsView() {
    return `
        <div class="ft-heading">
            <h2>Parent Management</h2>
            <button class="ft-btn" data-action="parent-form">
                + Register Parent
            </button>
        </div>

        <div id="parent-form-area"></div>

        <div class="ft-panel">
            <h3>Registered Parents</h3>
            ${parentTable()}
        </div>
    `;
}

function parentForm() {
    return `
        <div class="ft-panel">
            <h3>Register Parent</h3>

            <form id="parent-form" class="ft-form">
                <label>Parent Name
                    <input name="name" required>
                </label>

                <label>Phone Number
                    <input name="phone" required>
                </label>

                <label>Email Address
                    <input name="email" type="email">
                </label>

                <button class="ft-btn" type="submit">
                    Save Parent
                </button>
            </form>
        </div>
    `;
}

function parentTable() {
    if (!db.parents.length) {
        return `<p class="ft-empty">No parents registered.</p>`;
    }

    return `
        <table class="ft-table">
            <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Students</th>
                <th>Actions</th>
            </tr>

            ${db.parents.map(p => `
                <tr>
                    <td>${escapeHTML(p.name)}</td>
                    <td>${escapeHTML(p.phone)}</td>
                    <td>${escapeHTML(p.email)}</td>
                    <td>${db.students.filter(
                        s => Number(s.parentId) === p.id
                    ).map(s => escapeHTML(s.name)).join(", ") || "None"}</td>
                    <td>
                        <button class="ft-btn ft-danger"
                            data-action="delete-parent"
                            data-id="${p.id}">Delete</button>
                    </td>
                </tr>
            `).join("")}
        </table>
    `;
}

/* =========================================
   FEE STRUCTURE
   ========================================= */

function feeStructureView() {
    return `
        <h2>Fee Structure Management</h2>

        <div class="ft-panel">
            <h3>Add or Update Class Fees</h3>

            <form id="fee-form" class="ft-form">
                <label>Class Name
                    <input name="className" required
                        placeholder="e.g. Form 1">
                </label>

                <label>Annual Fee (KES)
                    <input name="amount" type="number"
                        min="1" required>
                </label>

                <button class="ft-btn" type="submit">
                    Save Fee Structure
                </button>
            </form>
        </div>

        <div class="ft-panel">
            <h3>Current Fee Structure</h3>

            <table class="ft-table">
                <tr>
                    <th>Class</th>
                    <th>Annual Fee</th>
                    <th>Action</th>
                </tr>

                ${db.feeStructures.map(f => `
                    <tr>
                        <td>${escapeHTML(f.className)}</td>
                        <td>${money(f.amount)}</td>
                        <td>
                            <button class="ft-btn ft-danger"
                                data-action="delete-fee"
                                data-id="${f.id}">Delete</button>
                        </td>
                    </tr>
                `).join("")}
            </table>
        </div>
    `;
}

/* =========================================
   PAYMENTS
   ========================================= */

function paymentsView() {
    return `
        <h2>Record Student Payment</h2>

        <div class="ft-panel">
            <form id="payment-form" class="ft-form">

                <label>Student
                    <select name="studentId" required>
                        <option value="">Select Student</option>
                        ${db.students.map(s => `
                            <option value="${s.id}">
                                ${escapeHTML(s.name)} - ${escapeHTML(s.admission)}
                            </option>
                        `).join("")}
                    </select>
                </label>

                <label>Amount (KES)
                    <input name="amount" type="number"
                        min="1" required>
                </label>

                <label>Payment Method
                    <select name="method" required>
                        <option value="">Select Method</option>
                        <option>M-Pesa</option>
                        <option>Bank</option>
                        <option>Cash</option>
                        <option>Other</option>
                    </select>
                </label>

                <label>Transaction Reference
                    <input name="reference" required>
                </label>

                <label>Payment Date
                    <input name="date" type="date"
                        value="${new Date().toISOString().slice(0,10)}"
                        required>
                </label>

                <button class="ft-btn ft-success" type="submit">
                    Record Payment
                </button>
            </form>
        </div>

        <div class="ft-panel">
            <h3>Payment History</h3>
            ${paymentTable(db.payments.slice().reverse())}
        </div>
    `;
}

function paymentTable(payments) {
    if (!payments.length) {
        return `<p class="ft-empty">No payments recorded.</p>`;
    }

    return `
        <table class="ft-table">
            <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
            </tr>

            ${payments.map(p => {
                const student = db.students.find(
                    s => s.id === Number(p.studentId)
                );

                return `
                    <tr>
                        <td>${escapeHTML(p.date)}</td>
                        <td>${escapeHTML(student?.name || "Unknown")}</td>
                        <td>${money(p.amount)}</td>
                        <td>${escapeHTML(p.method)}</td>
                        <td>${escapeHTML(p.reference)}</td>
                    </tr>
                `;
            }).join("")}
        </table>
    `;
}

/* =========================================
   FEE BALANCES
   ========================================= */

function balancesView() {
    return `
        <h2>Student Fee Balances</h2>

        <div class="ft-grid">
            <div class="ft-card">
                <h3>Total Expected</h3>
                <strong>${money(totalExpected())}</strong>
            </div>

            <div class="ft-card">
                <h3>Total Paid</h3>
                <strong>${money(totalCollected())}</strong>
            </div>

            <div class="ft-card">
                <h3>Total Outstanding</h3>
                <strong>${money(totalOutstanding())}</strong>
            </div>
        </div>

        <div class="ft-panel">
            <h3>Individual Student Balances</h3>

            ${studentTable(db.students)}
        </div>
    `;
}

/* =========================================
   REPORTS
   ========================================= */

function reportsView() {
    return `
        <h2>School Fee Reports</h2>

        <div class="ft-grid">
            <div class="ft-card">
                <h3>Registered Students</h3>
                <strong>${db.students.length}</strong>
            </div>

            <div class="ft-card">
                <h3>Expected Fees</h3>
                <strong>${money(totalExpected())}</strong>
            </div>

            <div class="ft-card">
                <h3>Collected</h3>
                <strong>${money(totalCollected())}</strong>
            </div>

            <div class="ft-card">
                <h3>Outstanding</h3>
                <strong>${money(totalOutstanding())}</strong>
            </div>
        </div>

        <div class="ft-panel">
            <h3>Student Fee Report</h3>

            ${studentTable(db.students)}

            <button class="ft-btn" data-action="print-report">
                Print Report
            </button>
        </div>

        <div class="ft-panel">
            <button class="ft-btn ft-success"
                data-action="export-data">
                Export Database Backup
            </button>
        </div>
    `;
}

/* =========================================
   SETTINGS
   ========================================= */

function settingsView() {
    return `
        <h2>System Settings</h2>

        <div class="ft-panel">
            <h3>School Information</h3>

            <form id="settings-form" class="ft-form">
                <label>School Name
                    <input name="schoolName" required
                        value="${escapeHTML(db.settings.schoolName)}">
                </label>

                <button class="ft-btn" type="submit">
                    Save Settings
                </button>
            </form>
        </div>

        <div class="ft-panel">
            <h3>Database Management</h3>

            <p>Export your data regularly to keep a backup.</p>

            <button class="ft-btn ft-success"
                data-action="export-data">
                Download Backup
            </button>
        </div>
    `;
}

/* =========================================
   ACTION HANDLERS
   ========================================= */

document.addEventListener("click", function(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const id = Number(button.dataset.id);

    if (action === "student-form") {
        document.getElementById("student-form-area").innerHTML =
            studentForm();
    }

    if (action === "cancel-form") {
        const area = button.closest("#student-form-area");
        if (area) area.innerHTML = "";
    }

    if (action === "edit-student") {
        const student = db.students.find(s => s.id === id);
        document.getElementById("student-form-area").innerHTML =
            studentForm(student);
    }

    if (action === "delete-student") {
        if (confirm("Delete this student and their payment records?")) {
            db.students = db.students.filter(s => s.id !== id);
            db.payments = db.payments.filter(
                p => Number(p.studentId) !== id
            );
            saveDB();
            showSection("Students");
            notify("Student deleted.");
        }
    }

    if (action === "parent-form") {
        document.getElementById("parent-form-area").innerHTML =
            parentForm();
    }

    if (action === "delete-parent") {
        if (confirm("Delete this parent?")) {
            db.parents = db.parents.filter(p => p.id !== id);
            db.students.forEach(s => {
                if (Number(s.parentId) === id) s.parentId = "";
            });
            saveDB();
            showSection("Parents");
            notify("Parent deleted.");
        }
    }

    if (action === "delete-fee") {
        const className = db.feeStructures.find(f => f.id === id)?.className;

        if (db.students.some(s => s.className === className)) {
            notify("Move students to another class before deleting this fee.");
        } else if (confirm("Delete this fee structure?")) {
            db.feeStructures = db.feeStructures.filter(f => f.id !== id);
            saveDB();
            showSection("Fee Structure");
        }
    }

    if (action === "print-report") {
        window.print();
    }

    if (action === "export-data") {
        exportDatabase();
    }
});

/* =========================================
   FORM SUBMISSIONS
   ========================================= */

document.addEventListener("submit", function(event) {
    const form = event.target;
    event.preventDefault();

    const data = new FormData(form);

    if (form.id === "student-form") {
        const admission = data.get("admission").trim();

        const existing = db.students.find(
            s => s.admission.toLowerCase() === admission.toLowerCase()
        );

        const editingId = form.dataset.editingId;

        if (existing && Number(editingId) !== existing.id) {
            notify("Admission number already exists.");
            return;
        }

        const student = {
            id: editingId ? Number(editingId) : Date.now(),
            name: data.get("name").trim(),
            admission,
            className: data.get("className"),
            parentId: data.get("parentId")
        };

        if (editingId) {
            db.students = db.students.map(s =>
                s.id === student.id ? student : s
            );
        } else {
            db.students.push(student);
        }

        saveDB();
        showSection("Students");
        notify("Student saved successfully.");
    }

    if (form.id === "parent-form") {
        db.parents.push({
            id: Date.now(),
            name: data.get("name").trim(),
            phone: data.get("phone").trim(),
            email: data.get("email").trim()
        });

        saveDB();
        showSection("Parents");
        notify("Parent registered successfully.");
    }

    if (form.id === "fee-form") {
        const className = data.get("className").trim();
        const amount = Number(data.get("amount"));

        if (amount <= 0) {
            notify("Enter a valid fee amount.");
            return;
        }

        const existing = db.feeStructures.find(
            f => f.className.toLowerCase() === className.toLowerCase()
        );

        if (existing) {
            existing.amount = amount;
        } else {
            db.feeStructures.push({
                id: Date.now(),
                className,
                amount
            });
        }

        saveDB();
        showSection("Fee Structure");
        notify("Fee structure saved.");
    }

    if (form.id === "payment-form") {
        const studentId = Number(data.get("studentId"));
        const amount = Number(data.get("amount"));
        const student = db.students.find(s => s.id === studentId);

        if (!student || amount <= 0) {
            notify("Enter valid payment details.");
            return;
        }

        if (db.payments.some(
            p => p.reference === data.get("reference").trim()
        )) {
            notify("This transaction reference already exists.");
            return;
        }

        db.payments.push({
            id: Date.now(),
            studentId,
            amount,
            method: data.get("method"),
            reference: data.get("reference").trim(),
            date: data.get("date")
        });

        saveDB();
        showSection("Payments");
        notify("Payment recorded successfully.");
    }

    if (form.id === "settings-form") {
        db.settings.schoolName = data.get("schoolName").trim();
        saveDB();
        notify("Settings saved successfully.");
    }
});

/* =========================================
   EXPORT DATABASE BACKUP
   ========================================= */

function exportDatabase() {
    const file = new Blob(
        [JSON.stringify(db, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "feetracker-backup.json";
    link.click();

    URL.revokeObjectURL(url);
    notify("Database backup downloaded.");
}

/* =========================================
   LOGOUT
   ========================================= */

function logout() {
    if (confirm("Are you sure you want to log out?")) {
        sessionStorage.removeItem("adminLoggedIn");
        notify("Logged out. This demo does not yet have secure authentication.");
    }
}

/* =========================================
   START APPLICATION
   ========================================= */

document.addEventListener("DOMContentLoaded", initializeApp);

if (document.readyState !== "loading") {
    initializeApp();
}


