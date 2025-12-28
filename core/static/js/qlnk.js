document.addEventListener("DOMContentLoaded", function () {
  // Debounce timers for search inputs
  let householdSearchTimeout;
  let personSearchTimeout;

  // Search inputs
  const householdSearchInput = document.getElementById("searchHoKhau");
  const personSearchInput = document.getElementById("searchNhanKhau");

  // Results containers
  const householdResults = document.getElementById("hkResults");
  const personResults = document.getElementById("nkResults");

  // Sample data for demonstration
  // const households = [
  //     { id: 1, code: 'HK-001', head_name: 'Nguyễn Văn A', address: 'Số 12, Đường X, La Khê' },
  //     { id: 2, code: 'HK-002', head_name: 'Trần Thị B', address: 'Số 34, Ngõ Y, La Khê' },
  //     { id: 3, code: 'HK-003', head_name: 'Lê Văn C', address: 'Số 56, Phố Z, La Khê' }
  // ];

  const households = window.households;
  const persons = window.persons;
  //   const persons = [
  //     {
  //       id: 101,
  //       full_name: "Nguyễn Văn A",
  //       id_number: "012345678",
  //       household_code: "HK-001",
  //     },
  //     {
  //       id: 102,
  //       full_name: "Trần Thị B",
  //       id_number: "098765432",
  //       household_code: "HK-002",
  //     },
  //     {
  //       id: 103,
  //       full_name: "Lê Văn C",
  //       id_number: "111222333",
  //       household_code: "HK-003",
  //     },
  //     {
  //       id: 104,
  //       full_name: "Phạm Thị D",
  //       id_number: "444555666",
  //       household_code: "HK-001",
  //     },
  //   ];

  // Household search with debounce
  if (householdSearchInput) {
    householdSearchInput.addEventListener("input", function () {
      clearTimeout(householdSearchTimeout);
      householdSearchTimeout = setTimeout(() => {
        searchHouseholds(this.value.trim());
      }, 500); // Wait 500ms after user stops typing
    });
  }

  // Person search with debounce
  if (personSearchInput) {
    personSearchInput.addEventListener("input", function () {
      clearTimeout(personSearchTimeout);
      personSearchTimeout = setTimeout(() => {
        searchPersons(this.value.trim());
      }, 500); // Wait 500ms after user stops typing
    });
  }

  function searchHouseholds(searchTerm) {
    if (!searchTerm) {
      householdResults.style.display = "none";
      return;
    }

    const filteredHouseholds = households.filter(
      (household) =>
        household.ma_ho_khau.toLowerCase().includes(searchTerm.toLowerCase()) ||
        household.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        household.so_nha.toLowerCase().includes(searchTerm.toLowerCase()) ||
        household.duong_pho.toLowerCase().includes(searchTerm.toLowerCase()) ||
        household.phuong.toLowerCase().includes(searchTerm.toLowerCase()) ||
        household.quan.toLowerCase().includes(searchTerm.toLowerCase())        
    );

    displayHouseholdResults(filteredHouseholds);
  }

  function searchPersons(searchTerm) {
    if (!searchTerm) {
      personResults.style.display = "none";
      return;
    }

    const filteredPersons = persons.filter(
      (person) =>
        person.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.ma_ho_khau.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.cccd && person.cccd.includes(searchTerm)
    );

    displayPersonResults(filteredPersons);
  }

  function displayHouseholdResults(results) {
    const resultsBody = householdResults.querySelector(".results-body");
    resultsBody.innerHTML = "";

    if (results.length === 0) {
      resultsBody.innerHTML =
        '<div class="no-results">Không tìm thấy hộ khẩu nào</div>';
    } else {
      results.forEach((household) => {
        const resultItem = document.createElement("a");
        resultItem.className = "res";
        resultItem.href = `/ho-khau/${household.ma_ho_khau}/`;
        resultItem.innerHTML = `
                    <div class="res-main">${household.ma_ho_khau} — ${household.ho_ten}</div>
                    <div class="res-sub">${household.so_nha}, ${household.duong_pho}, ${household.phuong}, ${household.quan}</div>
                `;
        resultsBody.appendChild(resultItem);
      });
    }

    householdResults.style.display = "block";
  }

  function displayPersonResults(results) {
    const resultsBody = personResults.querySelector(".results-body");
    resultsBody.innerHTML = "";

    if (results.length === 0) {
      resultsBody.innerHTML =
        '<div class="no-results">Không tìm thấy nhân khẩu nào</div>';
    } else {
      results.forEach((person) => {
        const resultItem = document.createElement("div");
        resultItem.className = "res";
        resultItem.style.cursor = "pointer";
        resultItem.onclick = function() {
          showPersonDetail(person);
        };
        resultItem.innerHTML = `
                    <div class="res-main">${person.ho_ten}</div>
                    <div class="res-sub">CCCD: ${person.cccd} | Hộ khẩu: ${person.ma_ho_khau}</div>
                `;
        resultsBody.appendChild(resultItem);
      });
    }

    personResults.style.display = "block";
  }

  // Hide results when clicking outside
  document.addEventListener("click", function (event) {
    if (
      !householdSearchInput.contains(event.target) &&
      !householdResults.contains(event.target)
    ) {
      householdResults.style.display = "none";
    }
    if (
      !personSearchInput.contains(event.target) &&
      !personResults.contains(event.target)
    ) {
      personResults.style.display = "none";
    }
  });

  // Advanced search toggle function
  window.showAdvancedSearch = function () {
    // Placeholder for advanced search functionality
    alert(
      "Tính năng tìm kiếm nâng cao sẽ được phát triển trong phiên bản tiếp theo"
    );
  };

  // Initialize - hide results initially
  if (householdResults) householdResults.style.display = "none";
  if (personResults) personResults.style.display = "none";
});

// Show person detail modal
function showPersonDetail(person) {
  const modal = document.getElementById("personDetailModal");
  
  // Fill in the details
  document.getElementById("detail-fullname").textContent = person.full_name || "N/A";
  document.getElementById("detail-dob").textContent = person.dob || "N/A";
  document.getElementById("detail-gender").textContent = person.gender === "M" ? "Nam" : person.gender === "F" ? "Nữ" : "Khác";
  document.getElementById("detail-idnumber").textContent = person.id_number || "N/A";
  document.getElementById("detail-household").textContent = person.household_code || "N/A";
  document.getElementById("detail-relation").textContent = person.relation_to_head || "N/A";
  document.getElementById("detail-occupation").textContent = person.occupation || "N/A";
  document.getElementById("detail-ethnicity").textContent = person.ethnicity || "N/A";
  
  // Show modal
  modal.style.display = "flex";
}

// Close person detail modal
function closePersonDetailModal() {
  const modal = document.getElementById("personDetailModal");
  modal.style.display = "none";
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById("personDetailModal");
  if (event.target === modal) {
    closePersonDetailModal();
  }
};
