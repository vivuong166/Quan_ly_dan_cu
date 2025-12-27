// Sample person data - will be replaced with API call
const samplePersons = {
    1: {
        id: 1,
        full_name: 'Nguyễn Văn A',
        alias: 'A',
        dob: '1985-03-15',
        gender: 'M',
        birth_place: 'Hà Nội',
        hometown: 'Hà Nội',
        relation_to_head: 'Chủ hộ',
        id_number: '001234567890',
        id_issue_date: '2015-01-10',
        id_issue_place: 'Cục Cảnh sát Hà Nội',
        residence_reg_date: '2020-01-15',
        previous_residence: '',
        occupation: 'Kỹ sư',
        workplace: 'Công ty ABC'
    },
    2: {
        id: 2,
        full_name: 'Trần Thị B',
        alias: 'B',
        dob: '1990-08-22',
        gender: 'F',
        birth_place: 'Hải Phòng',
        hometown: 'Hải Phòng',
        relation_to_head: 'Chủ hộ',
        id_number: '098765432100',
        id_issue_date: '2016-05-20',
        id_issue_place: 'Cục Cảnh sát Hải Phòng',
        residence_reg_date: '2018-06-10',
        previous_residence: 'Số 10, Lê Lợi, Hải Phòng',
        occupation: 'Giáo viên',
        workplace: 'Trường THPT ABC'
    },
    3: {
        id: 3,
        full_name: 'Lê Văn C',
        alias: 'C',
        dob: '2010-12-10',
        gender: 'M',
        birth_place: 'Hà Nội',
        hometown: 'Hà Nội',
        relation_to_head: 'Con',
        id_number: '',
        id_issue_date: '',
        id_issue_place: '',
        residence_reg_date: '2010-12-15',
        previous_residence: '',
        occupation: 'Học sinh',
        workplace: ''
    }
};

// Load person data when page loads
function loadPersonData(personId) {
    const person = samplePersons[personId];
    
    if (!person) {
        alert('Không tìm thấy thông tin nhân khẩu!');
        window.location.href = '/qlhk_nk/nhankhau/';
        return;
    }
    
    // Populate form fields
    document.getElementById('personFullName').value = person.full_name || '';
    document.getElementById('personAlias').value = person.alias || '';
    document.getElementById('personDob').value = person.dob || '';
    document.getElementById('personGender').value = person.gender || '';
    document.getElementById('personBirthPlace').value = person.birth_place || '';
    document.getElementById('personHometown').value = person.hometown || '';
    document.getElementById('personRelation').value = person.relation_to_head || '';
    document.getElementById('personIdNumber').value = person.id_number || '';
    document.getElementById('personIdIssueDate').value = person.id_issue_date || '';
    document.getElementById('personIdIssuePlace').value = person.id_issue_place || '';
    document.getElementById('personResidenceRegDate').value = person.residence_reg_date || '';
    document.getElementById('personPreviousResidence').value = person.previous_residence || '';
    document.getElementById('personOccupation').value = person.occupation || '';
    document.getElementById('personWorkplace').value = person.workplace || '';
}

// Handle move type change
function handleMoveTypeChange() {
    const moveType = document.getElementById('moveType').value;
    const transferFields = document.getElementById('transferFields');
    const pastFields = document.getElementById('pastFields');
    
    // Get form sections
    const personalInfoSection = document.getElementById('personalInfoSection');
    const residenceSection = document.getElementById('residenceSection');
    const workInfoSection = document.getElementById('workInfoSection');
    
    // Hide all conditional fields
    transferFields.style.display = 'none';
    pastFields.style.display = 'none';
    document.getElementById('householdSelection').style.display = 'none';
    document.getElementById('areaInput').style.display = 'none';
    
    // Hide all form sections by default
    personalInfoSection.style.display = 'none';
    residenceSection.style.display = 'none';
    workInfoSection.style.display = 'none';
    
    // Clear required attributes
    clearRequiredFields();
    
    // Show relevant fields based on selection
    if (moveType === 'transfer') {
        transferFields.style.display = 'block';
        setTransferFieldsRequired(true);
    } else if (moveType === 'past') {
        pastFields.style.display = 'block';
    } else if (moveType === 'update') {
        // Show all form sections for updating info
        personalInfoSection.style.display = 'block';
        residenceSection.style.display = 'block';
        workInfoSection.style.display = 'block';
    }
}

// Handle destination type change
function handleDestinationTypeChange() {
    const destinationType = document.getElementById('transferDestinationType').value;
    const householdSelection = document.getElementById('householdSelection');
    const areaInput = document.getElementById('areaInput');
    
    householdSelection.style.display = 'none';
    areaInput.style.display = 'none';
    
    // Clear required
    document.getElementById('newHousehold').required = false;
    document.getElementById('newHouseholdRelation').required = false;
    document.getElementById('transferAddress').required = false;
    
    if (destinationType === 'household') {
        householdSelection.style.display = 'block';
        document.getElementById('newHousehold').required = true;
        document.getElementById('newHouseholdRelation').required = true;
    } else if (destinationType === 'area') {
        areaInput.style.display = 'block';
        document.getElementById('transferAddress').required = true;
    }
}

// Set transfer fields as required
function setTransferFieldsRequired(isRequired) {
    document.getElementById('transferDate').required = isRequired;
    document.getElementById('transferDestinationType').required = isRequired;
}

// Clear all conditional required fields
function clearRequiredFields() {
    // Transfer fields
    document.getElementById('transferDate').required = false;
    document.getElementById('transferDestinationType').required = false;
    document.getElementById('newHousehold').required = false;
    document.getElementById('newHouseholdRelation').required = false;
    document.getElementById('transferAddress').required = false;
}

// Form submission
document.getElementById('editPersonForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const moveType = document.getElementById('moveType').value;
    
    // Validate based on move type
    if (!moveType) {
        alert('Vui lòng chọn loại thao tác!');
        return;
    }
    
    if (moveType === 'transfer') {
        const destinationType = document.getElementById('transferDestinationType').value;
        if (!destinationType) {
            alert('Vui lòng chọn nơi chuyển!');
            return;
        }
        
        if (destinationType === 'household') {
            const newHousehold = document.getElementById('newHousehold').value;
            const newRelation = document.getElementById('newHouseholdRelation').value;
            if (!newHousehold || !newRelation) {
                alert('Vui lòng chọn hộ khẩu mới và nhập quan hệ với chủ hộ!');
                return;
            }
        } else if (destinationType === 'area') {
            const transferAddress = document.getElementById('transferAddress').value;
            if (!transferAddress) {
                alert('Vui lòng nhập địa chỉ nơi chuyển đến!');
                return;
            }
        }
    }
    
    // Show success message
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'flex';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide message after 3 seconds
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
    
    // Here you would normally submit the form data to the server
    console.log('Form submitted successfully');
    console.log('Move type:', moveType);
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today for transfer date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transferDate').value = today;
    
    // Load person data if PERSON_ID is available
    if (typeof PERSON_ID !== 'undefined' && PERSON_ID && PERSON_ID !== 0) {
        loadPersonData(PERSON_ID);
    }
});