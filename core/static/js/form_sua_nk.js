function handleMoveTypeChange() {
    const moveType = document.getElementById('moveType').value;
    const transferFields = document.getElementById('transferFields');
    const pastFields = document.getElementById('pastFields');
    
    // Các bảng thông tin chi tiết
    const personalInfo = document.getElementById('personalInfoSection');
    const residenceInfo = document.getElementById('residenceSection');
    const workInfo = document.getElementById('workInfoSection');

    // 1. Ẩn tất cả các khối trước
    [transferFields, pastFields, personalInfo, residenceInfo, workInfo].forEach(el => {
        if (el) el.style.display = 'none';
    });

    if (moveType === 'transfer') {
        transferFields.style.display = 'block';
        handleDestinationTypeChange(); // Gọi hàm xử lý nơi đến
    } else if (moveType === 'past') {
        pastFields.style.display = 'block';
        toggleRequiredInputs(false); // Qua đời -> Tắt hết required bảng dưới
    } else {
        toggleRequiredInputs(false); // Không chọn gì -> Tắt hết
    }
}

function handleDestinationTypeChange() {
    const destType = document.getElementById('transferDestinationType').value;
    const householdDiv = document.getElementById('householdSelection');
    const areaDiv = document.getElementById('areaInput');
    
    const infoSections = [
        document.getElementById('personalInfoSection'),
        document.getElementById('residenceSection'),
        document.getElementById('workInfoSection')
    ];

    if (destType === 'household') {
        // Chuyển hộ trong hệ thống
        householdDiv.style.display = 'block';
        areaDiv.style.display = 'none';
        infoSections.forEach(sec => { if (sec) sec.style.display = 'block'; });
        
        toggleRequiredInputs(true); // BẬT required vì các ô đang hiện
    } else if (destType === 'area') {
        // Chuyển đi nơi khác
        householdDiv.style.display = 'none';
        areaDiv.style.display = 'block';
        infoSections.forEach(sec => { if (sec) sec.style.display = 'none'; });
        
        toggleRequiredInputs(false); // TẮT required để trình duyệt cho phép Submit
    }
}

// HÀM QUAN TRỌNG: Bật/Tắt thuộc tính bắt buộc nhập
function toggleRequiredInputs(status) {
    // 1. Nhóm các input trong bảng thông tin cá nhân
    const personalInputs = document.querySelectorAll('#personalInfoSection input, #residenceSection input, #workInfoSection input');
    personalInputs.forEach(input => {
        // Chỉ tác động đến những ô vốn dĩ là bắt buộc (có class hoặc check theo ID)
        if (input.id === 'personFullName' || input.id === 'personDob' || input.id === 'personGender' || input.id === 'personRelation') {
            input.required = status;
        }
    });

    // 2. Ô quan hệ với chủ hộ mới
    const newRelInput = document.getElementById('newHouseholdRelation');
    if (newRelInput) {
        const destType = document.getElementById('transferDestinationType').value;
        newRelInput.required = (destType === 'household');
    }

    // 3. Ô nơi chuyển đến (nếu đi xa)
    const transferAddress = document.getElementById('transferAddress');
    if (transferAddress) {
        const destType = document.getElementById('transferDestinationType').value;
        transferAddress.required = (destType === 'area');
    }
}

// Khởi chạy khi trang vừa load để đồng bộ trạng thái
document.addEventListener('DOMContentLoaded', function() {
    handleMoveTypeChange();
});