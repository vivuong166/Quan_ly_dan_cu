/**
 * sohokhau.js - Phiên bản hoàn thiện kết nối dữ liệu thực Django
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('sohokhau.js loaded - Real Data Mode');

    // 1. DOM Elements
    const searchInput = document.getElementById('searchHousehold'); // ID này phải khớp với ô input tìm kiếm
    const householdList = document.getElementById('householdList'); // <tbody>
    const householdCount = document.getElementById('householdCount'); // Badge đếm
    
    // Các Modal
    const householdModal = document.getElementById('householdModal');
    const personModal = document.getElementById('personModal');
    const changeHeadModal = document.getElementById('changeHeadModal');

    // 2. Logic Tìm kiếm nhanh trên bảng (Duyệt qua các <tr> có sẵn)
    if (searchInput && householdList) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const rows = householdList.querySelectorAll('tr');
            let visibleCount = 0;

            rows.forEach(row => {
                // Chỉ tìm kiếm nếu hàng đó không phải hàng "Không tìm thấy dữ liệu"
                if (row.cells.length > 1) { 
                    const text = row.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        row.style.display = '';
                        visibleCount++;
                    } else {
                        row.style.display = 'none';
                    }
                }
            });

            // Cập nhật số lượng hiển thị
            if (householdCount) householdCount.textContent = visibleCount;
        });
    }

    // 3. Các hàm đóng mở Modal (Global scope để HTML gọi được)
    window.showAddHouseholdForm = function() {
        if (householdModal) {
            document.getElementById('modalTitle').textContent = 'Tạo hộ khẩu mới';
            document.getElementById('householdForm').reset();
            householdModal.style.display = 'flex';
        }
    };

    window.closeModal = function() {
        if (householdModal) householdModal.style.display = 'none';
        if (personModal) personModal.style.display = 'none';
        if (changeHeadModal) changeHeadModal.style.display = 'none';
    };

    window.closePersonModal = closeModal;
    window.closeChangeHeadModal = closeModal;

    // 4. Xử lý đổi chủ hộ (Nếu bạn vẫn muốn dùng Modal đổi chủ hộ)
    window.changeHouseholdHead = function(code, currentName) {
        if (changeHeadModal) {
            const householdSelect = document.getElementById('changeHeadHousehold');
            const currentHeadDiv = document.getElementById('currentHead');
            
            if (householdSelect) householdSelect.value = code;
            if (currentHeadDiv) {
                currentHeadDiv.innerHTML = `
                    <div class="info-card">
                        <i class="fas fa-crown"></i>
                        <span><strong>${currentName}</strong> (Chủ hộ hiện tại)</span>
                    </div>`;
            }
            changeHeadModal.style.display = 'flex';
        }
    };

    // 5. Hàm lưu thay đổi chủ hộ (Gửi về Server)
    window.saveChangeHead = function() {
        const formData = new FormData(document.getElementById('changeHeadForm'));
        
        // Gửi dữ liệu tới URL xử lý của Django
        fetch('/qlhk_nk/hokhau/update-head/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Cập nhật chủ hộ thành công!');
                location.reload(); // Load lại trang để thấy dữ liệu mới
            } else {
                alert('Lỗi: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    };

    // Hàm lấy CSRF Token để gửi request POST an toàn
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // 6. Đóng modal khi click ra ngoài
    window.onclick = function(event) {
        if (event.target === householdModal || event.target === personModal || event.target === changeHeadModal) {
            closeModal();
        }
    };
});