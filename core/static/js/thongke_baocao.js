// ============================================
// THỐNG KÊ BÁO CÁO - JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Thống kê báo cáo loaded');
    
    // ============================================
    // TAB SWITCHING
    // ============================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active from all
            tabBtns.forEach(function(b) {
                b.classList.remove('active');
            });
            tabContents.forEach(function(c) {
                c.classList.remove('active');
            });
            
            // Add active to current
            this.classList.add('active');
            const targetContent = document.getElementById('tab-' + targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
    
    // ============================================
    // MONTH FILTER (Tab Nhân khẩu)
    // ============================================
    const applyBtn = document.getElementById('applyBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            const month = document.getElementById('monthFilter').value;
            if (month) {
                alert('Đã áp dụng bộ lọc tháng: ' + month);
            } else {
                alert('Vui lòng chọn tháng thống kê');
            }
        });
    }
    
    // ============================================
    // DONATION DATA
    // ============================================
    const donationData = {
        thuongbinh: [
            { stt: 1, maHK: 'HK-001', chuHo: 'Nguyễn Văn A', soTien: '200.000đ' },
            { stt: 2, maHK: 'HK-002', chuHo: 'Trần Thị B', soTien: '150.000đ' },
            { stt: 3, maHK: 'HK-003', chuHo: 'Lê Văn C', soTien: '100.000đ' },
            { stt: 4, maHK: 'HK-004', chuHo: 'Phạm Thị D', soTien: '300.000đ' },
            { stt: 5, maHK: 'HK-005', chuHo: 'Hoàng Văn E', soTien: '250.000đ' },
            { stt: 6, maHK: 'HK-007', chuHo: 'Đặng Văn G', soTien: '180.000đ' }
        ],
        treem: [
            { stt: 1, maHK: 'HK-001', chuHo: 'Nguyễn Văn A', soTien: '150.000đ' },
            { stt: 2, maHK: 'HK-003', chuHo: 'Lê Văn C', soTien: '100.000đ' },
            { stt: 3, maHK: 'HK-005', chuHo: 'Hoàng Văn E', soTien: '200.000đ' },
            { stt: 4, maHK: 'HK-007', chuHo: 'Đặng Văn G', soTien: '120.000đ' }
        ],
        khuivui: [
            { stt: 1, maHK: 'HK-001', chuHo: 'Nguyễn Văn A', soTien: '500.000đ' },
            { stt: 2, maHK: 'HK-002', chuHo: 'Trần Thị B', soTien: '300.000đ' },
            { stt: 3, maHK: 'HK-004', chuHo: 'Phạm Thị D', soTien: '400.000đ' }
        ],
        nguoingheo: [
            { stt: 1, maHK: 'HK-001', chuHo: 'Nguyễn Văn A', soTien: '250.000đ' },
            { stt: 2, maHK: 'HK-002', chuHo: 'Trần Thị B', soTien: '200.000đ' },
            { stt: 3, maHK: 'HK-003', chuHo: 'Lê Văn C', soTien: '150.000đ' },
            { stt: 4, maHK: 'HK-005', chuHo: 'Hoàng Văn E', soTien: '300.000đ' },
            { stt: 5, maHK: 'HK-007', chuHo: 'Đặng Văn G', soTien: '180.000đ' }
        ]
    };
    
    const householdDonations = [
        { maHK: 'HK-001', chuHo: 'Nguyễn Văn A', dotDongGop: 'Ủng hộ ngày thương binh-liệt sỹ 27/07', soTien: '200.000đ' },
        { maHK: 'HK-001', chuHo: 'Nguyễn Văn A', dotDongGop: 'Quỹ từ thiện trẻ em', soTien: '150.000đ' },
        { maHK: 'HK-001', chuHo: 'Nguyễn Văn A', dotDongGop: 'Xây dựng khu vui chơi trẻ em', soTien: '500.000đ' },
        { maHK: 'HK-001', chuHo: 'Nguyễn Văn A', dotDongGop: 'Ủng hộ người nghèo cuối năm', soTien: '250.000đ' },
        { maHK: 'HK-002', chuHo: 'Trần Thị B', dotDongGop: 'Ủng hộ ngày thương binh-liệt sỹ 27/07', soTien: '150.000đ' },
        { maHK: 'HK-002', chuHo: 'Trần Thị B', dotDongGop: 'Xây dựng khu vui chơi trẻ em', soTien: '300.000đ' },
        { maHK: 'HK-002', chuHo: 'Trần Thị B', dotDongGop: 'Ủng hộ người nghèo cuối năm', soTien: '200.000đ' },
        { maHK: 'HK-003', chuHo: 'Lê Văn C', dotDongGop: 'Ủng hộ ngày thương binh-liệt sỹ 27/07', soTien: '100.000đ' },
        { maHK: 'HK-003', chuHo: 'Lê Văn C', dotDongGop: 'Quỹ từ thiện trẻ em', soTien: '100.000đ' },
        { maHK: 'HK-003', chuHo: 'Lê Văn C', dotDongGop: 'Ủng hộ người nghèo cuối năm', soTien: '150.000đ' }
    ];
    
    // ============================================
    // DONATION CAMPAIGN FILTER
    // ============================================
    const donationCampaign = document.getElementById('donationCampaign');
    if (donationCampaign) {
        donationCampaign.addEventListener('change', function() {
            updateDonationDetails(this.value);
        });
    }
    
    function updateDonationDetails(campaign) {
        const tbody = document.querySelector('#donationDetailTable tbody');
        if (!tbody) return;
        
        const data = donationData[campaign] || donationData.thuongbinh;
        let html = '';
        let total = 0;
        
        data.forEach(function(item) {
            html += '<tr>' +
                '<td>' + item.stt + '</td>' +
                '<td>' + item.maHK + '</td>' +
                '<td>' + item.chuHo + '</td>' +
                '<td>' + item.soTien + '</td>' +
                '</tr>';
            
            const amount = parseInt(item.soTien.replace(/[^\d]/g, ''));
            total += amount;
        });
        
        html += '<tr class="total-row">' +
            '<td colspan="2"><strong>Tổng số hộ đã nộp: ' + data.length + ' hộ</strong></td>' +
            '<td colspan="2"><strong>Tổng tiền: ' + total.toLocaleString('vi-VN') + 'đ</strong></td>' +
            '</tr>';
        
        tbody.innerHTML = html;
    }
    
    // ============================================
    // HOUSEHOLD SEARCH
    // ============================================
    const searchHouseholdBtn = document.getElementById('searchHouseholdBtn');
    if (searchHouseholdBtn) {
        searchHouseholdBtn.addEventListener('click', function() {
            const searchQuery = document.getElementById('householdSearch').value.trim();
            if (searchQuery) {
                searchHouseholdDonations(searchQuery);
            } else {
                alert('Vui lòng nhập mã hộ khẩu hoặc tên chủ hộ');
            }
        });
    }
    
    const householdSearch = document.getElementById('householdSearch');
    if (householdSearch) {
        householdSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchQuery = this.value.trim();
                if (searchQuery) {
                    searchHouseholdDonations(searchQuery);
                }
            }
        });
    }
    
    function searchHouseholdDonations(query) {
        const tbody = document.querySelector('#householdDonationTable tbody');
        if (!tbody) return;
        
        const results = householdDonations.filter(function(item) {
            return item.maHK.toLowerCase().includes(query.toLowerCase()) ||
                   item.chuHo.toLowerCase().includes(query.toLowerCase());
        });
        
        if (results.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="no-data">Không tìm thấy kết quả</td></tr>';
            return;
        }
        
        let html = '';
        results.forEach(function(item) {
            html += '<tr>' +
                '<td>' + item.maHK + '</td>' +
                '<td>' + item.chuHo + '</td>' +
                '<td>' + item.dotDongGop + '</td>' +
                '<td>' + item.soTien + '</td>' +
                '</tr>';
        });
        
        tbody.innerHTML = html;
    }
});
