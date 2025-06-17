// Enhanced analytics functions

// Calculate project efficiency metrics
function calculateProjectEfficiency() {
    const efficiency = {};
    
    filteredData.forEach(project => {
        const district = project.الحي;
        const totalBudget = project.الاجمالي;
        const actualComponents = project.الاجمالي_المكون_العيني;
        
        if (!efficiency[district]) {
            efficiency[district] = {
                totalBudget: 0,
                actualSpending: 0,
                projectCount: 0,
                efficiency: 0
            };
        }
        
        efficiency[district].totalBudget += totalBudget;
        efficiency[district].actualSpending += actualComponents;
        efficiency[district].projectCount++;
    });
    
    // Calculate efficiency percentage
    Object.keys(efficiency).forEach(district => {
        const data = efficiency[district];
        data.efficiency = data.totalBudget > 0 ? (data.actualSpending / data.totalBudget * 100) : 0;
    });
    
    return efficiency;
}

// Generate advanced insights
function generateInsights() {
    const insights = [];
    
    // Budget distribution analysis
    const totalBudget = filteredData.reduce((sum, p) => sum + p.الاجمالي, 0);
    const districts = [...new Set(filteredData.map(p => p.الحي))];
    const avgBudgetPerDistrict = totalBudget / districts.length;
    
    // Find highest and lowest budget districts
    const districtBudgets = {};
    filteredData.forEach(project => {
        const district = project.الحي;
        districtBudgets[district] = (districtBudgets[district] || 0) + project.الاجمالي;
    });
    
    const sortedDistricts = Object.entries(districtBudgets).sort((a, b) => b[1] - a[1]);
    const highestBudgetDistrict = sortedDistricts[0];
    const lowestBudgetDistrict = sortedDistricts[sortedDistricts.length - 1];
    
    insights.push({
        type: 'budget',
        title: 'توزيع الميزانية',
        description: `أعلى ميزانية: ${highestBudgetDistrict[0]} (${formatCurrency(highestBudgetDistrict[1])})`,
        value: highestBudgetDistrict[1],
        icon: 'fas fa-chart-line'
    });
    
    insights.push({
        type: 'budget',
        title: 'أقل ميزانية',
        description: `أقل ميزانية: ${lowestBudgetDistrict[0]} (${formatCurrency(lowestBudgetDistrict[1])})`,
        value: lowestBudgetDistrict[1],
        icon: 'fas fa-chart-line-down'
    });
    
    // Program analysis
    const programBudgets = {};
    filteredData.forEach(project => {
        const program = project['البرنامج الرئيسي'];
        programBudgets[program] = (programBudgets[program] || 0) + project.الاجمالي;
    });
    
    const topProgram = Object.entries(programBudgets).sort((a, b) => b[1] - a[1])[0];
    insights.push({
        type: 'program',
        title: 'أهم البرامج',
        description: `البرنامج الأكثر تمويلاً: ${topProgram[0]}`,
        value: topProgram[1],
        icon: 'fas fa-tasks'
    });
    
    // Funding source analysis
    const investmentProjects = filteredData.filter(p => p['مصدر التمويل'] === 'استثماري');
    const selfFundedProjects = filteredData.filter(p => p['مصدر التمويل'] === 'ذاتي');
    
    insights.push({
        type: 'funding',
        title: 'مصادر التمويل',
        description: `${investmentProjects.length} مشروع استثماري، ${selfFundedProjects.length} مشروع ذاتي التمويل`,
        value: investmentProjects.length / filteredData.length * 100,
        icon: 'fas fa-money-bill-wave'
    });
    
    return insights;
}

// Export data functionality
function exportToCSV() {
    const headers = ['السنة', 'الحي', 'البرنامج الرئيسي', 'البرنامج الفرعي', 'المشروع الرئيسي', 'المشروع الفرعى', 'مصدر التمويل', 'الإجمالي'];
    
    let csvContent = headers.join(',') + '\\n';
    
    filteredData.forEach(project => {
        const row = [
            project.السنة,
            project.الحي,
            project['البرنامج الرئيسي'],
            project['البرنامج الفرعي'],
            project['المشروع الرئيسي'],
            project['المشروع الفرعى'],
            project['مصدر التمويل'],
            project.الاجمالي
        ];
        csvContent += row.join(',') + '\\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'investment_projects_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Generate summary report
function generateSummaryReport() {
    const report = {
        totalProjects: filteredData.length,
        totalBudget: filteredData.reduce((sum, p) => sum + p.الاجمالي, 0),
        districts: [...new Set(filteredData.map(p => p.الحي))].length,
        programs: [...new Set(filteredData.map(p => p['البرنامج الرئيسي']))].length,
        investmentRatio: 0,
        avgProjectCost: 0,
        topDistrict: '',
        topProgram: '',
        insights: generateInsights()
    };
    
    // Calculate investment ratio
    const investmentBudget = filteredData
        .filter(p => p['مصدر التمويل'] === 'استثماري')
        .reduce((sum, p) => sum + p.الاجمالي, 0);
    report.investmentRatio = report.totalBudget > 0 ? (investmentBudget / report.totalBudget * 100) : 0;
    
    // Calculate average project cost
    report.avgProjectCost = report.totalProjects > 0 ? report.totalBudget / report.totalProjects : 0;
    
    // Find top district and program
    const districtBudgets = {};
    const programBudgets = {};
    
    filteredData.forEach(project => {
        const district = project.الحي;
        const program = project['البرنامج الرئيسي'];
        
        districtBudgets[district] = (districtBudgets[district] || 0) + project.الاجمالي;
        programBudgets[program] = (programBudgets[program] || 0) + project.الاجمالي;
    });
    
    report.topDistrict = Object.entries(districtBudgets).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    report.topProgram = Object.entries(programBudgets).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    
    return report;
}

// Render insights section
function renderInsights() {
    const insights = generateInsights();
    const insightsContainer = document.getElementById('insightsContainer');
    
    if (!insightsContainer) return;
    
    insightsContainer.innerHTML = insights.map(insight => `
        <div class="insight-card">
            <div class="insight-icon">
                <i class="${insight.icon}"></i>
            </div>
            <div class="insight-content">
                <h4>${insight.title}</h4>
                <p>${insight.description}</p>
                <span class="insight-value">${formatCurrency(insight.value)}</span>
            </div>
        </div>
    `).join('');
}

// Advanced filtering
function applyAdvancedFilters() {
    const minBudget = document.getElementById('minBudgetFilter')?.value || 0;
    const maxBudget = document.getElementById('maxBudgetFilter')?.value || Infinity;
    
    filteredData = projectsData.filter(project => {
        const budget = project.الاجمالي;
        return budget >= minBudget && budget <= maxBudget;
    });
    
    // Apply existing filters
    applyFilters();
}

// Performance metrics calculation
function calculatePerformanceMetrics() {
    const metrics = {
        budgetUtilization: 0,
        projectDiversity: 0,
        geographicDistribution: 0,
        fundingBalance: 0
    };
    
    // Budget utilization (actual vs planned)
    const totalPlanned = filteredData.reduce((sum, p) => sum + p.الاجمالي, 0);
    const totalActual = filteredData.reduce((sum, p) => sum + p.الاجمالي_المكون_العيني, 0);
    metrics.budgetUtilization = totalPlanned > 0 ? (totalActual / totalPlanned * 100) : 0;
    
    // Project diversity (number of different programs)
    const uniquePrograms = new Set(filteredData.map(p => p['البرنامج الرئيسي']));
    metrics.projectDiversity = (uniquePrograms.size / 6) * 100; // Assuming 6 main programs
    
    // Geographic distribution (how evenly distributed across districts)
    const districtCounts = {};
    filteredData.forEach(p => {
        districtCounts[p.الحي] = (districtCounts[p.الحي] || 0) + 1;
    });
    const avgProjectsPerDistrict = filteredData.length / Object.keys(districtCounts).length;
    const variance = Object.values(districtCounts).reduce((sum, count) => 
        sum + Math.pow(count - avgProjectsPerDistrict, 2), 0) / Object.keys(districtCounts).length;
    metrics.geographicDistribution = Math.max(0, 100 - (variance / avgProjectsPerDistrict * 10));
    
    // Funding balance (investment vs self-funded)
    const investmentCount = filteredData.filter(p => p['مصدر التمويل'] === 'استثماري').length;
    const selfCount = filteredData.filter(p => p['مصدر التمويل'] === 'ذاتي').length;
    const idealRatio = 0.7; // 70% investment, 30% self-funded
    const actualRatio = filteredData.length > 0 ? investmentCount / filteredData.length : 0;
    metrics.fundingBalance = 100 - Math.abs(actualRatio - idealRatio) * 100;
    
    return metrics;
}

// Update performance indicators
function updatePerformanceIndicators() {
    const metrics = calculatePerformanceMetrics();
    
    document.getElementById('budgetUtilization').textContent = formatPercentage(metrics.budgetUtilization);
    document.getElementById('projectDiversity').textContent = formatPercentage(metrics.projectDiversity);
    document.getElementById('geographicDistribution').textContent = formatPercentage(metrics.geographicDistribution);
    document.getElementById('fundingBalance').textContent = formatPercentage(metrics.fundingBalance);
}

