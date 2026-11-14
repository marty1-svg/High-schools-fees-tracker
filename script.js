

"use strict";

// ==================================
// SCHOOL FEE TRACKER
// STUDENT MANAGEMENT
// ==================================


// 1. Get HTML elements

const studentForm = document.getElementById("studentForm");
const studentTableBody = document.getElementById("studentTableBody");
const studentSearch = document.getElementById("studentSearch");
const totalStudents = document.getElementById("totalStudents");


// 2. Load saved student records

let students = JSON.parse(
    localStorage.getItem("schoolStudents") || "[]"
);


// 3. Save records in browser storage

function saveStudents() {

    localStorage.setItem(
        "schoolStudents",
        JSON.stringify(students)
    );

}


// 4. Display students

function displayStudents(searchTerm = "") {

    studentTableBody.innerHTML = "";

    const filteredStudents = students.filter(function(student) {

        return (
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
        );

    });

    filteredStudents.forEach(function(student) {

        const row = document.createElement("tr");

        const values = [
            student.admissionNo,
            student.name,
            student.studentClass,
            student.stream,
            student.guardian,
            student.phone
        ];

        values.forEach(function(value) {

            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);

        });

        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {

            deleteStudent(student.admissionNo);

        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        studentTableBody.appendChild(row);

    });

    totalStudents.textContent = students.length;

    document.getElementById("studentCount").textContent =
        filteredStudents.length + " student(s) displayed.";

}


// 5. Register a student

studentForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const student = {

        admissionNo: document.getElementById("admissionNo").value.trim(),

        name: document.getElementById("studentName").value.trim(),

        studentClass: document.getElementById("studentClass").value,

        stream: document.getElementById("studentStream").value.trim(),

        guardian: document.getElementById("guardianName").value.trim(),

        phone: document.getElementById("guardianPhone").value.trim()

    };


    // Check duplicate admission numbers

    const exists = students.some(function(item) {

        return item.admissionNo.toLowerCase() ===
            student.admissionNo.toLowerCase();

    });

    if (exists) {

        alert("This admission number already exists!");
        return;

    }


    // Add student

    students.push(student);

    saveStudents();

    displayStudents();

    studentForm.reset();

    alert("Student registered successfully!");

});


// 6. Delete a student

function deleteStudent(admissionNo) {

    const confirmed = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    students = students.filter(function(student) {

        return student.admissionNo !== admissionNo;

    });

    saveStudents();

    displayStudents();

}


// 7. Search students

studentSearch.addEventListener("input", function() {

    displayStudents(studentSearch.value);

});


// 8. Dashboard navigation

const navigationLinks = document.querySelectorAll(
    ".sidebar nav a"
);

navigationLinks.forEach(function(link) {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        const page = link.dataset.page;

        if (!page) {

            alert("This section will be developed next.");
            return;

        }

        document.querySelectorAll(".page-section").forEach(
            function(section) {

                section.hidden = true;

            }
        );

        document.getElementById(page + "-section").hidden = false;

        navigationLinks.forEach(function(item) {

            item.classList.remove("active");

        });

        link.classList.add("active");

    });

});


// 9. Logout placeholder

document.querySelector(".logout").addEventListener(
    "click",
    function() {

        alert("Login and logout security will be implemented later.");

    }
);


// 10. Load existing records

displayStudents();
