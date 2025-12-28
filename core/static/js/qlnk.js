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
        household.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        household.head_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        household.address.toLowerCase().includes(searchTerm.toLowerCase())
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
        person.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.id_number.includes(searchTerm) ||
        person.household_code.toLowerCase().includes(searchTerm.toLowerCase())
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
        resultItem.href = `hokhau/chitiet/${household.ma_ho_khau}/`;
        resultItem.innerHTML = `
                    <div class="res-main">${household.code} — ${household.head_name}</div>
                    <div class="res-sub">${household.address}</div>
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
                    <div class="res-main">${person.full_name}</div>
                    <div class="res-sub">CCCD: ${person.id_number} | Hộ khẩu: ${person.household_code}</div>
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
  const viewModal = document.getElementById('viewPersonModal');
  const viewContent = document.getElementById('viewPersonContent');

  viewContent.innerHTML = `
            <div class="person-details" style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                <div style="grid-column:span 2;border-bottom:2px solid #2563eb;padding-bottom:8px;margin-bottom:10px;">
                    <h4 style="margin:0;color:#1e3a8a;font-size:1.2rem;">${person.ho_ten}</h4>
                    <p style="margin:5px 0 0;font-size:0.8rem;color:#666;">Mã hộ khẩu: ${person.ma_ho_khau}</p>
                </div>
                <div><strong>Ngày sinh:</strong> ${person.ngay_sinh}</div>
                <div><strong>Giới tính:</strong> ${person.gioi_tinh}</div>
                <div><strong>Quan hệ với chủ hộ:</strong> ${person.quan_he_chu_ho}</div>
                <div><strong>Ngày đăng ký thường trú:</strong> ${person.ngay_dang_ky_thuong_tru}</div>
                <div><strong>Nghề nghiệp:</strong> ${person.nghe_nghiep}</div>
                <div><strong>Nơi sinh:</strong> ${person.noi_sinh}</div>
                <div><strong>Quê quán:</strong> ${person.nguyen_quan}</div>
                <div><strong>Dân tộc:</strong> ${person.dan_toc}</div>
                <div style="grid-column:span 2;"><strong>Nơi làm việc:</strong> ${person.noi_lam_viec}</div>
                <div><strong>CMND/CCCD:</strong> ${person.cccd}</div>
                <div><strong>Ngày cấp CCCD:</strong> ${person.ngay_cap_cccd}</div>
                <div style="grid-column:span 2;"><strong>Nơi cấp CCCD:</strong> ${person.noi_cap_cccd}</div>
                <div style="grid-column:span 2;"><strong>Địa chỉ trước khi chuyển:</strong> ${person.dia_chi_truoc_khi_chuyen}</div>
                <div style="grid-column:span 2;"><strong>Trạng thái:</strong> ${person.trang_thai}</div>
            </div>
        `;
  viewModal.style.display = 'flex';
}

// Close person detail modal
function closePersonDetailModal() {
  const viewModal = document.getElementById('viewPersonModal');
  viewModal.style.display = "none";
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById("viewPersonModal");
  if (event.target === modal) {
    closePersonDetailModal();
  }
};
