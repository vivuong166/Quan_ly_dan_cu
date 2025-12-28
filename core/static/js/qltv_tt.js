document.addEventListener("DOMContentLoaded", function () {
  // Debounce timers for search inputs
  let tamVangSearchTimeout;
  let tamTruSearchTimeout;

  // Search inputs
  const tamVangSearchInput = document.getElementById("searchTamVang");
  const tamTruSearchInput = document.getElementById("searchTamTru");

  // Results containers
  const tamVangResults = document.getElementById("tvResults");
  const tamTruResults = document.getElementById("ttResults");

  // Sample data for demonstration
  // const tamVangList = [
  //   { id: 1, full_name: 'Nguyễn Văn A', id_number: '012345678', start_date: '15/01/2024', end_date: '15/03/2024', destination: 'TP. Hồ Chí Minh' },
  //   { id: 2, full_name: 'Trần Thị B', id_number: '098765432', start_date: '01/02/2024', end_date: '01/04/2024', destination: 'Đà Nẵng' },
  // ];

  // const tamTruList = [
  //   { id: 1, full_name: 'Lê Văn C', id_number: '111222333', start_date: '10/01/2024', end_date: '10/06/2024', origin: 'Nghệ An' },
  //   { id: 2, full_name: 'Phạm Thị D', id_number: '444555666', start_date: '20/02/2024', end_date: '20/08/2024', origin: 'Thanh Hóa' },
  // ];

  const tamtrus = window.tamtrus
  const tamvang = window.tamvangs
  // Tạm vắng search with debounce
  if (tamVangSearchInput) {
    tamVangSearchInput.addEventListener("input", function () {
      clearTimeout(tamVangSearchTimeout);
      tamVangSearchTimeout = setTimeout(() => {
        searchTamVang(this.value.trim());
      }, 500);
    });
  }

  // Tạm trú search with debounce
  if (tamTruSearchInput) {
    tamTruSearchInput.addEventListener("input", function () {
      clearTimeout(tamTruSearchTimeout);
      tamTruSearchTimeout = setTimeout(() => {
        searchTamTru(this.value.trim());
      }, 500);
    });
  }

  function searchTamVang(searchTerm) {
    if (!searchTerm) {
      tamVangResults.style.display = "none";
      return;
    }

    const filteredList = tamvangs.filter(
      (item) =>
        item.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cccd && item.cccd.includes(searchTerm)
    );

    displayTamVangResults(filteredList);
  }

  function searchTamTru(searchTerm) {
    if (!searchTerm) {
      tamTruResults.style.display = "none";
      return;
    }

    const filteredList = tamtrus.filter(
      (item) =>
        item.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cccd && item.cccd.includes(searchTerm)
    );

    displayTamTruResults(filteredList);
  }

  function displayTamVangResults(results) {
    const resultsBody = tamVangResults.querySelector(".results-body");
    resultsBody.innerHTML = "";

    if (results.length === 0) {
      resultsBody.innerHTML =
        '<div class="no-results">Không tìm thấy kết quả nào</div>';
    } else {
      results.forEach((item) => {
        const resultItem = document.createElement("a");
        resultItem.className = "res";
        resultItem.href = `/tam-vang/${item.id}/`;
        resultItem.innerHTML = `
          <div class="res-main">${item.ho_ten}</div>
          <div class="res-sub">CCCD: ${item.cccd} | Từ ${item.ngay_bat_dau} đến ${item.ngay_ket_thuc} | Trạng thái: ${item.trang_thai_hoan_thanh}</div>
        `;
        resultsBody.appendChild(resultItem);
      });
    }

    // Update results header count
    const resultsHeader = tamVangResults.querySelector(".results-header");
    resultsHeader.textContent = `Kết quả Tạm vắng (${results.length})`;
    
    tamVangResults.style.display = "block";
  }

  function displayTamTruResults(results) {
    const resultsBody = tamTruResults.querySelector(".results-body");
    resultsBody.innerHTML = "";

    if (results.length === 0) {
      resultsBody.innerHTML =
        '<div class="no-results">Không tìm thấy kết quả nào</div>';
    } else {
      results.forEach((item) => {
        const resultItem = document.createElement("a");
        resultItem.className = "res";
        resultItem.href = `/tam-tru/${item.id}/`;
        resultItem.innerHTML = `
          <div class="res-main">${item.ho_ten}</div>
          <div class="res-sub">CCCD: ${item.cccd} | Từ ${item.ngay_bat_dau} đến ${item.ngay_ket_thuc} | Trạng thái: ${item.trang_thai_hoan_thanh}</div>
        `;
        resultsBody.appendChild(resultItem);
      });
    }

    // Update results header count
    const resultsHeader = tamTruResults.querySelector(".results-header");
    resultsHeader.textContent = `Kết quả Tạm trú (${results.length})`;
    
    tamTruResults.style.display = "block";
  }

  // Hide results when clicking outside
  document.addEventListener("click", function (event) {
    if (
      !tamVangResults.contains(event.target) &&
      event.target !== tamVangSearchInput
    ) {
      tamVangResults.style.display = "none";
    }
    if (
      !tamTruResults.contains(event.target) &&
      event.target !== tamTruSearchInput
    ) {
      tamTruResults.style.display = "none";
    }
  });

  // Show results on input focus if there's a value
  if (tamVangSearchInput) {
    tamVangSearchInput.addEventListener("focus", function () {
      if (this.value.trim()) {
        searchTamVang(this.value.trim());
      }
    });
  }

  if (tamTruSearchInput) {
    tamTruSearchInput.addEventListener("focus", function () {
      if (this.value.trim()) {
        searchTamTru(this.value.trim());
      }
    });
  }
});
