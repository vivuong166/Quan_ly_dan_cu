function handleEditTypeChange() {
    const editType = document.querySelector('input[name="edit_type"]:checked').value;
    const addressSection = document.getElementById('addressSection');
    const headSection = document.getElementById('headSection');
    
    addressSection.style.display = (editType === 'address') ? 'block' : 'none';
    headSection.style.display = (editType === 'head') ? 'block' : 'none';

    // Toggle thuộc tính required để tránh lỗi validate HTML5
    document.getElementById('houseNumber').required = (editType === 'address');
    document.getElementById('streetName').required = (editType === 'address');
}

function handleHeadSelection(selectedId, selectedName) {
    const relSection = document.getElementById('relationshipSection');
    const relInputs = document.getElementById('relationshipInputs');
    const nameDisplay = document.getElementById('newNameDisplay');

    relSection.style.display = 'block';
    nameDisplay.textContent = selectedName;
    relInputs.innerHTML = '';

    HOUSEHOLD_MEMBERS.forEach(member => {
        // Chỉ hiện ô nhập quan hệ cho những người KHÔNG phải là chủ hộ mới
        if (String(member.id) !== String(selectedId)) {
            const div = document.createElement('div');
            div.className = 'form-group mb-3';
            div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <span style="min-width: 150px;">${member.full_name}:</span>
                    <input type="text" name="relation_${member.id}" class="form-input" 
                           placeholder="Quan hệ với ${selectedName}..." required>
                </div>
            `;
            relInputs.appendChild(div);
        }
    });
}

// Xử lý Validate trước khi submit
document.getElementById('editHouseholdForm').onsubmit = function(e) {
    const editType = document.querySelector('input[name="edit_type"]:checked').value;
    if (editType === 'head') {
        const selectedHead = document.querySelector('input[name="new_head"]:checked');
        if (!selectedHead) {
            alert("Vui lòng chọn một chủ hộ mới!");
            return false;
        }
    }
    return true; // Cho phép submit lên server
};