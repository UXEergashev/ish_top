// Worker Dashboard - Simple but Complete Prototype
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Worker Dashboard Loading...');

    // Check authentication
    const userStr = localStorage.getItem('trustid_current_user');
    if (!userStr) {
        console.log('No user found, redirecting to index');
        window.location.href = 'index.html';
        return;
    }

    currentUser = JSON.parse(userStr);
    console.log('Current user:', currentUser);

    if (currentUser.type !== 'worker') {
        console.log('User is not a worker, redirecting');
        window.location.href = 'index.html';
        return;
    }

    console.log('Initializing dashboard...');
    initializeDashboard();
});

function initializeDashboard() {
    try {
        // Set user info
        const balanceEl = document.getElementById('userBalance');
        const initialsEl = document.getElementById('userInitials');

        if (balanceEl) balanceEl.textContent = formatCurrency(currentUser.balance || 0);
        if (initialsEl) initialsEl.textContent = currentUser.name.charAt(0).toUpperCase();

        // Load dashboard data
        loadDashboardStats();
        loadRecommendedJobs();
        loadRecentActivity();
        loadProfile();

        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Section Navigation
function showSection(sectionName) {
    console.log('Showing section:', sectionName);

    try {
        // Update nav items
        const allNavItems = document.querySelectorAll('.nav-item');
        allNavItems.forEach(item => item.classList.remove('active'));

        // Find and activate the clicked nav item
        allNavItems.forEach(item => {
            const onclick = item.getAttribute('onclick');
            if (onclick && onclick.includes(`'${sectionName}'`)) {
                item.classList.add('active');
            }
        });

        // Update sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(`section-${sectionName}`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update page title
        const titles = {
            dashboard: 'Bosh sahifa',
            profile: 'Profil',
            jobs: 'Ish qidirish',
            applications: 'Murojaatlarim',
            contracts: 'Shartnomalar',
            transactions: 'To\'lovlar',
            history: 'Tarix'
        };

        const titleEl = document.getElementById('pageTitle');
        if (titleEl && titles[sectionName]) {
            titleEl.textContent = titles[sectionName];
        }

        // Load section data
        loadSectionData(sectionName);
    } catch (error) {
        console.error('Error showing section:', error);
    }
}

function loadSectionData(sectionName) {
    try {
        switch (sectionName) {
            case 'jobs':
                loadAllJobs();
                break;
            case 'applications':
                loadApplications();
                break;
            case 'contracts':
                loadContracts();
                break;
            case 'transactions':
                loadTransactions();
                break;
            case 'history':
                loadHistory();
                break;
        }
    } catch (error) {
        console.error('Error loading section data:', error);
    }
}

// Dashboard Stats
function loadDashboardStats() {
    try {
        const contracts = JSON.parse(localStorage.getItem('fermerx_contracts') || '[]');
        const userContracts = contracts.filter(c => c.workerId === currentUser.id);

        const activeJobs = userContracts.filter(c => c.status === 'active').length;
        const completedJobs = userContracts.filter(c => c.status === 'completed').length;

        const transactions = JSON.parse(localStorage.getItem('fermerx_transactions') || '[]');
        const userTransactions = transactions.filter(t => t.receiverId === currentUser.id && t.status === 'completed');
        const totalEarnings = userTransactions.reduce((sum, t) => sum + t.amount, 0);

        document.getElementById('totalJobs').textContent = activeJobs;
        document.getElementById('completedJobs').textContent = completedJobs;
        document.getElementById('userRating').textContent = (currentUser.rating || 0).toFixed(1);
        document.getElementById('totalEarnings').textContent = formatCurrency(totalEarnings);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Recommended Jobs
function loadRecommendedJobs() {
    try {
        const jobs = JSON.parse(localStorage.getItem('fermerx_jobs') || '[]');
        const activeJobs = jobs.filter(j => j.status === 'active').slice(0, 3);

        const container = document.getElementById('recommendedJobs');
        if (!container) return;

        if (activeJobs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💼</div>
                    <div class="empty-state-text">Hozircha mavjud ishlar yo'q</div>
                    <p style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.875rem;">
                        Ish beruvchilar ish e'lon qilganida bu yerda ko'rinadi
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = activeJobs.map(job => `
            <div class="job-card">
                <div class="job-header">
                    <div>
                        <div class="job-title">${job.title}</div>
                        <span class="job-category">${job.category}</span>
                    </div>
                    <div class="job-salary">${formatCurrency(job.salary)}</div>
                </div>
                <div class="job-meta">
                    <span class="job-meta-item">📍 ${job.location}</span>
                    <span class="job-meta-item">⏱️ ${job.duration}</span>
                </div>
                <div class="job-description">${job.description.substring(0, 100)}...</div>
                <div class="job-actions">
                    <button class="btn-primary" onclick="applyToJob('${job.id}')">
                        Murojaat yuborish
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading recommended jobs:', error);
    }
}

// Recent Activity
function loadRecentActivity() {
    try {
        const activities = [
            {
                icon: '✅',
                title: 'Profilingiz faol',
                time: 'Hozir'
            },
            {
                icon: '💼',
                title: `${JSON.parse(localStorage.getItem('fermerx_jobs') || '[]').filter(j => j.status === 'active').length} ta faol ish mavjud`,
                time: 'Bugun'
            },
            {
                icon: '📝',
                title: 'Platformaga xush kelibsiz!',
                time: 'Yangi'
            }
        ];

        const container = document.getElementById('recentActivity');
        if (!container) return;

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading activity:', error);
    }
}

// Profile Management
function loadProfile() {
    try {
        const nameEl = document.getElementById('profileName');
        const phoneEl = document.getElementById('profilePhone');
        const regionEl = document.getElementById('profileRegion');
        const jobTypeEl = document.getElementById('profileJobType');
        const experienceEl = document.getElementById('profileExperience');
        const descriptionEl = document.getElementById('profileDescription');

        if (nameEl) nameEl.value = currentUser.name || '';
        if (phoneEl) phoneEl.value = currentUser.phone || '';
        if (regionEl) regionEl.value = currentUser.profile?.region || '';
        if (jobTypeEl) jobTypeEl.value = currentUser.profile?.jobType || '';
        if (experienceEl) experienceEl.value = currentUser.profile?.experience || 0;
        if (descriptionEl) descriptionEl.value = currentUser.profile?.description || '';
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Profile Form Handler
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        try {
            currentUser.name = document.getElementById('profileName').value;
            currentUser.profile = {
                region: document.getElementById('profileRegion').value,
                jobType: document.getElementById('profileJobType').value,
                experience: document.getElementById('profileExperience').value,
                description: document.getElementById('profileDescription').value
            };

            // Update in storage
            const users = JSON.parse(localStorage.getItem('fermerx_users') || '[]');
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                localStorage.setItem('fermerx_users', JSON.stringify(users));
                localStorage.setItem('fermerx_current_user', JSON.stringify(currentUser));
            }

            alert('Profil muvaffaqiyatli saqlandi!');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Xatolik yuz berdi!');
        }
    });
}

// Job Search
function toggleFilters() {
    const filters = document.getElementById('jobFilters');
    if (filters) {
        filters.style.display = filters.style.display === 'none' ? 'block' : 'none';
    }
}

function loadAllJobs() {
    try {
        const jobs = JSON.parse(localStorage.getItem('fermerx_jobs') || '[]');
        const activeJobs = jobs.filter(j => j.status === 'active');

        const container = document.getElementById('jobsList');
        if (!container) return;

        if (activeJobs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <div class="empty-state-text">Hozircha ishlar topilmadi</div>
                </div>
            `;
            return;
        }

        container.innerHTML = activeJobs.map(job => `
            <div class="job-card">
                <div class="job-header">
                    <div>
                        <div class="job-title">${job.title}</div>
                        <span class="job-category">${job.category}</span>
                    </div>
                    <div class="job-salary">${formatCurrency(job.salary)}</div>
                </div>
                <div class="job-meta">
                    <span class="job-meta-item">📍 ${job.location}</span>
                    <span class="job-meta-item">⏱️ ${job.duration}</span>
                </div>
                <div class="job-description">${job.description}</div>
                ${job.requirements && job.requirements.length > 0 ? `
                    <div style="margin-top: 1rem;">
                        <strong>Talablar:</strong>
                        <ul style="margin-top: 0.5rem; padding-left: 1.5rem; color: var(--text-secondary);">
                            ${job.requirements.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                <div class="job-actions">
                    <button class="btn-primary" onclick="applyToJob('${job.id}')">
                        Murojaat yuborish
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading jobs:', error);
    }
}

function searchJobs() {
    try {
        const query = document.getElementById('searchQuery').value.toLowerCase();
        const category = document.getElementById('filterCategory').value;
        const salaryRange = document.getElementById('filterSalary').value;

        const jobs = JSON.parse(localStorage.getItem('fermerx_jobs') || '[]');
        let filtered = jobs.filter(j => j.status === 'active');

        if (query) {
            filtered = filtered.filter(j =>
                j.title.toLowerCase().includes(query) ||
                j.description.toLowerCase().includes(query)
            );
        }

        if (category) {
            filtered = filtered.filter(j => j.category === category);
        }

        if (salaryRange) {
            if (salaryRange === '5000000+') {
                filtered = filtered.filter(j => j.salary >= 5000000);
            } else {
                const [min, max] = salaryRange.split('-').map(Number);
                filtered = filtered.filter(j => j.salary >= min && j.salary <= max);
            }
        }

        const container = document.getElementById('jobsList');
        if (!container) return;

        container.innerHTML = filtered.map(job => `
            <div class="job-card">
                <div class="job-header">
                    <div>
                        <div class="job-title">${job.title}</div>
                        <span class="job-category">${job.category}</span>
                    </div>
                    <div class="job-salary">${formatCurrency(job.salary)}</div>
                </div>
                <div class="job-meta">
                    <span class="job-meta-item">📍 ${job.location}</span>
                    <span class="job-meta-item">⏱️ ${job.duration}</span>
                </div>
                <div class="job-description">${job.description}</div>
                <div class="job-actions">
                    <button class="btn-primary" onclick="applyToJob('${job.id}')">
                        Murojaat yuborish
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error searching jobs:', error);
    }
}

function applyToJob(jobId) {
    try {
        const applications = JSON.parse(localStorage.getItem('fermerx_applications') || '[]');

        // Check if already applied
        if (applications.find(a => a.jobId === jobId && a.workerId === currentUser.id)) {
            alert('Siz allaqachon bu ishga murojaat yuborgansiz!');
            return;
        }

        const newApplication = {
            id: Date.now().toString(),
            jobId,
            workerId: currentUser.id,
            workerName: currentUser.name,
            status: 'pending',
            appliedAt: new Date().toISOString()
        };

        applications.push(newApplication);
        localStorage.setItem('fermerx_applications', JSON.stringify(applications));

        alert('Murojaat muvaffaqiyatli yuborildi!');
        loadApplications();
    } catch (error) {
        console.error('Error applying to job:', error);
        alert('Xatolik yuz berdi!');
    }
}

// Applications
function loadApplications() {
    try {
        const applications = JSON.parse(localStorage.getItem('fermerx_applications') || '[]');
        const jobs = JSON.parse(localStorage.getItem('fermerx_jobs') || '[]');
        const userApplications = applications.filter(a => a.workerId === currentUser.id);

        const container = document.getElementById('applicationsList');
        if (!container) return;

        if (userApplications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <div class="empty-state-text">Siz hali hech qanday murojaat yubormadingiz</div>
                </div>
            `;
            return;
        }

        container.innerHTML = userApplications.map(app => {
            const job = jobs.find(j => j.id === app.jobId);
            if (!job) return '';

            return `
                <div class="application-card">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div>
                            <div style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">
                                ${job.title}
                            </div>
                            <div style="color: var(--text-muted); font-size: 0.875rem;">
                                Yuborilgan: ${formatDate(app.appliedAt)}
                            </div>
                        </div>
                        <span class="status-badge status-${app.status}">
                            ${app.status === 'pending' ? 'Kutilmoqda' :
                    app.status === 'accepted' ? 'Qabul qilindi' : 'Rad etildi'}
                        </span>
                    </div>
                    <div style="color: var(--text-secondary);">
                        📍 ${job.location} | 💰 ${formatCurrency(job.salary)}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading applications:', error);
    }
}

// Contracts
function loadContracts() {
    try {
        const contracts = JSON.parse(localStorage.getItem('fermerx_contracts') || '[]');
        const userContracts = contracts.filter(c => c.workerId === currentUser.id);

        const container = document.getElementById('contractsList');
        if (!container) return;

        if (userContracts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📄</div>
                    <div class="empty-state-text">Sizda faol shartnomalar yo'q</div>
                </div>
            `;
            return;
        }

        container.innerHTML = userContracts.map(contract => `
            <div class="contract-card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <div style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">
                            ${contract.jobTitle}
                        </div>
                        <div style="color: var(--text-muted); font-size: 0.875rem;">
                            Boshlanish: ${formatDate(contract.startDate)}
                        </div>
                    </div>
                    <span class="status-badge status-${contract.status}">
                        ${contract.status === 'active' ? 'Faol' : 'Tugallangan'}
                    </span>
                </div>
        <div style="color: var(--text-secondary); margin-bottom: 1rem;">
            💰 ${formatCurrency(contract.amount)}
        </div>
                ${contract.status === 'active' ? `
                    <button class="btn-primary" onclick="completeContract('${contract.id}')">
                        Ishni tugallangan deb belgilash
                    </button>
                ` : ''
            }
            </div >
        `).join('');
    } catch (error) {
        console.error('Error loading contracts:', error);
    }
}

function completeContract(contractId) {
    if (!confirm('Ishni tugalladingizmi? Bu amalni qaytarib bo\'lmaydi.')) return;

    try {
        const contracts = JSON.parse(localStorage.getItem('fermerx_contracts') || '[]');
        const contractIndex = contracts.findIndex(c => c.id === contractId);

        if (contractIndex !== -1) {
            contracts[contractIndex].status = 'completed';
            contracts[contractIndex].completedDate = new Date().toISOString();
            localStorage.setItem('fermerx_contracts', JSON.stringify(contracts));

            alert('Ish tugallangan deb belgilandi. Ish beruvchi tekshirishi kerak.');
            loadContracts();
        }
    } catch (error) {
        console.error('Error completing contract:', error);
        alert('Xatolik yuz berdi!');
    }
}

// Transactions
function loadTransactions() {
    try {
        const transactions = JSON.parse(localStorage.getItem('fermerx_transactions') || '[]');
        const userTransactions = transactions.filter(t => t.receiverId === currentUser.id);

        const container = document.getElementById('transactionsList');
        if (!container) return;

        if (userTransactions.length === 0) {
            container.innerHTML = `
        < div class="empty-state" >
                    <div class="empty-state-icon">💰</div>
                    <div class="empty-state-text">Hali to'lovlar yo'q</div>
                </div >
        `;
            return;
        }

        container.innerHTML = userTransactions.map(tx => `
        < div class="transaction-card" >
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">
                        To'lov #${tx.id.slice(0, 8)}
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.875rem;">
                        ${formatDate(tx.date)}
                    </div>
                </div>
                <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;">
                    +${formatCurrency(tx.amount)}
                </div>
            </div>
            </div >
        `).join('');
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// History
function loadHistory() {
    try {
        const contracts = JSON.parse(localStorage.getItem('fermerx_contracts') || '[]');
        const completedContracts = contracts.filter(c => c.workerId === currentUser.id && c.status === 'completed');

        const container = document.getElementById('historyList');
        if (!container) return;

        if (completedContracts.length === 0) {
            container.innerHTML = `
        < div class="empty-state" >
                    <div class="empty-state-icon">📚</div>
                    <div class="empty-state-text">Hali bajarilgan ishlar yo'q</div>
                </div >
        `;
            return;
        }

        container.innerHTML = completedContracts.map(contract => `
        < div class="history-card" >
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <div>
                    <div style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">
                        ${contract.jobTitle}
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.875rem;">
                        Tugallandi: ${formatDate(contract.completedDate)}
                    </div>
                </div>
                <div style="font-size: 1.25rem; font-weight: 700; color: #10b981;">
                    ${formatCurrency(contract.amount)}
                </div>
            </div>
            </div >
        `).join('');
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Helper Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function logout() {
    localStorage.removeItem('fermerx_current_user');
    window.location.href = 'index.html';
}
