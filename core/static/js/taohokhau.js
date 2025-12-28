// --- ĐIỀU HƯỚNG BƯỚC (GLOBAL SCOPE) ---
let currentStep = 1;
const totalSteps = 3;

function validateRequired(stepNumber) {
    const step = document.getElementById(`step-${stepNumber}`);
    let valid = true;

    step.querySelectorAll('[required]').forEach(el => {
        if (!el.value || el.value.trim() === '') {
            el.classList.add('error');
            valid = false;
        } else {
            el.classList.remove('error');
        }
    });

    return valid;
}

function validateHouseholdCode() {
    const code = document.getElementById('householdCode').value.trim();
    return /^HK-\d{3}$/.test(code);
}

function validateDateNotFuture(inputId, label) {
    const el = document.getElementById(inputId);
    if (!el) return true;

    if (!el.value) return true; // không nhập thì bỏ qua

    // Parse yyyy-mm-dd an toàn
    const [y, m, d] = el.value.split('-').map(Number);
    const inputDate = new Date(y, m - 1, d);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate.getTime() > today.getTime()) {
        el.classList.add('error');
        alert(`${label} không được sau ngày hôm nay`);
        el.focus();
        return false;
    }

    el.classList.remove('error');
    return true;
}

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
    if (!validateRequired(currentStep)) {
        alert('Nhập đầy đủ các trường bắt buộc');
        return;
    }
    if (currentStep === 1 && !validateHouseholdCode()) {
        alert('Mã hộ khẩu phải đúng định dạng HK-XXX (VD: HK-001)');
        document.getElementById('householdCode').focus();
        return;
    }
    if (currentStep === 2) {
        if (
            !validateDateNotFuture('headDob', 'Ngày sinh') ||
            !validateDateNotFuture('headIdIssueDate', 'Ngày cấp CCCD') ||
            !validateDateNotFuture('headResidenceRegDate', 'Ngày đăng ký thường trú')
        ) {
            return;
        }
    }
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
    const house = document.getElementById('houseNumber')?.value || '';
    const street = document.getElementById('streetName')?.value || '';

    const address = house && street
        ? `${house}, ${street}, La Khê, Hà Đông`
        : '-';

    document.getElementById('summaryAddress').textContent = address;
    if (document.getElementById('summaryCode')) document.getElementById('summaryCode').textContent = code;
    if (document.getElementById('summaryHeadName')) document.getElementById('summaryHeadName').textContent = name;
}

document.getElementById('householdForm').addEventListener('submit', function(e) {
    e.preventDefault();
    submitForm();
});

// --- HÀM LƯU DỮ LIỆU (KHỚP VIEW.PY) ---
// --- HÀM LƯU DỮ LIỆU ---
window.submitForm = function() {
    if (!document.getElementById('confirmInformation').checked) {
        alert('Bạn phải xác nhận thông tin trước khi lưu');
        return;
    }
    
    const formData = new FormData();
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
        if (el) formData.append(mapping[id], el.value.trim());
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Đang lưu...';

    fetch(window.location.href, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        // Chuyển đổi phản hồi sang JSON
        return response.json().then(data => {
            if (!response.ok) {
                // Nếu mã lỗi 400 hoặc 500, ném lỗi để nhảy vào .catch()
                throw new Error(data.message || "Lỗi không xác định");
            }
            return data;
        });
    })
    .then(data => {
        alert(data.message); // Hiển thị "Tạo hộ khẩu thành công!"
        window.location.href = "/qlhk_nk/hokhau/"; // Redirect bằng JS
    })
    .catch(error => {
        alert("THẤT BẠI: " + error.message); // Hiển thị "Mã hộ khẩu đã tồn tại!"
        submitBtn.disabled = false;
        submitBtn.innerText = 'Lưu hộ khẩu';
    });
};
// Khởi tạo trang
document.addEventListener('DOMContentLoaded', function() {
    window.showStep(1);
});

