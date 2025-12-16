// Sample data - declare globally for access from window functions
let persons = [
    { 
        id: 1,
        full_name: 'Nguyễn Văn A', 
        alias: 'A',
        dob: '1985-03-15',
        gender: 'M',
        relation_to_head: 'Chủ hộ',
        id_number: '012345678',
        occupation: 'Kỹ sư',
        household: { code: 'HK-001', address: 'Số 12, Đường X, La Khê' },
        is_head: true,
        notes: 'Chủ hộ gia đình'
    },
    { 
        id: 2,
        full_name: 'Trần Thị B', 
        alias: 'B',
        dob: '1990-08-22',
        gender: 'F',
        relation_to_head: 'Chủ hộ',
        id_number: '098765432',
        occupation: 'Giáo viên',
        household: { code: 'HK-002', address: 'Số 34, Ngõ Y, La Khê' },
        is_head: true,
        notes: ''
    },
    { 
        id: 3,
        full_name: 'Lê Văn C', 
        alias: 'C',
        dob: '2010-12-10',
        gender: 'M',
        relation_to_head: 'Con',
        id_number: '',
        occupation: 'Học sinh',
        household: { code: 'HK-001', address: 'Số 12, Đường X, La Khê' },
        is_head: false,
        notes: 'Con của Nguyễn Văn A'
    },
    { 
        id: 4,
        full_name: 'Phạm Thị D', 
        alias: 'D',
        dob: '1988-05-30',
        gender: 'F',
        relation_to_head: 'Vợ/Chồng',
        id_number: '111222333',
        occupation: 'Y tá',
        household: { code: 'HK-001', address: 'Số 12, Đường X, La Khê' },
        is_head: false,
        notes: 'Vợ của Nguyễn Văn A'
    }
];

document.addEventListener('DOMContentLoaded', function() {
    console.log('nhankhau.js loaded and DOMContentLoaded fired');
    
    // Sample data - sẽ được thay thế bằng API calls

    let filteredPersons = [...persons];
    let currentPage = 1;
    let itemsPerPage = 10;
    let currentEditingId = null;

    // DOM elements
    const searchInput = document.getElementById('searchPerson');
    const advancedSearchBtn = document.getElementById('advancedSearchBtn');
    const advancedSearch = document.getElementById('advancedSearch');
    const addPersonBtn = document.getElementById('addPersonBtn');
    const exportBtn = document.getElementById('exportBtn');
    const personModal = document.getElementById('personModal');
    const viewPersonModal = document.getElementById('viewPersonModal');
    const personList = document.getElementById('personList');
    const personCount = document.getElementById('personCount');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const clearFiltersBtn = document.getElementById('clearFilters');

    // Initialize
    updatePersonList();
    updateStatistics();
    updatePagination();

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    advancedSearchBtn.addEventListener('click', toggleAdvancedSearch);
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyAdvancedFilters);
    }
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAdvancedFilters);
    }
    if (addPersonBtn) {
        addPersonBtn.addEventListener('click', showAddPersonForm);
    }
    if (exportBtn) {
        exportBtn.addEventListener('click', exportPersons);
    }
    
    // Filter inputs
    document.getElementById('applyFilters').addEventListener('click', applyAdvancedFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            filteredPersons = [...persons];
        } else {
            filteredPersons = persons.filter(person =>
                person.full_name.toLowerCase().includes(searchTerm) ||
                person.id_number.toLowerCase().includes(searchTerm) ||
                person.household.code.toLowerCase().includes(searchTerm) ||
                person.occupation.toLowerCase().includes(searchTerm) ||
                formatDate(person.dob).includes(searchTerm)
            );
        }
        
        currentPage = 1;
        updatePersonList();
        updateStatistics();
        updatePagination();
    }

    function toggleAdvancedSearch() {
        const isVisible = advancedSearch.classList.contains('show');
        if (isVisible) {
            advancedSearch.classList.remove('show');
        } else {
            advancedSearch.classList.add('show');
        }
        advancedSearchBtn.innerHTML = isVisible ? 
            '<i class="fas fa-filter"></i> Tìm kiếm nâng cao' : 
            '<i class="fas fa-times"></i> Đóng tìm kiếm';
    }

    function applyAdvancedFilters() {
        const nameFilter = document.getElementById('filterFullName').value.toLowerCase();
        const idFilter = document.getElementById('filterIdNumber').value.toLowerCase();
        const householdFilter = document.getElementById('filterHouseholdCode').value.toLowerCase();
        const genderFilter = document.getElementById('filterGender').value;
        const ageFromFilter = parseInt(document.getElementById('filterAgeFrom').value) || 0;
        const ageToFilter = parseInt(document.getElementById('filterAgeTo').value) || 999;

        filteredPersons = persons.filter(person => {
            const age = calculateAge(person.dob);
            
            return (!nameFilter || person.full_name.toLowerCase().includes(nameFilter)) &&
                   (!idFilter || person.id_number.toLowerCase().includes(idFilter)) &&
                   (!householdFilter || person.household.code.toLowerCase().includes(householdFilter)) &&
                   (!genderFilter || person.gender === genderFilter) &&
                   (age >= ageFromFilter && age <= ageToFilter);
        });

        currentPage = 1;
        updatePersonList();
        updateStatistics();
        updatePagination();
    }

    function clearAdvancedFilters() {
        document.getElementById('filterFullName').value = '';
        document.getElementById('filterIdNumber').value = '';
        document.getElementById('filterHouseholdCode').value = '';
        document.getElementById('filterGender').value = '';
        document.getElementById('filterAgeFrom').value = '';
        document.getElementById('filterAgeTo').value = '';
        if (searchInput) {
            searchInput.value = '';
        }
        filteredPersons = [...persons];
        currentPage = 1;
        updatePersonList();
        updateStatistics();
        updatePagination();
    }

    function updatePersonList() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pagePersons = filteredPersons.slice(startIndex, endIndex);
        
        personList.innerHTML = '';
        
        pagePersons.forEach(person => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${person.full_name}</strong></td>
                <td>${formatDate(person.dob)}</td>
                <td>${getGenderText(person.gender)}</td>
                <td>${person.id_number || '-'}</td>
                <td>${person.household.code}</td>
                <td>${person.relation_to_head || '-'}</td>
                <td>${person.occupation || '-'}</td>
                <td>
                    <button class="btn-sm" onclick="viewPerson(${person.id})">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                    <a href="/qlhk_nk/nhankhau/suank/${person.id}/" class="btn-sm">
                        <i class="fas fa-edit"></i> Sửa
                    </a>
                </td>
            `;
            personList.appendChild(row);
        });

        if (pagePersons.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="8" style="text-align: center; color: #6b7280; padding: 20px;">
                    <i class="fas fa-search"></i> Không tìm thấy nhân khẩu nào
                </td>
            `;
            personList.appendChild(row);
        }
        
        personCount.textContent = filteredPersons.length;
    }

    function updateStatistics() {
        const totalPersons = filteredPersons.length;
        const maleCount = filteredPersons.filter(p => p.gender === 'M').length;
        const femaleCount = filteredPersons.filter(p => p.gender === 'F').length;
        const childrenCount = filteredPersons.filter(p => calculateAge(p.dob) < 18).length;
        const adultCount = totalPersons - childrenCount;

        document.getElementById('totalPersons').textContent = totalPersons;
        document.getElementById('maleCount').textContent = maleCount;
        document.getElementById('femaleCount').textContent = femaleCount;
        document.getElementById('childrenCount').textContent = childrenCount;
        document.getElementById('adultCount').textContent = adultCount;
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredPersons.length / itemsPerPage);
        document.getElementById('pageInfo').textContent = `Trang ${currentPage} / ${totalPages}`;
        
        document.getElementById('prevPage').disabled = currentPage <= 1;
        document.getElementById('nextPage').disabled = currentPage >= totalPages;
    }

    // Modal functions
    window.showAddPersonForm = function() {
        currentEditingId = null;
        document.getElementById('modalTitle').textContent = 'Thêm nhân khẩu mới';
        document.getElementById('personForm').reset();
        personModal.style.display = 'flex';
    }

    window.editPerson = function(id) {
        const person = persons.find(p => p.id === id);
        if (person) {
            currentEditingId = id;
            document.getElementById('modalTitle').textContent = 'Chỉnh sửa nhân khẩu';
            
            document.getElementById('personHousehold').value = person.household.code;
            document.getElementById('personFullName').value = person.full_name;
            document.getElementById('personAlias').value = person.alias || '';
            document.getElementById('personDob').value = person.dob;
            document.getElementById('personGender').value = person.gender;
            document.getElementById('personBirthPlace').value = person.birth_place || '';
            document.getElementById('personHometown').value = person.hometown || '';
            document.getElementById('personRelation').value = person.relation_to_head || '';
            document.getElementById('personIdNumber').value = person.id_number || '';
            document.getElementById('personIdIssueDate').value = person.id_issue_date || '';
            document.getElementById('personIdIssuePlace').value = person.id_issue_place || '';
            document.getElementById('personResidenceRegDate').value = person.residence_reg_date || '';
            document.getElementById('personPreviousResidence').value = person.previous_residence || '';
            document.getElementById('personOccupation').value = person.occupation || '';
            
            personModal.style.display = 'flex';
        }
    }

    window.viewPerson = function(id) {
        const person = persons.find(p => p.id === id);
        if (person) {
            document.getElementById('viewFullName').textContent = person.full_name;
            document.getElementById('viewAlias').textContent = person.alias || '-';
            document.getElementById('viewDob').textContent = formatDate(person.dob);
            document.getElementById('viewAge').textContent = calculateAge(person.dob) + ' tuổi';
            document.getElementById('viewGender').textContent = getGenderText(person.gender);
            document.getElementById('viewIdNumber').textContent = person.id_number || '-';
            document.getElementById('viewHouseholdCode').textContent = person.household.code;
            document.getElementById('viewRelation').textContent = person.relation_to_head || '-';
            document.getElementById('viewAddress').textContent = person.household.address;
            document.getElementById('viewOccupation').textContent = person.occupation || '-';
            
            viewPersonModal.style.display = 'flex';
        }
    }

    window.closeModal = function() {
        personModal.style.display = 'none';
        currentEditingId = null;
    }

    window.closeViewModal = function() {
        viewPersonModal.style.display = 'none';
    }

    window.editFromView = function() {
        closeViewModal();
        // Get the person ID from the currently viewed person
        const fullName = document.getElementById('viewFullName').textContent;
        const person = persons.find(p => p.full_name === fullName);
        if (person) {
            editPerson(person.id);
        }
    }

    window.savePerson = function() {
        const household = document.getElementById('personHousehold').value;
        const fullName = document.getElementById('personFullName').value;
        const dob = document.getElementById('personDob').value;
        const gender = document.getElementById('personGender').value;

        if (!household || !fullName || !dob || !gender) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        const personData = {
            household: { code: household, address: 'Số 12, Đường X, La Khê' }, // Mock address
            full_name: fullName,
            alias: document.getElementById('personAlias').value,
            dob: dob,
            gender: gender,
            birth_place: document.getElementById('personBirthPlace').value,
            hometown: document.getElementById('personHometown').value,
            relation_to_head: document.getElementById('personRelation').value,
            id_number: document.getElementById('personIdNumber').value,
            id_issue_date: document.getElementById('personIdIssueDate').value,
            id_issue_place: document.getElementById('personIdIssuePlace').value,
            residence_reg_date: document.getElementById('personResidenceRegDate').value,
            previous_residence: document.getElementById('personPreviousResidence').value,
            occupation: document.getElementById('personOccupation').value,
            is_head: false
        };

        if (currentEditingId) {
            // Edit existing person
            const personIndex = persons.findIndex(p => p.id === currentEditingId);
            if (personIndex !== -1) {
                persons[personIndex] = { ...persons[personIndex], ...personData };
                showSuccessMessage('Cập nhật thông tin nhân khẩu thành công!');
            }
        } else {
            // Add new person
            const newPerson = {
                id: Math.max(...persons.map(p => p.id)) + 1,
                ...personData
            };
            persons.push(newPerson);
            showSuccessMessage('Thêm nhân khẩu mới thành công!');
        }

        filteredPersons = [...persons];
        updatePersonList();
        updateStatistics();
        updatePagination();
        closeModal();
    }

    window.changePage = function(direction) {
        const totalPages = Math.ceil(filteredPersons.length / itemsPerPage);
        const newPage = currentPage + direction;
        
        if (newPage >= 1 && newPage <= totalPages) {
            currentPage = newPage;
            updatePersonList();
            updatePagination();
        }
    }

    window.exportPersons = function() {
        // Simple CSV export
        let csv = 'Họ tên,Ngày sinh,Giới tính,CMND/CCCD,Mã hộ khẩu,Quan hệ,Nghề nghiệp\n';
        filteredPersons.forEach(person => {
            csv += `"${person.full_name}","${formatDate(person.dob)}","${getGenderText(person.gender)}","${person.id_number || ''}","${person.household.code}","${person.relation_to_head || ''}","${person.occupation || ''}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'danh_sach_nhan_khau.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Utility functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

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

    function getGenderText(gender) {
        switch (gender) {
            case 'M': return 'Nam';
            case 'F': return 'Nữ';
            case 'O': return 'Khác';
            default: return '-';
        }
    }

    function showSuccessMessage(message) {
        // Simple alert for now - có thể thay thế bằng toast notification
        alert(message);
    }

    // Close modals when clicking outside
    window.onclick = function(event) {
        if (event.target === personModal) {
            closeModal();
        }
        if (event.target === viewPersonModal) {
            closeViewModal();
        }
    }
});

// Global functions for person actions
window.viewPerson = function(personId) {
    // Find person in the list
    const person = persons.find(p => p.id === personId);
    
    if (!person) {
        alert('Không tìm thấy thông tin nhân khẩu');
        return;
    }
    
    // Calculate age
    const today = new Date();
    const birthDate = new Date(person.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    // Fill in the modal with person details
    document.getElementById('viewFullName').textContent = person.full_name || '-';
    document.getElementById('viewAlias').textContent = person.alias || '-';
    document.getElementById('viewDob').textContent = formatDate(person.dob) || '-';
    document.getElementById('viewAge').textContent = age + ' tuổi';
    document.getElementById('viewGender').textContent = person.gender === 'M' ? 'Nam' : person.gender === 'F' ? 'Nữ' : 'Khác';
    document.getElementById('viewIdNumber').textContent = person.id_number || '-';
    document.getElementById('viewHouseholdCode').textContent = person.household?.code || '-';
    document.getElementById('viewRelation').textContent = person.relation_to_head || '-';
    document.getElementById('viewAddress').textContent = person.household?.address || '-';
    document.getElementById('viewOccupation').textContent = person.occupation || '-';
    
    // Store current person ID for edit function
    window.currentViewingPersonId = personId;
    
    // Show the modal
    const modal = document.getElementById('viewPersonModal');
    modal.style.display = 'flex';
};

window.editPerson = function(personId) {
    console.log('Edit person:', personId);
    alert(`Chỉnh sửa nhân khẩu ID: ${personId}\n\nChức năng này sẽ được triển khai sau.`);
};

window.closeViewModal = function() {
    const modal = document.getElementById('viewPersonModal');
    modal.style.display = 'none';
};

window.editFromView = function() {
    if (window.currentViewingPersonId) {
        closeViewModal();
        editPerson(window.currentViewingPersonId);
    }
};

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}