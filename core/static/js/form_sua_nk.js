function handleMoveTypeChange() {
    const moveType = document.getElementById('moveType').value;
    const transferFields = document.getElementById('transferFields');
    const pastFields = document.getElementById('pastFields');
    const personalSection = document.getElementById('personalInfoSection');
    // const residenceSection = document.getElementById('residenceSection');
    const workSection = document.getElementById('workInfoSection');

    // Ẩn tất cả ban đầu
    [transferFields, pastFields, personalSection, workSection].forEach(el => {
        if (el) el.style.display = 'none';
    });

    // Reset required để tránh lỗi submit khi ẩn
    clearAllRequired();

    if (moveType === 'transfer') {
        transferFields.style.display = 'block';
        document.getElementById('transferDate').required = true;
        document.getElementById('transferDestinationType').required = true;
    } else if (moveType === 'update') {
        personalSection.style.display = 'block';
        // residenceSection.style.display = 'block';
        workSection.style.display = 'block';
        // Chỉ bắt buộc các trường cốt lõi khi update
        document.getElementById('personFullName').required = true;
        document.getElementById('personDob').required = true;
        document.getElementById('personRelation').required = true;
    } else if (moveType === 'past') {
        pastFields.style.display = 'block';
    }
}

function handleDestinationTypeChange() {
    const type = document.getElementById('transferDestinationType').value;
    const hhSelect = document.getElementById('householdSelection');
    const areaInput = document.getElementById('areaInput');

    hhSelect.style.display = (type === 'household') ? 'block' : 'none';
    areaInput.style.display = (type === 'area') ? 'block' : 'none';

    document.getElementById('newHousehold').required = (type === 'household');
    document.getElementById('transferAddress').required = (type === 'area');
}

function clearAllRequired() {
    const fields = [
        'transferDate', 'transferDestinationType', 'newHousehold', 
        'transferAddress', 'personFullName', 'personDob', 'personRelation'
    ];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.required = false;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('editPersonForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            const moveType = document.getElementById('moveType').value;
            if (!moveType) {
                e.preventDefault();
                alert('Vui lòng chọn loại thao tác thay đổi!');
                return;
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // ---- 1. Validate ngày sinh ----
            const dobInput = document.getElementById('personDob');
            if (dobInput && dobInput.value) {
                const dob = new Date(dobInput.value);
                if (dob > today) {
                    e.preventDefault();
                    alert('Ngày sinh không được lớn hơn ngày hôm nay!');
                    dobInput.focus();
                    return;
                }
            }

            // ---- 2. Validate ngày cấp CCCD ----
            const idIssueInput = document.getElementById('personIdIssueDate');
            if (idIssueInput && idIssueInput.value) {
                const issueDate = new Date(idIssueInput.value);
                if (issueDate > today) {
                    e.preventDefault();
                    alert('Ngày cấp giấy tờ không được lớn hơn ngày hôm nay!');
                    idIssueInput.focus();
                    return;
                }
            }

            // ---- 3. Validate quan hệ chủ hộ ----
            const currentRelation = form.dataset.relation;
            const newRelation = document.getElementById('personRelation')?.value;

            if (currentRelation !== 'Chủ hộ' && newRelation === 'Chủ hộ') {
                e.preventDefault();
                alert('Không thể chuyển quan hệ thành Chủ hộ vì nhân khẩu này hiện không phải Chủ hộ!');
                document.getElementById('personRelation').focus();
                return;
            }
            // Hiển thị thông báo UX
            document.getElementById('successMessage').style.display = 'flex';
        });
    }
});