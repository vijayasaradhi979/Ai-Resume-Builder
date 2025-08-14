let currentUser = null;
let currentTemplate = null;
let resumeData = {};
let verificationEmail = '';
let verificationCode = '';

// Template data from provided JSON (including 2 additional templates to meet 8+ requirement)
const templates = [
    {
        id: 1,
        name: "Modern Professional",
        category: "Professional",
        description: "Clean and modern design perfect for corporate roles",
        color: "#00d4ff",
        preview: "modern-professional-preview.jpg",
        popularityRating: 4.8,
        downloads: 15420,
        className: "resume-modern"
    },
    {
        id: 2,
        name: "Creative Designer",
        category: "Creative",
        description: "Bold and artistic template for creative professionals",
        color: "#7c3aed",
        preview: "creative-designer-preview.jpg",
        popularityRating: 4.7,
        downloads: 12330,
        className: "resume-creative"
    },
    {
        id: 3,
        name: "Corporate Executive",
        category: "Executive",
        description: "Sophisticated template for senior-level positions",
        color: "#6b7280",
        preview: "corporate-executive-preview.jpg",
        popularityRating: 4.9,
        downloads: 18750,
        className: "resume-corporate"
    },
    {
        id: 4,
        name: "Tech Specialist",
        category: "Technology",
        description: "Modern template optimized for tech professionals",
        color: "#06d6a0",
        preview: "tech-specialist-preview.jpg",
        popularityRating: 4.6,
        downloads: 9870,
        className: "resume-tech"
    },
    {
        id: 5,
        name: "Minimalist",
        category: "Simple",
        description: "Clean and simple design that lets content shine",
        color: "#64748b",
        preview: "minimalist-preview.jpg",
        popularityRating: 4.5,
        downloads: 11200,
        className: "resume-minimal"
    },
    {
        id: 6,
        name: "Academic Researcher",
        category: "Academic",
        description: "Formal layout perfect for academic and research positions",
        color: "#0891b2",
        preview: "academic-preview.jpg",
        popularityRating: 4.4,
        downloads: 6540,
        className: "resume-academic"
    },
    {
        id: 7,
        name: "Startup Founder",
        category: "Entrepreneurial",
        description: "Dynamic template for entrepreneurs and startup founders",
        color: "#f59e0b",
        preview: "startup-founder-preview.jpg",
        popularityRating: 4.7,
        downloads: 8930,
        className: "resume-startup"
    },
    {
        id: 8,
        name: "Healthcare Professional",
        category: "Healthcare",
        description: "Professional template for medical and healthcare careers",
        color: "#3b82f6",
        preview: "healthcare-preview.jpg",
        popularityRating: 4.6,
        downloads: 7650,
        className: "resume-healthcare"
    },
    {
        id: 9,
        name: "Sales Executive",
        category: "Sales",
        description: "Results-driven template for sales professionals",
        color: "#ef4444",
        preview: "sales-executive-preview.jpg",
        popularityRating: 4.5,
        downloads: 5430,
        className: "resume-sales"
    },
    {
        id: 10,
        name: "Marketing Specialist",
        category: "Marketing",
        description: "Creative template for marketing and brand professionals",
        color: "#ec4899",
        preview: "marketing-specialist-preview.jpg",
        popularityRating: 4.6,
        downloads: 7890,
        className: "resume-marketing"
    }
];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    loadTemplates();
    checkUserSession();
    setupFormListeners();
    
    // Show landing page by default
    showSection('landing');
});

// Session management
function checkUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
}

function updateUIForLoggedInUser() {
    const navLinks = document.querySelector('.nav-links');
    const userMenu = document.querySelector('.user-menu');
    const userName = document.querySelector('.user-name');
    
    navLinks.classList.add('hidden');
    userMenu.classList.remove('hidden');
    userName.textContent = currentUser.name;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    const navLinks = document.querySelector('.nav-links');
    const userMenu = document.querySelector('.user-menu');
    
    navLinks.classList.remove('hidden');
    userMenu.classList.add('hidden');
    
    showSection('landing');
}

// Template management
function loadTemplates() {
    const templatesGrid = document.getElementById('templatesGrid');
    
    templates.forEach(template => {
        const templateCard = document.createElement('div');
        templateCard.className = 'template-card';
        templateCard.style.setProperty('--template-color', template.color);
        templateCard.onclick = () => showTemplatePreview(template.id);
        
        templateCard.innerHTML = `
            <div class="template-preview">
                ${template.name} Preview<br>
                <small style="opacity: 0.7;">Click to view full preview</small>
            </div>
            <div class="template-info">
                <div class="template-category">${template.category}</div>
                <h3>${template.name}</h3>
                <p>${template.description}</p>
                <div class="template-stats">
                    <span class="template-rating">★ ${template.popularityRating}</span>
                    <span class="template-downloads">${template.downloads.toLocaleString()} downloads</span>
                </div>
                <button class="btn btn--primary" onclick="event.stopPropagation(); selectTemplateDirectly(${template.id})">
                    Use Template
                </button>
            </div>
        `;
        
        templatesGrid.appendChild(templateCard);
    });
}

function showTemplatePreview(templateId) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    document.getElementById('templateName').textContent = template.name;
    document.getElementById('templateDescription').textContent = template.description;
    document.getElementById('templateRating').textContent = template.popularityRating;
    document.getElementById('templateDownloads').textContent = template.downloads.toLocaleString();
    document.getElementById('templatePreviewImage').innerHTML = `
        <div style="color: ${template.color}; font-size: 16px; text-align: center;">
            <strong>${template.name}</strong><br>
            <small style="opacity: 0.8;">Full preview available after selection</small>
        </div>
    `;
    
    currentTemplate = template;
    showModal('templateModal');
}

function selectTemplate() {
    if (!currentUser) {
        closeModal();
        showAuthModal('login');
        return;
    }
    
    if (currentTemplate) {
        closeModal();
        showSection('builder');
        initializeResumeBuilder();
    }
}

function selectTemplateDirectly(templateId) {
    if (!currentUser) {
        showAuthModal('login');
        return;
    }
    
    currentTemplate = templates.find(t => t.id === templateId);
    if (currentTemplate) {
        showSection('builder');
        initializeResumeBuilder();
    }
}

function changeTemplate() {
    showSection('templates');
}

// Authentication
function showAuthModal(type) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const verificationForm = document.getElementById('verificationForm');
    
    // Hide all forms
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    verificationForm.classList.add('hidden');
    
    // Show requested form
    if (type === 'login') {
        loginForm.classList.remove('hidden');
    } else if (type === 'signup') {
        signupForm.classList.remove('hidden');
    } else if (type === 'verification') {
        verificationForm.classList.remove('hidden');
    }
    
    showModal('authModal');
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simulate login validation
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const user = savedUsers.find(u => u.email === email && u.password === password && u.isVerified);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateUIForLoggedInUser();
        closeModal();
        showMessage('Login successful!', 'success');
    } else {
        showMessage('Invalid credentials or email not verified', 'error');
    }
}

function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    // Validate password strength
    if (!validatePassword(password)) {
        showMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character', 'error');
        return;
    }
    
    // Check if user already exists
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (savedUsers.find(u => u.email === email)) {
        showMessage('User with this email already exists', 'error');
        return;
    }
    
    // Generate and "send" verification code
    verificationCode = generateVerificationCode();
    verificationEmail = email;
    
    // Simulate email sending with visible notification
    console.log(`Verification code for ${email}: ${verificationCode}`);
    
    // Save user data (unverified)
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        isVerified: false,
        verificationCode,
        createdAt: new Date().toISOString()
    };
    
    savedUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(savedUsers));
    
    showMessage(`Verification code sent to ${email}: ${verificationCode}`, 'info');
    showAuthModal('verification');
}

function handleVerification(event) {
    event.preventDefault();
    
    const enteredCode = document.getElementById('verificationCode').value;
    
    if (enteredCode === verificationCode) {
        // Mark user as verified
        const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = savedUsers.findIndex(u => u.email === verificationEmail);
        
        if (userIndex !== -1) {
            savedUsers[userIndex].isVerified = true;
            localStorage.setItem('users', JSON.stringify(savedUsers));
            
            currentUser = savedUsers[userIndex];
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUIForLoggedInUser();
            closeModal();
            showMessage('Email verified successfully!', 'success');
        }
    } else {
        showMessage('Invalid verification code', 'error');
    }
}

function resendCode() {
    verificationCode = generateVerificationCode();
    console.log(`New verification code for ${verificationEmail}: ${verificationCode}`);
    showMessage(`New verification code sent: ${verificationCode}`, 'info');
}

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function validatePassword(password) {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return password.length >= 8 && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
}

// Resume Builder
function initializeResumeBuilder() {
    setupFormListeners();
    updateResumePreview();
}

function setupFormListeners() {
    const formInputs = document.querySelectorAll('#builder input, #builder textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', updateResumePreview);
    });
}

function updateResumePreview() {
    const resumePreview = document.getElementById('resumePreview');
    if (!resumePreview || !currentTemplate) return;
    
    // Collect form data
    const formData = {
        fullName: document.getElementById('fullName')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        address: document.getElementById('address')?.value || '',
        summary: document.getElementById('summary')?.value || '',
        skills: document.getElementById('skills')?.value || ''
    };
    
    // Collect experience data
    const experienceItems = document.querySelectorAll('.experience-item');
    const experience = Array.from(experienceItems).map(item => ({
        title: item.querySelector('input[placeholder="Software Engineer"]')?.value || '',
        company: item.querySelector('input[placeholder="Tech Company Inc."]')?.value || '',
        duration: item.querySelector('input[placeholder="Jan 2020 - Present"]')?.value || '',
        description: item.querySelector('textarea')?.value || ''
    }));
    
    // Collect education data
    const educationItems = document.querySelectorAll('.education-item');
    const education = Array.from(educationItems).map(item => ({
        degree: item.querySelector('input[placeholder="Bachelor of Science"]')?.value || '',
        institution: item.querySelector('input[placeholder="University Name"]')?.value || '',
        year: item.querySelector('input[placeholder="2016-2020"]')?.value || ''
    }));
    
    resumeData = { ...formData, experience, education };
    
    // Generate resume HTML
    const resumeHTML = generateResumeHTML(resumeData);
    resumePreview.innerHTML = resumeHTML;
    resumePreview.className = `resume-container ${currentTemplate.className}`;
}

function generateResumeHTML(data) {
    const skillsArray = data.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    return `
        <div class="resume-header">
            <div class="resume-name">${data.fullName || 'Your Name'}</div>
            <div class="resume-contact">
                ${data.email || 'email@example.com'} • ${data.phone || '(555) 123-4567'} • ${data.address || 'City, State'}
            </div>
        </div>
        
        ${data.summary ? `
            <div class="resume-section">
                <div class="resume-section-title">Professional Summary</div>
                <div class="resume-summary">${data.summary}</div>
            </div>
        ` : ''}
        
        ${data.experience && data.experience.length > 0 && data.experience.some(exp => exp.title || exp.company) ? `
            <div class="resume-section">
                <div class="resume-section-title">Experience</div>
                ${data.experience.map(exp => exp.title || exp.company ? `
                    <div class="resume-item">
                        <div class="resume-item-title">${exp.title || 'Job Title'}</div>
                        <div class="resume-item-subtitle">${exp.company || 'Company Name'}</div>
                        <div class="resume-item-duration">${exp.duration || 'Duration'}</div>
                        ${exp.description ? `<div class="resume-item-description">${exp.description}</div>` : ''}
                    </div>
                ` : '').join('')}
            </div>
        ` : ''}
        
        ${data.education && data.education.length > 0 && data.education.some(edu => edu.degree || edu.institution) ? `
            <div class="resume-section">
                <div class="resume-section-title">Education</div>
                ${data.education.map(edu => edu.degree || edu.institution ? `
                    <div class="resume-item">
                        <div class="resume-item-title">${edu.degree || 'Degree'}</div>
                        <div class="resume-item-subtitle">${edu.institution || 'Institution'}</div>
                        <div class="resume-item-duration">${edu.year || 'Year'}</div>
                    </div>
                ` : '').join('')}
            </div>
        ` : ''}
        
        ${skillsArray.length > 0 ? `
            <div class="resume-section">
                <div class="resume-section-title">Skills</div>
                <div class="resume-skills">
                    ${skillsArray.map(skill => `<span class="resume-skill">${skill}</span>`).join('')}
                </div>
            </div>
        ` : ''}
    `;
}

function addExperience() {
    const container = document.getElementById('experienceContainer');
    const experienceItem = document.createElement('div');
    experienceItem.className = 'experience-item';
    experienceItem.innerHTML = `
        <div class="form-group">
            <label class="form-label">Job Title</label>
            <input type="text" class="form-control" placeholder="Software Engineer">
        </div>
        <div class="form-group">
            <label class="form-label">Company</label>
            <input type="text" class="form-control" placeholder="Tech Company Inc.">
        </div>
        <div class="form-group">
            <label class="form-label">Duration</label>
            <input type="text" class="form-control" placeholder="Jan 2020 - Present">
        </div>
        <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-control" rows="3" placeholder="Describe your responsibilities and achievements..."></textarea>
        </div>
        <button type="button" class="btn btn--outline" style="background: rgba(255, 84, 89, 0.2); color: #ff5459; border-color: #ff5459;" onclick="removeExperience(this)">Remove</button>
    `;
    
    container.appendChild(experienceItem);
    setupFormListeners();
}

function addEducation() {
    const container = document.getElementById('educationContainer');
    const educationItem = document.createElement('div');
    educationItem.className = 'education-item';
    educationItem.innerHTML = `
        <div class="form-group">
            <label class="form-label">Degree</label>
            <input type="text" class="form-control" placeholder="Bachelor of Science">
        </div>
        <div class="form-group">
            <label class="form-label">Institution</label>
            <input type="text" class="form-control" placeholder="University Name">
        </div>
        <div class="form-group">
            <label class="form-label">Year</label>
            <input type="text" class="form-control" placeholder="2016-2020">
        </div>
        <button type="button" class="btn btn--outline" style="background: rgba(255, 84, 89, 0.2); color: #ff5459; border-color: #ff5459;" onclick="removeEducation(this)">Remove</button>
    `;
    
    container.appendChild(educationItem);
    setupFormListeners();
}

function removeExperience(button) {
    button.parentElement.remove();
    updateResumePreview();
}

function removeEducation(button) {
    button.parentElement.remove();
    updateResumePreview();
}

// Download functionality
async function downloadResume(format) {
    if (!resumeData.fullName) {
        showMessage('Please fill in at least your name to download the resume', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        if (format === 'pdf') {
            await downloadAsPDF();
        } else if (format === 'docx') {
            downloadAsDOCX();
        }
        showMessage(`Resume downloaded as ${format.toUpperCase()}! Check your downloads folder.`, 'success');
    } catch (error) {
        console.error('Download error:', error);
        showMessage('Error downloading resume. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function downloadAsPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // Add content to PDF
    const fileName = resumeData.fullName || 'resume';
    
    pdf.setFontSize(20);
    pdf.text(resumeData.fullName || 'Your Name', 20, 30);
    
    pdf.setFontSize(12);
    let yPosition = 50;
    
    // Contact info
    pdf.text(`${resumeData.email || 'email@example.com'} • ${resumeData.phone || '(555) 123-4567'}`, 20, yPosition);
    yPosition += 10;
    pdf.text(resumeData.address || 'City, State', 20, yPosition);
    yPosition += 20;
    
    // Summary
    if (resumeData.summary) {
        pdf.setFontSize(14);
        pdf.text('Professional Summary', 20, yPosition);
        yPosition += 10;
        pdf.setFontSize(12);
        const summaryLines = pdf.splitTextToSize(resumeData.summary, 170);
        pdf.text(summaryLines, 20, yPosition);
        yPosition += summaryLines.length * 7 + 10;
    }
    
    // Experience
    if (resumeData.experience && resumeData.experience.length > 0) {
        pdf.setFontSize(14);
        pdf.text('Experience', 20, yPosition);
        yPosition += 10;
        
        resumeData.experience.forEach(exp => {
            if (exp.title || exp.company) {
                if (yPosition > 250) {
                    pdf.addPage();
                    yPosition = 30;
                }
                pdf.setFontSize(12);
                pdf.setFont(undefined, 'bold');
                pdf.text(exp.title || 'Job Title', 20, yPosition);
                yPosition += 7;
                pdf.setFont(undefined, 'normal');
                pdf.text(`${exp.company || 'Company'} • ${exp.duration || 'Duration'}`, 20, yPosition);
                yPosition += 7;
                if (exp.description) {
                    const descLines = pdf.splitTextToSize(exp.description, 170);
                    pdf.text(descLines, 20, yPosition);
                    yPosition += descLines.length * 7;
                }
                yPosition += 5;
            }
        });
        yPosition += 10;
    }
    
    // Education
    if (resumeData.education && resumeData.education.length > 0) {
        if (yPosition > 220) {
            pdf.addPage();
            yPosition = 30;
        }
        pdf.setFontSize(14);
        pdf.text('Education', 20, yPosition);
        yPosition += 10;
        
        resumeData.education.forEach(edu => {
            if (edu.degree || edu.institution) {
                pdf.setFontSize(12);
                pdf.setFont(undefined, 'bold');
                pdf.text(edu.degree || 'Degree', 20, yPosition);
                yPosition += 7;
                pdf.setFont(undefined, 'normal');
                pdf.text(`${edu.institution || 'Institution'} • ${edu.year || 'Year'}`, 20, yPosition);
                yPosition += 12;
            }
        });
        yPosition += 10;
    }
    
    // Skills
    if (resumeData.skills) {
        const skillsArray = resumeData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
        if (skillsArray.length > 0) {
            if (yPosition > 240) {
                pdf.addPage();
                yPosition = 30;
            }
            pdf.setFontSize(14);
            pdf.text('Skills', 20, yPosition);
            yPosition += 10;
            pdf.setFontSize(12);
            const skillsText = skillsArray.join(', ');
            const skillsLines = pdf.splitTextToSize(skillsText, 170);
            pdf.text(skillsLines, 20, yPosition);
        }
    }
    
    pdf.save(`${fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume.pdf`);
}

function downloadAsDOCX() {
    // Generate comprehensive DOCX content as HTML
    const fileName = (resumeData.fullName || 'resume').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    const docContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${resumeData.fullName || 'Resume'}</title>
            <style>
                body { 
                    font-family: 'Arial', sans-serif; 
                    line-height: 1.6; 
                    max-width: 8.5in;
                    margin: 0 auto;
                    padding: 1in;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-bottom: 2px solid #333;
                    padding-bottom: 20px;
                }
                .name { 
                    font-size: 28px; 
                    font-weight: bold; 
                    color: #333;
                    margin-bottom: 10px;
                }
                .contact { 
                    color: #666; 
                    font-size: 14px;
                }
                .section { 
                    margin-bottom: 25px; 
                }
                .section-title { 
                    font-size: 18px; 
                    font-weight: bold; 
                    color: #333;
                    border-bottom: 1px solid #ccc; 
                    padding-bottom: 5px; 
                    margin-bottom: 15px; 
                }
                .item { 
                    margin-bottom: 15px; 
                }
                .item-title { 
                    font-weight: bold; 
                    color: #333;
                    font-size: 16px;
                }
                .item-subtitle { 
                    color: #666; 
                    font-style: italic; 
                    margin-bottom: 5px;
                }
                .item-description {
                    color: #444;
                    margin-top: 5px;
                    line-height: 1.5;
                }
                .skills-list {
                    color: #444;
                    line-height: 1.8;
                }
                .summary {
                    color: #444;
                    line-height: 1.6;
                    margin-bottom: 20px;
                    text-align: justify;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="name">${resumeData.fullName || 'Your Name'}</div>
                <div class="contact">
                    ${resumeData.email || 'email@example.com'} • 
                    ${resumeData.phone || '(555) 123-4567'} • 
                    ${resumeData.address || 'City, State'}
                </div>
            </div>
            
            ${resumeData.summary ? `
                <div class="section">
                    <div class="section-title">PROFESSIONAL SUMMARY</div>
                    <div class="summary">${resumeData.summary}</div>
                </div>
            ` : ''}
            
            ${resumeData.experience && resumeData.experience.length > 0 && resumeData.experience.some(exp => exp.title || exp.company) ? `
                <div class="section">
                    <div class="section-title">PROFESSIONAL EXPERIENCE</div>
                    ${resumeData.experience.map(exp => exp.title || exp.company ? `
                        <div class="item">
                            <div class="item-title">${exp.title || 'Job Title'}</div>
                            <div class="item-subtitle">${exp.company || 'Company Name'} • ${exp.duration || 'Duration'}</div>
                            ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
                        </div>
                    ` : '').join('')}
                </div>
            ` : ''}
            
            ${resumeData.education && resumeData.education.length > 0 && resumeData.education.some(edu => edu.degree || edu.institution) ? `
                <div class="section">
                    <div class="section-title">EDUCATION</div>
                    ${resumeData.education.map(edu => edu.degree || edu.institution ? `
                        <div class="item">
                            <div class="item-title">${edu.degree || 'Degree'}</div>
                            <div class="item-subtitle">${edu.institution || 'Institution'} • ${edu.year || 'Year'}</div>
                        </div>
                    ` : '').join('')}
                </div>
            ` : ''}
            
            ${resumeData.skills ? `
                <div class="section">
                    <div class="section-title">SKILLS</div>
                    <div class="skills-list">${resumeData.skills.split(',').map(skill => skill.trim()).filter(skill => skill).join(' • ')}</div>
                </div>
            ` : ''}
            
            <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
                Generated by AI Resume Builder
            </div>
        </body>
        </html>
    `;
    
    // Create and download the file
    const blob = new Blob([docContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_resume.doc`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// UI Management
function showSection(sectionName) {
    const sections = ['landing', 'templates', 'builder'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.classList.add('hidden');
        }
    });
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
}

function showTemplates() {
    showSection('templates');
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.add('hidden');
    });
    document.body.style.overflow = 'auto';
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

function showMessage(message, type = 'info') {
    // Create temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    `;
    
    const colors = {
        success: '#06d6a0',
        error: '#ff5459',
        warning: '#f59e0b',
        info: '#00d4ff'
    };
    
    messageDiv.style.background = colors[type] || colors.info;
    messageDiv.textContent = message;
    
    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        }, 300);
    }, 4000);
}

// Event listeners for modal closes
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// AI suggestions (simulated)
function generateAISuggestions() {
    const suggestions = [
        "Managed a team of 5+ developers to deliver projects 20% ahead of schedule",
        "Implemented automated testing procedures that reduced bugs by 40%",
        "Collaborated with cross-functional teams to improve user experience",
        "Optimized database queries resulting in 30% faster application performance",
        "Led the migration to cloud infrastructure, reducing costs by 25%",
        "Developed and maintained scalable web applications serving 100k+ users",
        "Increased customer satisfaction by 35% through improved product features",
        "Reduced system downtime by 60% through proactive monitoring solutions"
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)];
}

// Initialize AI suggestions for experience descriptions
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('form-control') && e.target.tagName === 'TEXTAREA') {
        if (!e.target.value && e.target.placeholder.includes('responsibilities')) {
            setTimeout(() => {
                if (!e.target.value) {
                    e.target.placeholder = generateAISuggestions();
                }
            }, 1000);
        }
    }
});

// Auto-save functionality (simulated)
setInterval(() => {
    if (currentUser && resumeData.fullName) {
        localStorage.setItem(`resume_draft_${currentUser.id}`, JSON.stringify(resumeData));
    }
}, 30000); // Auto-save every 30 seconds