const input = document.getElementById("personHousehold");
const dropdown = document.getElementById("householdDropdown");
const hiddenInput = document.getElementById("maHoKhauHidden");
const items = dropdown.querySelectorAll(".dropdown-item");

input.addEventListener("input", () => {
    const value = input.value.toLowerCase();
    let visible = false;

    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        if (text.includes(value)) {
            item.style.display = "block";
            visible = true;
        } else {
            item.style.display = "none";
        }
    });

    dropdown.classList.toggle("hidden", !visible);
});

items.forEach(item => {
    item.addEventListener("mousedown", () => {
        input.value = item.dataset.value;
        hiddenInput.value = item.dataset.value;
        dropdown.classList.add("hidden");
    });
});

document.addEventListener("click", e => {
    if (!e.target.closest(".form-input")) {
        dropdown.classList.add("hidden");
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const addPersonForm = document.getElementById('addPersonForm');
    const householdInput = document.getElementById('personHousehold');
    const dropdown = document.getElementById('householdDropdown');
    const items = dropdown.querySelectorAll('.dropdown-item');

    // 1. Kiểm tra mã hộ khẩu ngay khi người dùng nhập xong (Blur)
    if (!householdInput || items.length === 0) return;

    householdInput.addEventListener('blur', function () {
        if (!maHoKhauHidden.value) {
            showMessage('Vui lòng chọn hộ khẩu từ danh sách!', 'error');
            this.classList.add('error');
            this.value = "";
        } else {
            this.classList.remove('error');
        }
    });

    // 2. Xử lý sự kiện Submit Form
    if (addPersonForm) {
        addPersonForm.addEventListener('submit', function(e) {
            // Chạy hàm kiểm tra tổng thể
            if (!validateForm()) {
                e.preventDefault(); // Dừng gửi nếu có lỗi
                return;
            }

            // Nếu mọi thứ OK, hiển thị trạng thái đang lưu
            const submitBtn = addPersonForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
            }
            // Trình duyệt sẽ tiếp tục gửi Form về Django
        });
    }

    // 3. Hàm kiểm tra dữ liệu (Validation)
    function validateForm() {
        let isValid = true;
        
        // Danh sách các trường bắt buộc (Khớp với ID trong HTML)
        const requiredFields = [
            { id: 'personHousehold', label: 'Hộ khẩu' },
            { id: 'personFullName', label: 'Họ và tên' },
            { id: 'personDob', label: 'Ngày sinh' },
            { id: 'personGender', label: 'Giới tính' },
            { id: 'personRelation', label: 'Quan hệ với chủ hộ' }
        ];

        // Xóa các thông báo lỗi cũ
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        });

        // Kiểm tra từng trường bắt buộc
        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (!element || !element.value.trim()) {
                if (element) element.classList.add('error');
                showMessage('Vui lòng kiểm tra lại các thông tin bắt buộc!', 'error');
                isValid = false;
            }
        });

        // Kiểm tra số CCCD (Nếu nhập thì phải đúng định dạng 9 hoặc 12 số)
        const idField = document.getElementById('personIdNumber');
        if (idField && idField.value.trim()) {
            const idPattern = /^\d{9,12}$/;
            if (!idPattern.test(idField.value.trim())) {
                idField.classList.add('error');
                showMessage('Số CMND/CCCD phải có từ 9-12 chữ số!', 'error');
                isValid = false;
            }
        }

        // Kiểm tra ngày sinh (Không được ở tương lai)
        const dobField = document.getElementById('personDob');
        if (dobField && dobField.value) {
            const dob = new Date(dobField.value);
            if (dob > new Date()) {
                dobField.classList.add('error');
                showMessage('Ngày sinh không thể trong tương lai!', 'error');
                isValid = false;
            }
        }

        // Kiểm tra quan hệ với chủ hộ không phải chủ hộ
        const relationField = document.getElementById('personRelation');
        if (relationField && relationField.value.trim().toLowerCase() === 'chủ hộ') {
            relationField.classList.add('error');
            showMessage('Không thể thêm chủ hộ!', 'error');
            isValid = false;
        }

        // if (!isValid) {
        //     showMessage('Vui lòng kiểm tra lại các thông tin bắt buộc!', 'error');
        // }

        return isValid;
    }

    // 4. Hàm hiển thị thông báo (Alert)
    // function showMessage(message, type) {
    //     // Xóa thông báo cũ
    //     document.querySelectorAll('.alert-js').forEach(alert => alert.remove());

    //     const alertDiv = document.createElement('div');
    //     alertDiv.className = `alert alert-${type} alert-js`;
        
    //     const icon = type === 'success' ? 'check-circle' : 
    //                 type === 'error' ? 'exclamation-triangle' : 'info-circle';
        
    //     alertDiv.innerHTML = `
    //         <i class="fas fa-${icon}"></i>
    //         <span>${message}</span>
    //     `;

    //     const pageHeader = document.querySelector('.page-header');
    //     if (pageHeader) {
    //         pageHeader.insertAdjacentElement('afterend', alertDiv);
    //     }

    //     // Tự động xóa sau 5 giây nếu không phải lỗi
    //     if (type !== 'error') {
    //         setTimeout(() => alertDiv.remove(), 5000);
    //     }
    // }
    function showMessage(message, type) {
        if (type === 'error') {
            alert("LỖI: " + message);
        } else if (type === 'success') {
            alert("THÀNH CÔNG: " + message);
        } else {
            alert(message);
        }
    }

    // 5. Hàm Reset Form (Gắn vào window để gọi từ HTML)
    window.resetForm = function() {
        if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu đã nhập?')) {
            addPersonForm.reset();
            document.querySelectorAll('.form-input').forEach(input => {
                input.classList.remove('error');
            });
            showMessage('Đã làm mới form!', 'info');
        }
    }
});

// CSS bổ sung cho các trạng thái lỗi và Alert
const style = document.createElement('style');
style.textContent = `
    .form-input.error { border-color: #ef4444 !important; background-color: #fef2f2; }
    .alert { padding: 15px; margin: 15px 0; border-radius: 8px; display: flex; align-items: center; gap: 10px; animation: slideDown 0.3s ease; }
    .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .alert-info { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
`;
document.head.appendChild(style);