// Global households data
const householdsData = [
    { id: 'HK-001', chu: 'Nguyễn Văn A', members: 4, fees: [{ year: 2025, paid: true }] },
    { id: 'HK-002', chu: 'Trần Thị B', members: 3, fees: [] },
    { id: 'HK-003', chu: 'Lê Văn C', members: 5, fees: [] },
    { id: 'HK-004', chu: 'Phạm Thị D', members: 2, fees: [] },
    { id: 'HK-005', chu: 'Hoàng Văn E', members: 6, fees: [] }
];

document.addEventListener('DOMContentLoaded', function(){
    const households = householdsData;
    const unit = 6000; // 6.000đ / người / năm

    const feeList = document.getElementById('feeList');

    function formatVnd(n){ return n.toLocaleString('vi-VN') + 'đ'; }
    
    // Populate year dropdowns
    function populateYearDropdowns() {
        const currentYear = new Date().getFullYear();
        const feeYearSelect = document.getElementById('feeYear');
        const filterYearSelect = document.getElementById('filterYear');
        
        if (feeYearSelect) {
            // Add years from current-1 back to 2020
            for (let year = currentYear - 1; year >= 2020; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                feeYearSelect.appendChild(option);
            }
        }
        
        if (filterYearSelect) {
            // Add years for filter (including current year)
            for (let year = currentYear; year >= 2020; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                filterYearSelect.appendChild(option);
            }
            
            // Auto-select the most recent year with data
            const latestYear = getLatestFeeYear();
            if (latestYear) {
                filterYearSelect.value = latestYear;
                filterFeeList(latestYear);
            }
        }
    }
    
    // Get the latest year with fee data
    function getLatestFeeYear() {
        let maxYear = 0;
        households.forEach(h => {
            if (h.fees && h.fees.length > 0) {
                h.fees.forEach(f => {
                    if (f.year > maxYear) maxYear = f.year;
                });
            }
        });
        return maxYear || null;
    }
    
    // Filter fee list by year
    function filterFeeList(year) {
        renderFeeList(year);
    }
    
    // Render fee list with sorting (unpaid first)
    function renderFeeList(filterYear = '') {
        if (!feeList) return;
        
        feeList.innerHTML = '';
        
        // Collect all fee records
        let feeRecords = [];
        households.forEach(h => {
            if (h.fees && h.fees.length > 0) {
                h.fees.forEach(f => {
                    if (!filterYear || f.year == filterYear) {
                        feeRecords.push({
                            id: h.id,
                            chu: h.chu,
                            members: h.members,
                            year: f.year,
                            paid: f.paid
                        });
                    }
                });
            }
        });
        
        // Sort: unpaid first, then paid
        feeRecords.sort((a, b) => {
            if (a.paid === b.paid) return b.year - a.year; // Same status: newer year first
            return a.paid ? 1 : -1; // Unpaid first
        });
        
        // Render rows
        feeRecords.forEach(record => {
            const total = record.members * unit;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${record.id}</td>
                            <td>${record.chu}</td>
                            <td>${record.members}</td>
                            <td>${record.year}</td>
                            <td>${formatVnd(total)}</td>
                            <td><span class="status ${record.paid ? 'paid' : 'unpaid'}">${record.paid ? 'Đã thu' : 'Chưa thu'}</span></td>
                            <td><button class="btn-action" onclick="handleFeeAction(this, '${record.id}', ${record.year})">${record.paid ? 'Hoàn tác' : 'Thu phí'}</button></td>`;
            feeList.appendChild(tr);
        });
    }
    
    // Initialize page
    populateYearDropdowns();
    renderFeeList();
    
    // Initialize household dropdown
    function initializeHouseholdDropdown() {
        const householdSelect = document.getElementById('donationHousehold');
        if (!householdSelect) return;
        
        // Clear existing options except the first one
        while (householdSelect.children.length > 1) {
            householdSelect.removeChild(householdSelect.lastChild);
        }
        
        // Add households from data
        householdsData.forEach(h => {
            const option = document.createElement('option');
            option.value = h.id;
            option.textContent = `${h.id} - ${h.chu} (${h.members} người)`;
            householdSelect.appendChild(option);
        });
    }
    
    // Initialize dropdown on page load
    initializeHouseholdDropdown();

    // Tab switching functionality
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.fee-panel').forEach(p => p.classList.remove('active'));
            const tab = btn.dataset.tab;
            const el = document.getElementById('tab-' + tab);
            if (el) el.classList.add('active');
        });
    });

    // Generate fee receipts for all households
    const addFeeBtn = document.getElementById('addFee');
    if (addFeeBtn) {
        addFeeBtn.addEventListener('click', function(){
            const yearSelect = document.getElementById('feeYear');
            const selectedYear = yearSelect ? parseInt(yearSelect.value) : null;
            
            if (!selectedYear) {
                alert('Vui lòng chọn năm lập phiếu thu!');
                return;
            }
            
            // Check if year already exists for any household
            const yearExists = households.some(h => 
                h.fees && h.fees.some(f => f.year === selectedYear)
            );
            
            if (yearExists) {
                alert(`Đã có phiếu thu cho năm ${selectedYear}. Vui lòng chọn năm khác!`);
                return;
            }
            
            if (!confirm(`Tạo phiếu thu cho năm ${selectedYear} cho tất cả hộ gia đình?`)) return;
            
            households.forEach(h => {
                if (!h.fees) h.fees = [];
                h.fees.push({ year: selectedYear, paid: false });
            });
            
            // Reset year selector
            yearSelect.value = '';
            
            // Re-render list and update filter
            renderFeeList();
            
            // Update filter dropdown and auto-select new year
            const filterYear = document.getElementById('filterYear');
            if (filterYear) {
                filterYear.value = selectedYear;
                filterFeeList(selectedYear);
            }
            
            alert(`Đã tạo phiếu thu cho năm ${selectedYear} cho tất cả hộ gia đình!`);
        });
    }
    
    // Filter year change handler
    const filterYearSelect = document.getElementById('filterYear');
    if (filterYearSelect) {
        filterYearSelect.addEventListener('change', function() {
            filterFeeList(this.value);
        });
    }

    // Donation functionality placeholder
    const addDonationBtn = document.getElementById('addDonation');
    
    if (addDonationBtn) {
        addDonationBtn.addEventListener('click', function(){
            const donationType = document.getElementById('donationType').value;
            const donationHousehold = document.getElementById('donationHousehold').value;
            const donationAmount = document.getElementById('donationAmount').value;
            
            if (!donationType) {
                alert('Vui lòng chọn đợt đóng góp!');
                return;
            }
            
            if (!donationHousehold) {
                alert('Vui lòng chọn hộ gia đình!');
                return;
            }
            
            if (!donationAmount || parseInt(donationAmount) <= 0) {
                alert('Vui lòng nhập số tiền đóng góp hợp lệ!');
                return;
            }
            
            // Get campaign name and household info from selected options
            const campaignOption = document.getElementById('donationType').selectedOptions[0];
            const householdOption = document.getElementById('donationHousehold').selectedOptions[0];
            
            const campaignName = campaignOption ? campaignOption.textContent : '';
            const householdInfo = householdOption ? householdOption.textContent : '';
            
            const formattedAmount = parseInt(donationAmount).toLocaleString('vi-VN') + 'đ';
            
            alert(`Đã ghi nhận đóng góp:\n` +
                  `- Đợt: ${campaignName}\n` +
                  `- Hộ gia đình: ${householdInfo}\n` +
                  `- Số tiền: ${formattedAmount}`);
            
            // Clear form
            document.getElementById('donationType').value = '';
            document.getElementById('donationHousehold').value = '';
            document.getElementById('donationAmount').value = '';
        });
    }
});

// Global function for fee action (Thu phí/Hoàn tác)
function handleFeeAction(btn, householdId, year) {
    const household = householdsData.find(h => h.id === householdId);
    if (!household) return;
    
    const feeRecord = household.fees.find(f => f.year === year);
    if (!feeRecord) return;
    
    // Toggle paid status
    feeRecord.paid = !feeRecord.paid;
    
    // Update UI
    const row = btn.closest('tr');
    const statusCell = row.querySelector('.status');
    
    if (feeRecord.paid) {
        statusCell.classList.remove('unpaid');
        statusCell.classList.add('paid');
        statusCell.textContent = 'Đã thu';
        btn.textContent = 'Hoàn tác';
    } else {
        statusCell.classList.remove('paid');
        statusCell.classList.add('unpaid');
        statusCell.textContent = 'Chưa thu';
        btn.textContent = 'Thu phí';
    }
    
    // Visual feedback
    statusCell.style.transform = 'scale(1.1)';
    setTimeout(() => {
        statusCell.style.transform = 'scale(1)';
    }, 150);
}

// Modal functions
function showCreateCampaignModal() {
    const modal = document.getElementById('createCampaignModal');
    if (modal) {
        modal.style.display = 'block';
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0];
        
        document.getElementById('startDate').value = today;
        document.getElementById('endDate').value = nextWeek;
    }
}

function closeCreateCampaignModal() {
    const modal = document.getElementById('createCampaignModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        document.getElementById('createCampaignForm').reset();
    }
}

// Initialize modal event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Show modal button
    const showModalBtn = document.getElementById('showCreateCampaignForm');
    if (showModalBtn) {
        showModalBtn.addEventListener('click', showCreateCampaignModal);
    }
    
    // Close modal when clicking X
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCreateCampaignModal);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('createCampaignModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeCreateCampaignModal();
            }
        });
    }
    
    // Handle form submission
    const form = document.getElementById('createCampaignForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const campaignData = {};
            
            // Collect form data
            for (let [key, value] of formData.entries()) {
                campaignData[key] = value;
            }
            
            // Validate required fields
            if (!campaignData.campaignName || !campaignData.startDate || 
                !campaignData.endDate) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
                return;
            }
            
            // Validate date range
            const startDate = new Date(campaignData.startDate);
            const endDate = new Date(campaignData.endDate);
            
            if (endDate <= startDate) {
                alert('Ngày kết thúc phải sau ngày bắt đầu!');
                return;
            }
            
            // Process the campaign creation
            console.log('Tạo đợt đóng góp:', campaignData);
            
            // Add campaign to dropdown
            const donationTypeSelect = document.getElementById('donationType');
            if (donationTypeSelect) {
                const campaignId = campaignData.campaignName.toLowerCase().replace(/\s+/g, '_');
                const option = document.createElement('option');
                option.value = campaignId;
                option.textContent = campaignData.campaignName;
                donationTypeSelect.appendChild(option);
            }
            
            alert('Tạo đợt đóng góp thành công!');
            closeCreateCampaignModal();
        });
    }
});

