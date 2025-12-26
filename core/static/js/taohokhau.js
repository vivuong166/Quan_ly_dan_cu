let currentStep = 1;
const totalSteps = 3;

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('.date-limit').forEach(el => el.setAttribute('max', today));
    window.showStep(1);
});

window.showStep = function(stepNumber) {
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step-${stepNumber}`).classList.add('active');
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.toggle('active', (index + 1) === stepNumber);
        step.classList.toggle('completed', (index + 1) < stepNumber);
    });
    currentStep = stepNumber;
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

function validateCurrentStep() {
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    const requiredInputs = currentStepEl.querySelectorAll('[required]');
    let isValid = true;
    requiredInputs.forEach(input => {
        input.style.borderColor = "";
        if (!input.value.trim() || (input.type === 'checkbox' && !input.checked)) {
            isValid = false;
            input.style.borderColor = "red";
        }
    });
    return isValid;
}

window.nextStep = () => { if (validateCurrentStep()) window.showStep(currentStep + 1); };
window.previousStep = () => { if (currentStep > 1) window.showStep(currentStep - 1); };

function updateSummary() {
    document.getElementById('summaryCode').textContent = document.getElementById('householdCode').value || '-';
    document.getElementById('summaryHeadName').textContent = document.getElementById('headFullName').value || '-';
    document.getElementById('summaryAddress').textContent = `${document.getElementById('houseNumber').value}, ${document.getElementById('streetName').value}, La Khê, Hà Đông`;
}

window.submitForm = function(event) {
    if (event) event.preventDefault();
    if (!validateCurrentStep()) return;

    const btn = document.getElementById('submitBtn');
    const errDiv = document.getElementById('errorAlert');
    const errText = document.getElementById('errorText');

    errDiv.style.display = 'none';
    btn.disabled = true;
    btn.innerText = "Đang kiểm tra...";

    const formData = new FormData();
    const fields = {
        'ma_ho_khau': 'householdCode', 'so_nha': 'houseNumber', 'duong_pho': 'streetName',
        'ho_ten': 'headFullName', 'ngay_sinh': 'headDob', 'gioi_tinh': 'headGender',
        'cccd': 'headIdNumber', 'que_quan': 'headHometown'
    };

    for (let [dbKey, htmlId] of Object.entries(fields)) {
        formData.append(dbKey, document.getElementById(htmlId)?.value || '');
    }

    fetch(window.location.href, {
        method: 'POST',
        body: formData,
        headers: { 'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value }
    })
    .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
    })
    .then(data => {
        if (data.status === 'success') document.getElementById('successMessage').style.display = 'flex';
    })
    .catch(err => {
        errText.innerText = err.message; // Hiện lỗi tiếng Việt từ Server
        errDiv.style.display = 'block';
        errDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        btn.disabled = false;
        btn.innerText = "Lưu hộ khẩu";
    });
};