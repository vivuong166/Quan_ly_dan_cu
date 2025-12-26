// document.addEventListener('DOMContentLoaded', function() {
//     let currentStep = 1;
//     const totalSteps = 3;
    
//     // Initialize form
//     initializeForm();
//     updateFormNavigation();
    
//     // Event listeners
//     setupEventListeners();
    
//     function initializeForm() {
//         // Set default ethnicity
//         document.getElementById('headEthnicity').value = 'Kinh';
        
//         // Show first step
//         showStep(1);
        
//         // Update address preview when fields change
//         const addressFields = ['houseNumber', 'streetName', 'wardName'];
//         addressFields.forEach(fieldId => {
//             const field = document.getElementById(fieldId);
//             if (field) {
//                 field.addEventListener('input', updateAddressPreview);
//                 field.addEventListener('change', updateAddressPreview);
//             }
//         });
//     }
    
//     function setupEventListeners() {
//         // ID number formatting
//         document.getElementById('headIdNumber').addEventListener('input', function() {
//             // Remove non-numeric characters
//             this.value = this.value.replace(/[^0-9]/g, '');
//         });
        
//         // Auto-generate household code if empty on form submission
//         document.getElementById('householdForm').addEventListener('submit', function(e) {
//             e.preventDefault();
//             const codeField = document.getElementById('householdCode');
//             if (!codeField.value.trim()) {
//                 codeField.value = generateHouseholdCode();
//             }
//         });
        
//         // Real-time summary updates
//         const summaryFields = [
//             'householdCode', 'headFullName', 'houseNumber', 'streetName'
//         ];
//         summaryFields.forEach(fieldId => {
//             const field = document.getElementById(fieldId);
//             if (field) {
//                 field.addEventListener('input', updateSummary);
//                 field.addEventListener('change', updateSummary);
//             }
//         });
//     }
    
//     function showStep(stepNumber) {
//         // Hide all steps
//         document.querySelectorAll('.form-step').forEach(step => {
//             step.classList.remove('active');
//         });
        
//         // Show current step
//         document.getElementById(`step-${stepNumber}`).classList.add('active');
        
//         // Update progress indicators
//         document.querySelectorAll('.step').forEach((step, index) => {
//             const stepNum = index + 1;
//             step.classList.remove('active', 'completed');
            
//             if (stepNum === stepNumber) {
//                 step.classList.add('active');
//             } else if (stepNum < stepNumber) {
//                 step.classList.add('completed');
//             }
//         });
        
//         currentStep = stepNumber;
//         updateFormNavigation();
        
//         // Update summary when reaching final step
//         if (stepNumber === 3) {
//             updateSummary();
//         }
//     }
    
//     function updateFormNavigation() {
//         const prevBtn = document.getElementById('prevBtn');
//         const nextBtn = document.getElementById('nextBtn');
//         const submitBtn = document.getElementById('submitBtn');
//         const formNavigation = document.querySelector('.form-navigation');
        
//         // Previous button
//         prevBtn.style.display = currentStep === 1 ? 'none' : 'flex';
        
//         // Align buttons to the right when on first step
//         if (currentStep === 1) {
//             formNavigation.style.justifyContent = 'flex-end';
//         } else {
//             formNavigation.style.justifyContent = 'space-between';
//         }
        
//         // Next/Submit buttons
//         if (currentStep === totalSteps) {
//             nextBtn.style.display = 'none';
//             submitBtn.style.display = 'flex';
//         } else {
//             nextBtn.style.display = 'flex';
//             submitBtn.style.display = 'none';
//         }
//     }
    
//     function validateCurrentStep() {
//         const currentStepElement = document.getElementById(`step-${currentStep}`);
//         const requiredFields = currentStepElement.querySelectorAll('[required]');
        
//         let isValid = true;
//         const errors = [];
        
//         requiredFields.forEach(field => {
//             if (!field.value.trim()) {
//                 isValid = false;
//                 field.classList.add('error');
                
//                 const label = currentStepElement.querySelector(`label[for="${field.id}"]`);
//                 const fieldName = label ? label.textContent.replace(' *', '') : field.id;
//                 errors.push(`Vui lòng nhập ${fieldName}`);
//             } else {
//                 field.classList.remove('error');
//             }
//         });
        
//         // Additional validation for specific steps
//         if (currentStep === 2) {
//             const idNumber = document.getElementById('headIdNumber').value;
//             if (idNumber && (idNumber.length < 9 || idNumber.length > 12)) {
//                 isValid = false;
//                 errors.push('Số CMND/CCCD phải có từ 9-12 chữ số');
//             }
//         }
        
//         if (currentStep === 3) {
//             const confirmCheckbox = document.getElementById('confirmInformation');
//             if (!confirmCheckbox.checked) {
//                 isValid = false;
//                 errors.push('Vui lòng xác nhận thông tin trước khi lưu');
//             }
//         }
        
//         if (!isValid) {
//             showValidationErrors(errors);
//         }
        
//         return isValid;
//     }
    
//     function showValidationErrors(errors) {
//         const errorMessage = errors.join('\\n');
//         alert(`Có lỗi trong form:\\n\\n${errorMessage}`);
//     }
    
//     function updateAddressPreview() {
//         const houseNumber = document.getElementById('houseNumber').value.trim();
//         const streetName = document.getElementById('streetName').value.trim();
        
//         const addressParts = [];
//         if (houseNumber) addressParts.push(houseNumber);
//         if (streetName) addressParts.push(streetName);
        
//         // Always add fixed parts if any address entered
//         if (addressParts.length > 0) {
//             addressParts.push('Phường La Khê', 'Quận Hà Đông', 'Thành phố Hà Nội');
//         }
        
//         const fullAddress = addressParts.length > 0 ? 
//             addressParts.join(', ') : 
//             'Chưa nhập đủ thông tin địa chỉ';
            
//         const addressDisplay = document.getElementById('fullAddress');
//         if (addressDisplay) {
//             addressDisplay.textContent = fullAddress;
//         }
//     }
    
//     function updateSummary() {
//         // Update summary fields
//         const code = document.getElementById('householdCode').value.trim() || '-';
//         const headName = document.getElementById('headFullName').value.trim() || '-';
        
//         // Build address - automatically add "Phường La Khê, Quận Hà Đông, Thành phố Hà Nội"
//         const houseNumber = document.getElementById('houseNumber').value.trim();
//         const streetName = document.getElementById('streetName').value.trim();
        
//         const addressParts = [];
//         if (houseNumber) addressParts.push(houseNumber);
//         if (streetName) addressParts.push(streetName);
//         if (addressParts.length > 0) {
//             addressParts.push('Phường La Khê', 'Quận Hà Đông', 'Thành phố Hà Nội');
//         }
        
//         const address = addressParts.length > 0 ? addressParts.join(', ') : '-';
        
//         // Update summary display
//         document.getElementById('summaryCode').textContent = code;
//         document.getElementById('summaryHeadName').textContent = headName;
//         document.getElementById('summaryAddress').textContent = address;
//     }
    
//     function generateHouseholdCode() {
//         // Generate a simple household code
//         const year = new Date().getFullYear();
//         const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
//         return `HK-${year}${random}`;
//     }
    
//     function collectFormData() {
//         const formData = {
//             // Basic information
//             householdCode: document.getElementById('householdCode').value.trim(),
            
//             // Address information
//             houseNumber: document.getElementById('houseNumber').value.trim(),
//             streetName: document.getElementById('streetName').value.trim(),
            
//             // Head of household information
//             headFullName: document.getElementById('headFullName').value.trim(),
//             headAlias: document.getElementById('headAlias').value.trim(),
//             headDob: document.getElementById('headDob').value,
//             headGender: document.getElementById('headGender').value,
//             headBirthPlace: document.getElementById('headBirthPlace').value.trim(),
//             headHometown: document.getElementById('headHometown').value.trim(),
//             headIdNumber: document.getElementById('headIdNumber').value.trim(),
//             headIdIssueDate: document.getElementById('headIdIssueDate').value,
//             headIdIssuePlace: document.getElementById('headIdIssuePlace').value.trim(),
//             headResidenceRegDate: document.getElementById('headResidenceRegDate').value,
//             headPreviousResidence: document.getElementById('headPreviousResidence').value.trim(),
//             headOccupation: document.getElementById('headOccupation').value.trim(),
//             headWorkplace: document.getElementById('headWorkplace').value.trim(),
//             headEthnicity: document.getElementById('headEthnicity').value,
//             headReligion: document.getElementById('headReligion').value
//         };
        
//         // Build full address - automatically add fixed parts
//         const addressParts = [];
//         if (formData.houseNumber) addressParts.push(formData.houseNumber);
//         if (formData.streetName) addressParts.push(formData.streetName);
//         addressParts.push('Phường La Khê', 'Quận Hà Đông', 'Thành phố Hà Nội');
        
//         formData.fullAddress = addressParts.join(', ');
        
//         return formData;
//     }
    
//     // Global functions for navigation
//     window.nextStep = function() {
//         if (validateCurrentStep() && currentStep < totalSteps) {
//             showStep(currentStep + 1);
//         }
//     };
    
//     window.previousStep = function() {
//         if (currentStep > 1) {
//             showStep(currentStep - 1);
//         }
//     };
    
//     window.goBack = function() {
//         if (confirm('Bạn có chắc chắn muốn quay lại? Dữ liệu đã nhập sẽ bị mất.')) {
//             // Navigate back to household list or previous page
//             window.history.back();
//         }
//     };
    
//     window.previewHousehold = function() {
//         const formData = collectFormData();
//         generatePreview(formData);
//         document.getElementById('previewModal').style.display = 'flex';
//     };
    
//     window.closePreviewModal = function() {
//         document.getElementById('previewModal').style.display = 'none';
//     };
    
//     window.submitForm = function() {
//         // Validate all steps
//         let allValid = true;
//         for (let step = 1; step <= totalSteps; step++) {
//             const originalStep = currentStep;
//             currentStep = step;
//             if (!validateCurrentStep()) {
//                 allValid = false;
//                 showStep(step); // Go to invalid step
//                 break;
//             }
//             currentStep = originalStep;
//         }
        
//         if (allValid) {
//             const formData = collectFormData();
//             saveHousehold(formData);
//         }
//     };
    
//     function generatePreview(formData) {
//         const genderText = formData.headGender === 'M' ? 'Nam' : 'Nữ';
        
//         const previewHTML = `
//             <div class="preview-section">
//                 <h4>Thông tin cơ bản</h4>
//                 <div class="preview-grid">
//                     <div class="preview-item">
//                         <label>Mã hộ khẩu:</label>
//                         <span>${formData.householdCode}</span>
//                     </div>
//                 </div>
//             </div>
            
//             <div class="preview-section">
//                 <h4>Địa chỉ thường trú</h4>
//                 <div class="preview-item">
//                     <label>Địa chỉ đầy đủ:</label>
//                     <span>${formData.fullAddress}</span>
//                 </div>
//             </div>
            
//             <div class="preview-section">
//                 <h4>Thông tin chủ hộ</h4>
//                 <div class="preview-grid">
//                     <div class="preview-item">
//                         <label>Họ và tên:</label>
//                         <span>${formData.headFullName}</span>
//                     </div>
//                     <div class="preview-item">
//                         <label>Ngày sinh:</label>
//                         <span>${formData.headDob}</span>
//                     </div>
//                     <div class="preview-item">
//                         <label>Giới tính:</label>
//                         <span>${genderText}</span>
//                     </div>
//                     <div class="preview-item">
//                         <label>CMND/CCCD:</label>
//                         <span>${formData.headIdNumber}</span>
//                     </div>
//                     <div class="preview-item">
//                         <label>Nghề nghiệp:</label>
//                         <span>${formData.headOccupation || 'Chưa cập nhật'}</span>
//                     </div>
//                     <div class="preview-item">
//                         <label>Dân tộc:</label>
//                         <span>${formData.headEthnicity}</span>
//                     </div>
//                     <div class="preview-item">
//                         <label>Tôn giáo:</label>
//                         <span>${formData.headReligion || 'Không'}</span>
//                     </div>
//                 </div>
//             </div>
            
//             ${formData.householdNotes ? `
//                 <div class="preview-section">
//                     <h4>Ghi chú</h4>
//                     <div class="preview-item">
//                         <span>${formData.householdNotes}</span>
//                     </div>
//                 </div>
//             ` : ''}
//         `;
        
//         document.getElementById('previewContent').innerHTML = previewHTML;
//     }
    
//     function saveHousehold(formData) {
//         // Show loading state
//         const submitBtn = document.getElementById('submitBtn');
//         const originalText = submitBtn.innerHTML;
//         submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
//         submitBtn.disabled = true;
        
//         // Get CSRF token
//         function getCSRFToken() {
//             const cookies = document.cookie.split(';');
//             for (let cookie of cookies) {
//                 const [name, value] = cookie.trim().split('=');
//                 if (name === 'csrftoken') {
//                     return value;
//                 }
//             }
//             return '';
//         }
        
//         // Make API call to backend
//         const url = window.location.pathname; // Use current URL (taohokhau/ or taohokhau/<id>/)
        
//         fetch(url, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-CSRFToken': getCSRFToken()
//             },
//             body: JSON.stringify(formData)
//         })
//         .then(response => response.json())
//         .then(data => {
//             // Reset button
//             submitBtn.innerHTML = originalText;
//             submitBtn.disabled = false;
            
//             if (data.status === 'success') {
//                 // Update form data with returned household code
//                 formData.householdCode = data.household_code;
//                 showSuccessMessage(formData);
//             } else {
//                 alert(`Lỗi: ${data.message}`);
//             }
//         })
//         .catch(error => {
//             // Reset button
//             submitBtn.innerHTML = originalText;
//             submitBtn.disabled = false;
            
//             alert('Có lỗi xảy ra khi lưu hộ khẩu: ' + error.message);
//             console.error('Error:', error);
//         });
//     }
    
//     function showSuccessMessage(formData) {
//         document.getElementById('successMessage').style.display = 'flex';
        
//         // Store the created household data for further use
//         window.createdHousehold = formData;
//     }
    
//     window.createAnother = function() {
//         document.getElementById('successMessage').style.display = 'none';
        
//         // Reset form
//         document.getElementById('householdForm').reset();
//         initializeForm();
//         showStep(1);
//     };
    
//     window.viewHousehold = function() {
//         // Navigate to the household detail page
//         // In a real application, you would navigate to the household detail view
//         alert(`Chuyển đến trang xem chi tiết hộ khẩu: ${window.createdHousehold.householdCode}`);
        
//         // Example navigation:
//         // window.location.href = `/households/${window.createdHousehold.householdCode}/`;
//     };
    
//     // Close modal when clicking outside
//     window.onclick = function(event) {
//         const previewModal = document.getElementById('previewModal');
//         if (event.target === previewModal) {
//             closePreviewModal();
//         }
//     };
// });

// // Additional CSS for preview
// const additionalCSS = `
// .preview-section {
//     margin-bottom: 24px;
//     padding-bottom: 16px;
//     border-bottom: 1px solid #e5e7eb;
// }

// .preview-section:last-child {
//     border-bottom: none;
// }

// .preview-section h4 {
//     margin: 0 0 16px 0;
//     color: #1f2937;
//     font-size: 16px;
//     font-weight: 600;
// }

// .preview-grid {
//     display: grid;
//     grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
//     gap: 12px;
// }

// .preview-item {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-start;
//     padding: 8px 0;
// }

// .preview-item label {
//     font-weight: 600;
//     color: #6b7280;
//     margin: 0;
//     margin-right: 16px;
//     min-width: 120px;
// }

// .preview-item span {
//     font-weight: 500;
//     color: #1f2937;
//     text-align: right;
//     flex: 1;
// }

// .form-input.error {
//     border-color: #ef4444 !important;
//     box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
// }
// `;

// // Inject additional CSS
// const style = document.createElement('style');
// style.textContent = additionalCSS;
// document.head.appendChild(style);
// --- ĐIỀU HƯỚNG BƯỚC (GLOBAL SCOPE) ---
let currentStep = 1;
const totalSteps = 3;

window.showStep = function(stepNumber) {
    console.log("Chuyển sang bước:", stepNumber);
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    
    const targetStep = document.getElementById(`step-${stepNumber}`);
    if (targetStep) targetStep.classList.add('active');

    document.querySelectorAll('.step').forEach((step, index) => {
        const sNum = index + 1;
        step.classList.remove('active', 'completed');
        if (sNum === stepNumber) step.classList.add('active');
        else if (sNum < stepNumber) step.classList.add('completed');
    });

    currentStep = stepNumber;
    
    // Ẩn hiện nút
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    if (prevBtn) prevBtn.style.display = (currentStep === 1) ? 'none' : 'flex';
    if (currentStep === totalSteps) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'flex';
        updateSummary();
    } else {
        if (nextBtn) nextBtn.style.display = 'flex';
        if (submitBtn) submitBtn.style.display = 'none';
    }
};

window.nextStep = function() {
    // Tạm thời bỏ qua validate để bạn test xem nó có chạy được không
    if (currentStep < totalSteps) {
        window.showStep(currentStep + 1);
    }
};

window.previousStep = function() {
    if (currentStep > 1) {
        window.showStep(currentStep - 1);
    }
};

function updateSummary() {
    const code = document.getElementById('householdCode')?.value || '-';
    const name = document.getElementById('headFullName')?.value || '-';
    if (document.getElementById('summaryCode')) document.getElementById('summaryCode').textContent = code;
    if (document.getElementById('summaryHeadName')) document.getElementById('summaryHeadName').textContent = name;
}

// --- HÀM LƯU DỮ LIỆU (KHỚP VIEW.PY) ---
window.submitForm = function() {
    console.log("Đang bắt đầu gửi form...");
    
    const formData = new FormData();
    
    // Mapping: ID TRÊN HTML -> NAME TRONG VIEW.PY
    const mapping = {
        'householdCode': 'ma_ho_khau',
        'houseNumber': 'so_nha',
        'streetName': 'duong_pho',
        'headFullName': 'ho_ten',
        'headAlias': 'bi_danh',
        'headDob': 'ngay_sinh',
        'headGender': 'gioi_tinh',
        'headBirthPlace': 'noi_sinh',
        'headHometown': 'nguyen_quan',
        'headEthnicity': 'dan_toc',
        'headOccupation': 'nghe_nghiep',
        'headWorkplace': 'noi_lam_viec',
        'headIdNumber': 'cccd',
        'headIdIssueDate': 'ngay_cap_cccd',
        'headIdIssuePlace': 'noi_cap_cccd',
        'headResidenceRegDate': 'ngay_dang_ky_thuong_tru',
        'headPreviousResidence': 'dia_chi_truoc_khi_chuyen'
    };

    for (let id in mapping) {
        const el = document.getElementById(id);
        if (el) {
            formData.append(mapping[id], el.value.trim());
        } else {
            console.warn(`Không tìm thấy phần tử có ID: ${id}`);
        }
    }

    formData.append('quan_he_chu_ho', 'Chủ hộ');
    formData.append('trang_thai', 'Thường trú');

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Đang lưu...';

    fetch(window.location.href, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            alert("Lưu thất bại! Kiểm tra lại mã hộ khẩu.");
            submitBtn.disabled = false;
            submitBtn.innerText = 'Lưu Hộ Khẩu';
        }
    })
    .catch(error => {
        console.error("Lỗi fetch:", error);
        alert("Lỗi kết nối server!");
        submitBtn.disabled = false;
    });
};

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', function() {
    window.showStep(1);
});

