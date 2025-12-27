// document.addEventListener('DOMContentLoaded', function() {
//     // Form elements
//     const addPersonForm = document.getElementById('addPersonForm');
//     const successMessage = document.getElementById('successMessage');

//     // Form validation
//     addPersonForm.addEventListener('submit', function(e) {
//         e.preventDefault();
        
//         if (validateForm()) {
//             submitForm();
//         }
//     });

//     function validateForm() {
//         const required = ['personHousehold', 'personFullName', 'personDob', 'personGender', 'personRelation'];
//         let isValid = true;
        
//         // Clear previous error states
//         document.querySelectorAll('.form-input').forEach(input => {
//             input.classList.remove('error');
//         });

//         required.forEach(fieldId => {
//             const field = document.getElementById(fieldId);
//             if (!field.value.trim()) {
//                 field.classList.add('error');
//                 isValid = false;
//             }
//         });

//         // Validate date of birth (not in future)
//         const dobField = document.getElementById('personDob');
//         const dobValue = new Date(dobField.value);
//         const today = new Date();
        
//         if (dobValue > today) {
//             dobField.classList.add('error');
//             showMessage('Ngày sinh không thể trong tương lai!', 'error');
//             isValid = false;
//         }

//         // Validate ID number format (if provided)
//         const idField = document.getElementById('personIdNumber');
//         if (idField.value.trim()) {
//             const idPattern = /^\d{9,12}$/; // 9-12 digits
//             if (!idPattern.test(idField.value.trim())) {
//                 idField.classList.add('error');
//                 showMessage('Số CMND/CCCD phải có từ 9-12 chữ số!', 'error');
//                 isValid = false;
//             }
//         }

//         if (!isValid) {
//             showMessage('Vui lòng kiểm tra lại thông tin đã nhập!', 'error');
//         }

//         return isValid;
//     }

//     function submitForm() {
//         // Simulate API call
//         showMessage('Đang lưu thông tin...', 'info');
        
//         // Disable form during submission
//         const submitBtn = document.querySelector('button[type="submit"]');
//         submitBtn.disabled = true;
//         submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
        
//         setTimeout(() => {
//             // Simulate success
//             showMessage('Thêm nhân khẩu thành công!', 'success');
            
//             // Reset form
//             addPersonForm.reset();
            
//             // Re-enable form
//             submitBtn.disabled = false;
//             submitBtn.innerHTML = '<i class="fas fa-save"></i> Lưu nhân khẩu';
            
//             // Optionally redirect after success
//             setTimeout(() => {
//                 if (confirm('Thêm nhân khẩu thành công! Bạn có muốn xem danh sách nhân khẩu không?')) {
//                     window.location.href = '/api/nhankhau/';
//                 }
//             }, 1500);
            
//         }, 2000);
//     }

//     // Reset form function
//     window.resetForm = function() {
//         if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu đã nhập?')) {
//             addPersonForm.reset();
//             // Clear error states
//             document.querySelectorAll('.form-input').forEach(input => {
//                 input.classList.remove('error');
//             });
//             showMessage('Đã làm mới form!', 'info');
//         }
//     }

//     // Utility functions
//     function calculateAge(dateString) {
//         const birthDate = new Date(dateString);
//         const today = new Date();
//         let age = today.getFullYear() - birthDate.getFullYear();
//         const monthDiff = today.getMonth() - birthDate.getMonth();
        
//         if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//             age--;
//         }
        
//         return age;
//     }

//     function showMessage(message, type) {
//         // Remove existing messages
//         document.querySelectorAll('.alert').forEach(alert => {
//             alert.remove();
//         });

//         // Create new message
//         const alertDiv = document.createElement('div');
//         alertDiv.className = `alert alert-${type}`;
        
//         const icon = type === 'success' ? 'check-circle' : 
//                     type === 'error' ? 'exclamation-triangle' : 'info-circle';
        
//         alertDiv.innerHTML = `
//             <i class="fas fa-${icon}"></i>
//             <span>${message}</span>
//         `;

//         // Insert after page header
//         const pageHeader = document.querySelector('.page-header');
//         pageHeader.insertAdjacentElement('afterend', alertDiv);

//         // Auto remove after 5 seconds for non-error messages
//         if (type !== 'error') {
//             setTimeout(() => {
//                 if (alertDiv.parentNode) {
//                     alertDiv.remove();
//                 }
//             }, 5000);
//         }
//     }

//     // Auto-populate workplace based on occupation (optional enhancement)
//     document.getElementById('personOccupation').addEventListener('blur', function() {
//         const occupation = this.value.toLowerCase();
//         const workplaceField = document.getElementById('personWorkplace');
        
//         if (!workplaceField.value && occupation) {
//             // Suggest workplace based on common occupations
//             const suggestions = {
//                 'giáo viên': 'Trường học',
//                 'bác sĩ': 'Bệnh viện',
//                 'y tá': 'Bệnh viện/Trạm y tế',
//                 'kỹ sư': 'Công ty',
//                 'lập trình viên': 'Công ty IT',
//                 'nông dân': 'Hợp tác xã',
//                 'công nhân': 'Nhà máy',
//                 'học sinh': 'Trường học',
//                 'sinh viên': 'Trường đại học'
//             };
            
//             for (const [job, workplace] of Object.entries(suggestions)) {
//                 if (occupation.includes(job)) {
//                     workplaceField.placeholder = `Gợi ý: ${workplace}`;
//                     break;
//                 }
//             }
//         }
//     });
// });

// // Add CSS for error states
// const style = document.createElement('style');
// style.textContent = `
//     .form-input.error {
//         border-color: #ef4444 !important;
//         background-color: #fef2f2;
//     }
    
//     .alert-error {
//         background: #fef2f2;
//         color: #dc2626;
//         border: 1px solid #fecaca;
//     }
    
//     .alert-info {
//         background: #eff6ff;
//         color: #2563eb;
//         border: 1px solid #bfdbfe;
//     }
// `;
// document.head.appendChild(style);
document.addEventListener('DOMContentLoaded', function() {
    const addPersonForm = document.getElementById('addPersonForm');
    const householdInput = document.getElementById('personHousehold');
    const householdList = document.getElementById('householdList');

    // 1. Kiểm tra mã hộ khẩu ngay khi người dùng nhập xong (Blur)
    if (householdInput && householdList) {
        householdInput.addEventListener('blur', function() {
            const val = this.value.trim();
            const options = householdList.options;
            let exists = false;

            if (val === "") return;

            for (let i = 0; i < options.length; i++) {
                if (options[i].value === val) {
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                showMessage('Mã hộ khẩu không tồn tại trong hệ thống!', 'error');
                this.classList.add('error');
                this.value = ""; // Xóa giá trị sai
            } else {
                this.classList.remove('error');
            }
        });
    }

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