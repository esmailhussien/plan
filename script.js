// Global variables
let projectsData = [];
let filteredData = [];
let charts = {};

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeEventListeners();
    initializeTabs();
});

// Load data from JSON file
async function loadData() {
    try {
        const response = await fetch('data.json');
        projectsData = await response.json();
        filteredData = [...projectsData];
        
        populateFilters();
        updateDashboard();
        renderCharts();
        populateProjectsTable();
        renderDistrictsAnalysis();
        renderProgramsAnalysis();
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError('خطأ في تحميل البيانات');
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Filter change events
    document.getElementById('yearFilter').addEventListener('change', applyFilters);
    document.getElementById('districtFilter').addEventListener('change', applyFilters);
    document.getElementById('programFilter').addEventListener('change', applyFilters);
    document.getElementById('fundingFilter').addEventListener('change', applyFilters);
    
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

// Initialize tabs
function initializeTabs() {
    switchTab('overview');
}

// Switch between tabs
function switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    
    // Refresh charts if needed
    setTimeout(() => {
        if (charts[tabId]) {
            Object.values(charts[tabId]).forEach(chart => {
                if (chart && chart.resize) chart.resize();
            });
        }
    }, 100);
}

// Populate filter dropdowns
function populateFilters() {
    const years = [...new Set(projectsData.map(p => p.السنة))].sort();
    const districts = [...new Set(projectsData.map(p => p.الحي))].sort();
    const programs = [...new Set(projectsData.map(p => p['البرنامج الرئيسي']))].sort();
    
    populateSelect('yearFilter', years);
    populateSelect('districtFilter', districts);
    populateSelect('programFilter', programs);
}

// Helper function to populate select elements
function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    const currentValue = select.value;
    
    // Clear existing options except the first one
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
    
    // Restore previous value if it still exists
    if (options.includes(currentValue)) {
        select.value = currentValue;
    }
}

// Apply filters
function applyFilters() {
    const yearFilter = document.getElementById('yearFilter').value;
    const districtFilter = document.getElementById('districtFilter').value;
    const programFilter = document.getElementById('programFilter').value;
    const fundingFilter = document.getElementById('fundingFilter').value;
    
    filteredData = projectsData.filter(project => {
        return (!yearFilter || project.السنة === yearFilter) &&
               (!districtFilter || project.الحي === districtFilter) &&
               (!programFilter || project['البرنامج الرئيسي'] === programFilter) &&
               (!fundingFilter || project['مصدر التمويل'] === fundingFilter);
    });
    
    updateDashboard();
    renderCharts();
    populateProjectsTable();
    renderDistrictsAnalysis();
    renderProgramsAnalysis();
}

// Reset filters
function resetFilters() {
    document.getElementById('yearFilter').value = '';
    document.getElementById('districtFilter').value = '';
    document.getElementById('programFilter').value = '';
    document.getElementById('fundingFilter').value = '';
    document.getElementById('searchInput').value = '';
    
    filteredData = [...projectsData];
    updateDashboard();
    renderCharts();
    populateProjectsTable();
    renderDistrictsAnalysis();
    renderProgramsAnalysis();
}

// Handle search
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const tableBody = document.getElementById('projectsTableBody');
    const rows = tableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Update dashboard statistics
function updateDashboard() {
    const totalProjects = filteredData.length;
    const totalBudget = filteredData.reduce((sum, project) => sum + project.الاجمالي, 0);
    const avgProjectCost = totalProjects > 0 ? totalBudget / totalProjects : 0;
    
    // Calculate construction percentage
    const totalConstruction = filteredData.reduce((sum, project) => 
        sum + (project['المكون العينى']['تشييدات'] || 0), 0);
    const constructionPercentage = totalBudget > 0 ? (totalConstruction / totalBudget * 100) : 0;
    
    // Calculate equipment percentage
    const totalEquipment = filteredData.reduce((sum, project) => 
        sum + (project['المكون العينى']['آلات ومعدات'] || 0), 0);
    const equipmentPercentage = totalBudget > 0 ? (totalEquipment / totalBudget * 100) : 0;
    
    // Calculate investment ratio
    const investmentProjects = filteredData.filter(p => p['مصدر التمويل'] === 'استثماري');
    const investmentBudget = investmentProjects.reduce((sum, project) => sum + project.الاجمالي, 0);
    const investmentRatio = totalBudget > 0 ? (investmentBudget / totalBudget * 100) : 0;
    
    // Calculate average budget per district
    const districts = [...new Set(filteredData.map(p => p.الحي))];
    const avgBudgetPerDistrict = districts.length > 0 ? totalBudget / districts.length : 0;
    
    // Update UI
    document.getElementById('totalProjects').textContent = formatNumber(totalProjects);
    document.getElementById('totalBudget').textContent = formatCurrency(totalBudget);
    document.getElementById('avgProjectCost').textContent = formatCurrency(avgProjectCost);
    document.getElementById('constructionPercentage').textContent = formatPercentage(constructionPercentage);
    document.getElementById('equipmentPercentage').textContent = formatPercentage(equipmentPercentage);
    document.getElementById('investmentRatio').textContent = formatPercentage(investmentRatio);
    document.getElementById('avgBudgetPerDistrict').textContent = formatCurrency(avgBudgetPerDistrict);
    document.getElementById('budgetDistribution').textContent = formatNumber(districts.length);
}

// Render charts
function renderCharts() {
    renderProgramChart();
    renderDistrictChart();
    renderFundingChart();
    renderComponentsChart();
    renderTrendChart();
}

// Render program distribution chart
function renderProgramChart() {
    const ctx = document.getElementById('programChart').getContext('2d');
    
    if (charts.programChart) {
        charts.programChart.destroy();
    }
    
    const programData = {};
    filteredData.forEach(project => {
        const program = project['البرنامج الرئيسي'];
        programData[program] = (programData[program] || 0) + 1;
    });
    
    const labels = Object.keys(programData);
    const data = Object.values(programData);
    const colors = generateColors(labels.length);
    
    charts.programChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Render district budget chart
function renderDistrictChart() {
    const ctx = document.getElementById('districtChart').getContext('2d');
    
    if (charts.districtChart) {
        charts.districtChart.destroy();
    }
    
    const districtData = {};
    filteredData.forEach(project => {
        const district = project.الحي;
        districtData[district] = (districtData[district] || 0) + project.الاجمالي;
    });
    
    const labels = Object.keys(districtData);
    const data = Object.values(districtData);
    
    charts.districtChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'الميزانية',
                data: data,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Render funding source chart
function renderFundingChart() {
    const ctx = document.getElementById('fundingChart').getContext('2d');
    
    if (charts.fundingChart) {
        charts.fundingChart.destroy();
    }
    
    const fundingData = {};
    filteredData.forEach(project => {
        const funding = project['مصدر التمويل'];
        fundingData[funding] = (fundingData[funding] || 0) + project.الاجمالي;
    });
    
    const labels = Object.keys(fundingData);
    const data = Object.values(fundingData);
    
    charts.fundingChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['rgba(102, 126, 234, 0.8)', 'rgba(118, 75, 162, 0.8)'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}

// Render components analysis chart
function renderComponentsChart() {
    const ctx = document.getElementById('componentsChart').getContext('2d');
    
    if (charts.componentsChart) {
        charts.componentsChart.destroy();
    }
    
    const componentTypes = ['أرض', 'تشييدات', 'آلات ومعدات', 'عدد وأدوات', 'وسائل نقل', 'وسائل انتقال', 'أثاث وتجهيزات مكتبية', 'أبحاث ودراسات'];
    const componentData = {};
    
    componentTypes.forEach(type => {
        componentData[type] = filteredData.reduce((sum, project) => 
            sum + (project['المكون العينى'][type] || 0), 0);
    });
    
    const labels = Object.keys(componentData);
    const data = Object.values(componentData);
    const colors = generateColors(labels.length);
    
    charts.componentsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'القيمة',
                data: data,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                },
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// Render trend chart (placeholder for now)
function renderTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    if (charts.trendChart) {
        charts.trendChart.destroy();
    }
    
    // Group data by year and calculate totals
    const yearData = {};
    filteredData.forEach(project => {
        const year = project.السنة;
        yearData[year] = (yearData[year] || 0) + project.الاجمالي;
    });
    
    const labels = Object.keys(yearData).sort();
    const data = labels.map(year => yearData[year]);
    
    charts.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'إجمالي الإنفاق',
                data: data,
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// Populate projects table
function populateProjectsTable() {
    const tableBody = document.getElementById('projectsTableBody');
    tableBody.innerHTML = '';
    
    filteredData.forEach((project, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${project.السنة}</td>
            <td>${project.الحي}</td>
            <td>${project['البرنامج الرئيسي']}</td>
            <td>${project['المشروع الرئيسي']}</td>
            <td>${project['المشروع الفرعى']}</td>
            <td>${project['مصدر التمويل']}</td>
            <td>${formatCurrency(project.الاجمالي)}</td>
            <td>
                <button class="view-details-btn" onclick="showProjectDetails(${index})">
                    عرض التفاصيل
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Show project details in modal
function showProjectDetails(index) {
    const project = filteredData[index];
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = project['المشروع الفرعى'];
    
    modalBody.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">السنة:</span>
            <span class="detail-value">${project.السنة}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">الحي:</span>
            <span class="detail-value">${project.الحي}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">البرنامج الرئيسي:</span>
            <span class="detail-value">${project['البرنامج الرئيسي']}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">البرنامج الفرعي:</span>
            <span class="detail-value">${project['البرنامج الفرعي']}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">المشروع الرئيسي:</span>
            <span class="detail-value">${project['المشروع الرئيسي']}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">مصدر التمويل:</span>
            <span class="detail-value">${project['مصدر التمويل']}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">الإجمالي:</span>
            <span class="detail-value">${formatCurrency(project.الاجمالي)}</span>
        </div>
        <h4 style="margin: 20px 0 15px 0; color: #667eea;">المكونات العينية:</h4>
        <div class="components-grid">
            ${Object.entries(project['المكون العينى']).map(([key, value]) => `
                <div class="component-item">
                    <h4>${key}</h4>
                    <div class="component-value">${formatCurrency(value)}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('projectModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('projectModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Render districts analysis
function renderDistrictsAnalysis() {
    const districtsGrid = document.getElementById('districtsGrid');
    districtsGrid.innerHTML = '';
    
    const districtStats = {};
    
    filteredData.forEach(project => {
        const district = project.الحي;
        if (!districtStats[district]) {
            districtStats[district] = {
                projectCount: 0,
                totalBudget: 0,
                investmentBudget: 0,
                selfBudget: 0
            };
        }
        
        districtStats[district].projectCount++;
        districtStats[district].totalBudget += project.الاجمالي;
        
        if (project['مصدر التمويل'] === 'استثماري') {
            districtStats[district].investmentBudget += project.الاجمالي;
        } else {
            districtStats[district].selfBudget += project.الاجمالي;
        }
    });
    
    Object.entries(districtStats).forEach(([district, stats]) => {
        const card = document.createElement('div');
        card.className = 'district-card';
        card.innerHTML = `
            <h3>${district}</h3>
            <div class="district-stats">
                <div class="district-stat">
                    <span>عدد المشروعات:</span>
                    <span>${formatNumber(stats.projectCount)}</span>
                </div>
                <div class="district-stat">
                    <span>إجمالي الميزانية:</span>
                    <span>${formatCurrency(stats.totalBudget)}</span>
                </div>
                <div class="district-stat">
                    <span>التمويل الاستثماري:</span>
                    <span>${formatCurrency(stats.investmentBudget)}</span>
                </div>
                <div class="district-stat">
                    <span>التمويل الذاتي:</span>
                    <span>${formatCurrency(stats.selfBudget)}</span>
                </div>
            </div>
        `;
        districtsGrid.appendChild(card);
    });
}

// Render programs analysis
function renderProgramsAnalysis() {
    const programsGrid = document.getElementById('programsGrid');
    programsGrid.innerHTML = '';
    
    const programStats = {};
    
    filteredData.forEach(project => {
        const program = project['البرنامج الرئيسي'];
        if (!programStats[program]) {
            programStats[program] = {
                projectCount: 0,
                totalBudget: 0,
                avgBudget: 0
            };
        }
        
        programStats[program].projectCount++;
        programStats[program].totalBudget += project.الاجمالي;
    });
    
    // Calculate averages
    Object.values(programStats).forEach(stats => {
        stats.avgBudget = stats.projectCount > 0 ? stats.totalBudget / stats.projectCount : 0;
    });
    
    Object.entries(programStats).forEach(([program, stats]) => {
        const card = document.createElement('div');
        card.className = 'program-card';
        card.innerHTML = `
            <h3>${program}</h3>
            <div class="program-stats">
                <div class="program-stat">
                    <span>عدد المشروعات:</span>
                    <span>${formatNumber(stats.projectCount)}</span>
                </div>
                <div class="program-stat">
                    <span>إجمالي الميزانية:</span>
                    <span>${formatCurrency(stats.totalBudget)}</span>
                </div>
                <div class="program-stat">
                    <span>متوسط تكلفة المشروع:</span>
                    <span>${formatCurrency(stats.avgBudget)}</span>
                </div>
            </div>
        `;
        programsGrid.appendChild(card);
    });
}

// Utility functions
function formatCurrency(amount) {
    if (amount === 0) return '0 جنيه';
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + ' مليون جنيه';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + ' ألف جنيه';
    }
    return amount.toLocaleString('ar-EG') + ' جنيه';
}

function formatNumber(number) {
    return number.toLocaleString('ar-EG');
}

function formatPercentage(percentage) {
    return percentage.toFixed(1) + '%';
}

function generateColors(count) {
    const colors = [
        'rgba(102, 126, 234, 0.8)',
        'rgba(118, 75, 162, 0.8)',
        'rgba(255, 107, 107, 0.8)',
        'rgba(255, 159, 67, 0.8)',
        'rgba(72, 219, 251, 0.8)',
        'rgba(29, 233, 182, 0.8)',
        'rgba(255, 195, 113, 0.8)',
        'rgba(165, 177, 194, 0.8)'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}

function showError(message) {
    console.error(message);
    // You can implement a toast notification here
}


// Enhanced dashboard functions for advanced analytics

// Show insights
function showInsights() {
    const insightsSection = document.getElementById('insightsSection');
    insightsSection.style.display = insightsSection.style.display === 'none' ? 'block' : 'none';
    
    if (insightsSection.style.display === 'block') {
        renderInsights();
    }
}

// Generate and show report
function generateReport() {
    const report = generateSummaryReport();
    showReportModal(report);
}

// Show report modal
function showReportModal(report) {
    const modal = document.createElement('div');
    modal.className = 'report-modal';
    modal.innerHTML = `
        <div class="report-modal-content">
            <div class="report-header">
                <h3>تقرير ملخص المشروعات الاستثمارية</h3>
                <span class="close" onclick="closeReportModal()">&times;</span>
            </div>
            <div class="report-body">
                <div class="report-section">
                    <h4>الإحصائيات العامة</h4>
                    <div class="report-stats">
                        <div class="report-stat">
                            <span class="report-stat-value">${formatNumber(report.totalProjects)}</span>
                            <span class="report-stat-label">إجمالي المشروعات</span>
                        </div>
                        <div class="report-stat">
                            <span class="report-stat-value">${formatCurrency(report.totalBudget)}</span>
                            <span class="report-stat-label">إجمالي الميزانية</span>
                        </div>
                        <div class="report-stat">
                            <span class="report-stat-value">${formatNumber(report.districts)}</span>
                            <span class="report-stat-label">عدد الأحياء</span>
                        </div>
                        <div class="report-stat">
                            <span class="report-stat-value">${formatNumber(report.programs)}</span>
                            <span class="report-stat-label">عدد البرامج</span>
                        </div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h4>مؤشرات الأداء</h4>
                    <div class="report-stats">
                        <div class="report-stat">
                            <span class="report-stat-value">${formatPercentage(report.investmentRatio)}</span>
                            <span class="report-stat-label">نسبة التمويل الاستثماري</span>
                        </div>
                        <div class="report-stat">
                            <span class="report-stat-value">${formatCurrency(report.avgProjectCost)}</span>
                            <span class="report-stat-label">متوسط تكلفة المشروع</span>
                        </div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h4>أهم النتائج</h4>
                    <p><strong>الحي الأكثر استثماراً:</strong> ${report.topDistrict}</p>
                    <p><strong>البرنامج الأكثر تمويلاً:</strong> ${report.topProgram}</p>
                </div>
                
                <div class="report-section">
                    <h4>الرؤى والتوصيات</h4>
                    ${report.insights.map(insight => `
                        <div style="margin-bottom: 15px; padding: 10px; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
                            <strong>${insight.title}:</strong> ${insight.description}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Close modal when clicking outside
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeReportModal();
        }
    }
}

// Close report modal
function closeReportModal() {
    const modal = document.querySelector('.report-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Update the main updateDashboard function to include performance metrics
const originalUpdateDashboard = updateDashboard;
updateDashboard = function() {
    originalUpdateDashboard();
    updatePerformanceIndicators();
};

