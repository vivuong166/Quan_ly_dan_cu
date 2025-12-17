document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const addPersonForm = document.getElementById('addPersonForm');
    const successMessage = document.getElementById('successMessage');

    // Form validation
    addPersonForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });

    function validateForm() {
        const required = ['personHousehold', 'personFullName', 'personDob', 'personGender', 'personRelation'];
        let isValid = true;
        
        // Clear previous error states
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        });

        required.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            }
        });

        // Validate date of birth (not in future)
        const dobField = document.getElementById('personDob');
        const dobValue = new Date(dobField.value);
        const today = new Date();
        
        if (dobValue > today) {
            dobField.classList.add('error');
            showMessage('Ngày sinh không thể trong tương lai!', 'error');
            isValid = false;
        }

        // Validate ID number format (if provided)
        const idField = document.getElementById('personIdNumber');
        if (idField.value.trim()) {
            const idPattern = /^\d{9,12}$/; // 9-12 digits
            if (!idPattern.test(idField.value.trim())) {
                idField.classList.add('error');
                showMessage('Số CMND/CCCD phải có từ 9-12 chữ số!', 'error');
                isValid = false;
            }
        }

        if (!isValid) {
            showMessage('Vui lòng kiểm tra lại thông tin đã nhập!', 'error');
        }

        return isValid;
    }

    function submitForm() {
        // Simulate API call
        showMessage('Đang lưu thông tin...', 'info');
        
        // Disable form during submission
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
        
        setTimeout(() => {
            // Simulate success
            showMessage('Thêm nhân khẩu thành công!', 'success');
            
            // Reset form
            addPersonForm.reset();
            
            // Re-enable form
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Lưu nhân khẩu';
            
            // Optionally redirect after success
            setTimeout(() => {
                if (confirm('Thêm nhân khẩu thành công! Bạn có muốn xem danh sách nhân khẩu không?')) {
                    window.location.href = '/api/nhankhau/';
                }
            }, 1500);
            
        }, 2000);
    }

    // Reset form function
    window.resetForm = function() {
        if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu đã nhập?')) {
            addPersonForm.reset();
            // Clear error states
            document.querySelectorAll('.form-input').forEach(input => {
                input.classList.remove('error');
            });
            showMessage('Đã làm mới form!', 'info');
        }
    }

    // Utility functions
    function calculateAge(dateString) {
        const birthDate = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    function showMessage(message, type) {
        // Remove existing messages
        document.querySelectorAll('.alert').forEach(alert => {
            alert.remove();
        });

        // Create new message
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-triangle' : 'info-circle';
        
        alertDiv.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;

        // Insert after page header
        const pageHeader = document.querySelector('.page-header');
        pageHeader.insertAdjacentElement('afterend', alertDiv);

        // Auto remove after 5 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 5000);
        }
    }

    // Auto-populate workplace based on occupation (optional enhancement)
    document.getElementById('personOccupation').addEventListener('blur', function() {
        const occupation = this.value.toLowerCase();
        const workplaceField = document.getElementById('personWorkplace');
        
        if (!workplaceField.value && occupation) {
            // Suggest workplace based on common occupations
            const suggestions = {
                'giáo viên': 'Trường học',
                'bác sĩ': 'Bệnh viện',
                'y tá': 'Bệnh viện/Trạm y tế',
                'kỹ sư': 'Công ty',
                'lập trình viên': 'Công ty IT',
                'nông dân': 'Hợp tác xã',
                'công nhân': 'Nhà máy',
                'học sinh': 'Trường học',
                'sinh viên': 'Trường đại học'
            };
            
            for (const [job, workplace] of Object.entries(suggestions)) {
                if (occupation.includes(job)) {
                    workplaceField.placeholder = `Gợi ý: ${workplace}`;
                    break;
                }
            }
        }
    });
});

// Add CSS for error states
const style = document.createElement('style');
style.textContent = `
    .form-input.error {
        border-color: #ef4444 !important;
        background-color: #fef2f2;
    }
    
    .alert-error {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
    }
    
    .alert-info {
        background: #eff6ff;
        color: #2563eb;
        border: 1px solid #bfdbfe;
    }
`;
document.head.appendChild(style);