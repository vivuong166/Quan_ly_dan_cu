document.addEventListener('DOMContentLoaded', function() {
    // 1. Chuyển Tab
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const targetId = 'tab-' + this.dataset.tab;
            document.getElementById(targetId).classList.add('active');
        });
    });
    // Xử lý nút Lọc Nhân Khẩu
    let isFirstLoad = true;
    const btnFilter = document.getElementById("btn-filter-nk");
    const monthSelect = document.getElementById("filter-month");
    const yearSelect = document.getElementById("filter-year");

    const tableBody = document.querySelector(".excel-main-table tbody");
    const tableFoot = document.querySelector(".excel-main-table tfoot");

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    monthSelect.value = currentMonth;
    yearSelect.value = currentYear;

    function loadNhanKhauStats() {
        const month = monthSelect.value;
        const year = yearSelect.value;

        fetch(`/get-nhankhau-in-month/?month=${month}&year=${year}`)
            .then(response => response.json())
            .then(data => {
                tableBody.innerHTML = "";
                tableFoot.innerHTML = "";

                if (!data.stats || data.stats.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="5" class="no-data">Không có dữ liệu</td>
                        </tr>
                    `;
                    return;
                }

                // --- Render body ---
                data.stats.forEach((item, index) => {
                    const row = `
                        <tr>
                            <td>${index + 1}</td>
                            <td style="text-align:left;padding-left:20px;">
                                ${item.label}
                            </td>
                            <td><strong>${item.data.total}</strong></td>
                            <td>${item.data.nam}</td>
                            <td>${item.data.nu}</td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
                });

                // --- Render footer ---
                tableFoot.innerHTML = `
                    <tr>
                        <td colspan="2">Tổng cộng</td>
                        <td><strong>${data.tong.total}</strong></td>
                        <td><strong>${data.tong.nam}</strong></td>
                        <td><strong>${data.tong.nu}</strong></td>
                    </tr>
                `;
                if (!isFirstLoad) {
                    alert("Đã tải xong thống kê nhân khẩu!");
                }
                isFirstLoad = false;
            })
            .catch(err => {
                console.error("Lỗi tải thống kê nhân khẩu:", err);
            });
    }

    // Click nút lọc
    btnFilter.addEventListener("click", function (e) {
        e.preventDefault(); // ❗ rất quan trọng: không submit form
        loadNhanKhauStats();
    });

    // Load dữ liệu mặc định khi mở trang
    loadNhanKhauStats();

    // if (btnFilter) {
    //     btnFilter.addEventListener('click', function() {
    //         const month = document.getElementById('filter-month').value;
    //         const year = document.getElementById('filter-year').value;
            
    //         // Chuyển hướng trang kèm theo tham số để View xử lý
    //         // Giữ nguyên tab hiện tại là 'nhankhau'
    //         window.location.href = `?nk_month=${month}&nk_year=${year}`;
    //     });
    // }

    // 2. Xử lý khi đổi Select "Chọn đợt đóng góp"
    const selectCamp = document.getElementById('donationCampaign');
    const detailTableBody = document.querySelector('#donationDetailTable tbody');

    if (selectCamp) {
        selectCamp.addEventListener('change', function() {
            const campId = this.value;
            if (!campId) return;

            fetch(`/get-contribution-detail/?id=${campId}`)
                .then(response => response.json())
                .then(data => {
                    detailTableBody.innerHTML = ''; 
                    
                    if (data.details.length === 0) {
                        detailTableBody.innerHTML = '<tr><td colspan="4" class="no-data">Chưa có dữ liệu đóng góp đợt này</td></tr>';
                    } else {
                        data.details.forEach((item, index) => {
                            const row = `<tr>
                                <td>${index + 1}</td>
                                <td>${item.ma_ho}</td>
                                <td>${item.ten_chu_ho}</td>
                                <td>${item.so_tien}</td>
                            </tr>`;
                            detailTableBody.innerHTML += row;
                        });
                    }

                    const totalRow = `<tr class="total-row">
                        <td colspan="2">Tổng số hộ đã nộp: ${data.total_count} hộ</td>
                        <td colspan="2"><b>Tổng tiền: ${data.total_money}</b></td>
                    </tr>`;
                    detailTableBody.innerHTML += totalRow;
                });
        });
        // Load mặc định đợt đầu tiên
        selectCamp.dispatchEvent(new Event('change'));
    }

    // 3. Tra cứu theo hộ khẩu (Nút Tìm kiếm)
    const searchBtn = document.getElementById('searchHouseholdBtn');
    const searchInput = document.getElementById('householdSearch');
    const searchTableBody = document.querySelector('#householdDonationTable tbody');

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (!query) return;

            fetch(`/search-household-contribution/?query=${query}`)
                .then(response => response.json())
                .then(data => {
                    searchTableBody.innerHTML = '';
                    if (data.details.length === 0) {
                        searchTableBody.innerHTML = '<tr><td colspan="4" class="no-data">Không tìm thấy lịch sử đóng góp của hộ này</td></tr>';
                    } else {
                        data.details.forEach(item => {
                            const row = `<tr>
                                <td>${item.ma_ho}</td>
                                <td>${item.ten_chu_ho}</td>
                                <td>${item.ten_dot}</td>
                                <td>${item.so_tien}</td>
                            </tr>`;
                            searchTableBody.innerHTML += row;
                        });
                    }
                });
        });
    }
});