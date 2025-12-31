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
    const btnFilter = document.getElementById('btn-filter-nk');
    if (btnFilter) {
        btnFilter.addEventListener('click', function() {
            const month = document.getElementById('filter-month').value;
            const year = document.getElementById('filter-year').value;
            
            // Chuyển hướng trang kèm theo tham số để View xử lý
            // Giữ nguyên tab hiện tại là 'nhankhau'
            window.location.href = `?nk_month=${month}&nk_year=${year}&tab=nhankhau`;
        });
    }

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
                        <td colspan="2"><strong>Tổng số hộ đã nộp: ${data.total_count} hộ</strong></td>
                        <td colspan="2"><strong>Tổng tiền: ${data.total_money}</strong></td>
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