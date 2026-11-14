
"use strict";

// ===================================
// SCHOOL FEE TRACKER
// Main JavaScript file
// ===================================


// 1. Sample dashboard data

const schoolData = {
    totalStudents: 1250,
    expectedFees: 25000000,
    feesCollected: 18000000,
    outstandingFees: 7000000
};


// 2. Format money into Kenyan shillings

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0
    }).format(amount);
}


// 3. Calculate outstanding fees

function calculateBalance(expected, paid) {
    return expected - paid;
}


// 4. Display dashboard information

function displayDashboard() {

    console.log("School Fee Tracker Dashboard");

    console.log(
        "Total Students:",
        schoolData.totalStudents
    );

    console.log(
        "Expected Fees:",
        formatCurrency(schoolData.expectedFees)
    );

    console.log(
        "Fees Collected:",
        formatCurrency(schoolData.feesCollected)
    );

    console.log(
        "Outstanding Fees:",
        formatCurrency(schoolData.outstandingFees)
    );
}


// 5. Navigation menu interaction

const navigationLinks = document.querySelectorAll(
    ".sidebar nav a"
);

navigationLinks.forEach(function(link) {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        navigationLinks.forEach(function(item) {
            item.classList.remove("active");
        });

        link.classList.add("active");

        console.log(
            "Selected section:",
            link.textContent
        );

    });

});


// 6. Logout interaction

const logoutButton = document.querySelector(".logout");

logoutButton.addEventListener("click", function() {

    alert("Logout functionality will be connected to authentication later.");

});


// 7. Run dashboard

displayDashboard();
