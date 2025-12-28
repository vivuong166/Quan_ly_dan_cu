// --- 1. LẤY CSRF TOKEN ---
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

let currentStep = 1;
const totalSteps = 3;

// --- 2. CÁC HÀM CHECK (VALIDATION) ---

// Check bỏ trống
function validateRequired(stepNumber) {
    const step = document.getElementById(`step-${stepNumber}`);
    let valid = true;
    step.querySelectorAll('[required]').forEach(el => {
        if (!el.value || el.value.trim() === '') {
            el.classList.add('error'); // Thêm viền đỏ
            valid = false;
        } else {
            el.classList.remove('error');
        }
    });
    return valid;
}

// Check định dạng mã HK-XXX
function validateHouseholdCode() {
    const codeEl = document.getElementById('householdCode');
    const code = codeEl.value.trim();
    const isValid = /^HK-\d{3}$/.test(code);
    if (!isValid) {
        codeEl.classList.add('error');
        alert('Mã hộ khẩu phải đúng định dạng HK-XXX (Ví dụ: HK-001)');
    }
    return isValid;
}

// Check ngày không được là tương lai
function validateDateNotFuture(inputId, label) {
    const el = document.getElementById(inputId);
    if (!el || !el.value) return true;

    // Tách chuỗi để tránh lỗi lệch múi giờ (giống File 1)
    const [y, m, d] = el.value.split('-').map(Number);
    const inputDate = new Date(y, m - 1, d);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate.getTime() > today.getTime()) {
        el.classList.add('error');
        alert(`${label} không được lớn hơn ngày hiện tại!`);
        el.focus();
        return false;
    }
    el.classList.remove('error');
    return true;
}

// --- 3. ĐIỀU HƯỚNG BƯỚC ---

window.showStep = function(stepNumber) {
    // Ẩn tất cả các bước
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    // Hiện bước hiện tại
    document.getElementById(`step-${stepNumber}`).classList.add('active');

    // Cập nhật thanh tiến trình (Progress Bar)
    document.querySelectorAll('.step').forEach((step, index) => {
        const sNum = index + 1;
        step.classList.remove('active', 'completed');
        if (sNum === stepNumber) step.classList.add('active');
        else if (sNum < stepNumber) step.classList.add('completed');
    });

    currentStep = stepNumber;
    
    // Ẩn hiện nút
    document.getElementById('prevBtn').style.display = (currentStep === 1) ? 'none' : 'flex';
    if (currentStep === totalSteps) {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'flex';
        updateSummary();
    } else {
        document.getElementById('nextBtn').style.display = 'flex';
        document.getElementById('submitBtn').style.display = 'none';
    }
};

window.nextStep = function() {
    // Check các trường bắt buộc
    if (!validateRequired(currentStep)) {
        alert('Vui lòng nhập đầy đủ các thông tin bắt buộc (ô có viền đỏ)');
        return;
    }

    // Logic riêng cho từng bước
    if (currentStep === 1) {
        if (!validateHouseholdCode()) return;
    }
    
    if (currentStep === 2) {
        if (!validateDateNotFuture('headDob', 'Ngày sinh') ||
            !validateDateNotFuture('headIdIssueDate', 'Ngày cấp CCCD') ||
            !validateDateNotFuture('headResidenceRegDate', 'Ngày đăng ký thường trú')) return;
    }

    window.showStep(currentStep + 1);
};

window.previousStep = function() {
    if (currentStep > 1) window.showStep(currentStep - 1);
};

// --- 4. TÓM TẮT & GỬI DỮ LIỆU ---

function updateSummary() {
    document.getElementById('summaryCode').textContent = document.getElementById('householdCode').value;
    document.getElementById('summaryHeadName').textContent = document.getElementById('headFullName').value;
    const house = document.getElementById('houseNumber').value;
    const street = document.getElementById('streetName').value;
    document.getElementById('summaryAddress').textContent = `${house}, ${street}, La Khê, Hà Đông`;
}

window.submitForm = function() {
    if (!document.getElementById('confirmInformation').checked) {
        alert('Bạn phải tích vào ô xác nhận thông tin chính xác!');
        return;
    }
    
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerText = 'Đang xử lý...';

    const formData = new FormData();
    const mapping = {
        'householdCode': 'ma_ho_khau', 'houseNumber': 'so_nha', 'streetName': 'duong_pho',
        'headFullName': 'ho_ten', 'headAlias': 'bi_danh', 'headDob': 'ngay_sinh',
        'headGender': 'gioi_tinh', 'headBirthPlace': 'noi_sinh', 'headHometown': 'nguyen_quan',
        'headEthnicity': 'dan_toc', 'headOccupation': 'nghe_nghiep', 'headWorkplace': 'noi_lam_viec',
        'headIdNumber': 'cccd', 'headIdIssueDate': 'ngay_cap_cccd', 'headIdIssuePlace': 'noi_cap_cccd',
        'headResidenceRegDate': 'ngay_dang_ky_thuong_tru', 'headPreviousResidence': 'dia_chi_truoc_khi_chuyen'
    };

    for (let id in mapping) {
        const el = document.getElementById(id);
        if (el) formData.append(mapping[id], el.value.trim());
    }

    fetch(window.location.href, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
        body: formData
    })
    .then(async res => {
        // Kiểm tra nếu không phải JSON (giống logic an toàn của File 1)
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch {
            throw new Error("Máy chủ phản hồi không đúng định dạng (có thể do hết phiên đăng nhập)");
        }
    })
    .then(data => {
        // ... giữ nguyên phần xử lý success/error bên dưới ...
        if (data.status === 'success') {
            alert(data.message);
            window.location.href = "/qlhk_nk/hokhau/";
        } else {
            alert("LỖI: " + data.message);
            btn.disabled = false;
            btn.innerText = 'Lưu hộ khẩu';
        }
    })
    .catch(err => {
        alert("Không thể kết nối đến máy chủ!");
        btn.disabled = false;
        btn.innerText = 'Lưu hộ khẩu';
    });
};

document.addEventListener('DOMContentLoaded', () => window.showStep(1));
document.getElementById('householdForm').addEventListener('submit', function(e) {
    e.preventDefault();
    submitForm();
});