// At the top of your DashboardJS.js or in a separate initialization script
document.addEventListener('DOMContentLoaded', () => {
    // Check if Hugging Face service is available
    if (typeof huggingFaceService === 'undefined') {
        console.error('Hugging Face service not initialized');
        return;
    }

    // Check if required functions exist
    if (typeof updateSubjectLines !== 'function') {
        console.error('updateSubjectLines function not defined');
    }

    if (typeof updateEmailContent !== 'function') {
        console.error('updateEmailContent function not defined');
    }
});


// Add this to handle any unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled Promise Rejection:', event.reason);
    alert('An unexpected error occurred. Please try again.');
});


// Global Firestore save function
async function saveOutreachToFirestore(outreachData) {
    try {
        // Validate required fields
        if (!outreachData || !outreachData.businessType || !outreachData.service) {
            throw new Error("Missing required outreach data");
        }

        // Ensure Firestore is initialized
        if (!db) {
            throw new Error("Firestore database not initialized");
        }

        // Save outreach document
        const outreachRef = await db.collection('outreaches').add({
            userId: 'anonymous_user',
            businessType: outreachData.businessType,
            service: outreachData.service,
            recipientName: outreachData.recipientName || 'Unknown',
            recipientLocation: outreachData.recipientLocation || 'Unknown',
            subjectLine: outreachData.subjectLine || '',
            emailContent: outreachData.emailContent || '',
            tone: outreachData.tone || 'professional',
            generatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("Outreach saved with ID: ", outreachRef.id);

        // Update platform metrics
        await updatePlatformMetrics(outreachData);

        return outreachRef.id;
    } catch (error) {
        console.error("Error saving outreach:", error);
        alert(`Failed to save outreach: ${error.message}`);
        throw error;
    }
}

// Platform metrics update function
async function updatePlatformMetrics(outreachData) {
    try {
        const metricsRef = db.collection('metrics').doc('platformStats');
        const currentDate = new Date().toISOString().split('T')[0];

        const updateData = {
            totalEmailsGenerated: firebase.firestore.FieldValue.increment(1),
            [`businessTypeBreakdown.${outreachData.businessType}`]: firebase.firestore.FieldValue.increment(1),
            [`toneDistribution.${outreachData.tone}`]: firebase.firestore.FieldValue.increment(1),
            'metadata.lastUpdated': firebase.firestore.FieldValue.serverTimestamp()
        };

        // Add to generation trends
        const trendData = {
            date: currentDate,
            businessType: outreachData.businessType,
            tone: outreachData.tone
        };

        // Perform the update
        await metricsRef.set({
            ...updateData,
            generationTrends: firebase.firestore.FieldValue.arrayUnion(trendData)
        }, { merge: true });

        console.log("Platform metrics updated successfully");
    } catch (error) {
        console.error("Error updating metrics:", error);
    }
}

// Platform metrics retrieval function
async function getPlatformMetrics() {
    try {
        const metricsDoc = await db.collection('metrics').doc('platformStats').get();
        
        if (!metricsDoc.exists) {
            console.log("No metrics document found");
            return null;
        }

        const metrics = metricsDoc.data();
        
        // Update UI elements if they exist
        const totalEmailsElement = document.querySelector('.stats-grid .stat-card:nth-child(1) h3');
        if (totalEmailsElement && metrics.totalEmailsGenerated !== undefined) {
            totalEmailsElement.textContent = metrics.totalEmailsGenerated;
        }

        return metrics;
    } catch (error) {
        console.error("Error retrieving metrics:", error);
        return null;
    }
}

// Tone-specific placeholders
const tonePlaceholders = {
    professional: "Write a professional and formal email that maintains a business-appropriate tone...",
    friendly: "Compose a warm and approachable email that builds rapport while maintaining professionalism...",
    casual: "Write a relaxed and conversational email that feels natural and engaging...",
    creative: "Craft an innovative and attention-grabbing email that showcases creativity..."
};

document.addEventListener('DOMContentLoaded', function() {
    // Common DOM elements
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const navLinks = document.querySelectorAll('.nav-link');
    const screens = document.querySelectorAll('.screen');
    const businessTypeSelect = document.getElementById('businessTypeSelect');
    const customBusinessType = document.getElementById('customBusinessType');
    const nextButton = document.getElementById('nextButton');
    const saveButton = document.getElementById('saveButton');
    const nextStepButton = document.getElementById('nextStepButton');

    // Step 4 Elements
    const toneOptions = document.querySelectorAll('.tone-option');
    const emailSections = document.querySelectorAll('.email-compose-section');
    const generateButton = document.querySelector('.generate-button');

    // Result Screen Elements
    const finalSubjectLine = document.getElementById('finalSubjectLine');
    const finalEmailContent = document.getElementById('finalEmailContent');
    const recipientSummary = document.getElementById('recipientSummary');
    const generationTime = document.getElementById('generationTime');
    const startNewButton = document.getElementById('startNewButton');
    const downloadButton = document.getElementById('downloadButton');

    // Function to switch screens with animation
    function switchScreen(screenId) {
        const currentScreen = document.querySelector('.screen.active');
        const nextScreen = document.getElementById(screenId);

        if (currentScreen && nextScreen) {
            currentScreen.style.opacity = '0';
            setTimeout(() => {
                currentScreen.classList.remove('active');
                nextScreen.classList.add('active');
                setTimeout(() => {
                    nextScreen.style.opacity = '1';
                }, 50);
            }, 300);
        }
    }

    // Progress bar animation function
    function animateProgress(startPercent, endPercent) {
        const progress = document.querySelector('.progress');
        if (progress) {
            progress.style.width = startPercent + '%';
            setTimeout(() => {
                progress.style.transition = 'width 1s ease-in-out';
                progress.style.width = endPercent + '%';
            }, 100);
        }
    }

    // Function to update result screen content
    function updateResultScreen() {
        finalSubjectLine.textContent = localStorage.getItem('selectedSubjectLine') || 'No subject line generated';
        finalEmailContent.textContent = localStorage.getItem('finalEmailContent') || 'No email content generated';

        const toneTag = document.querySelector('.tone-tag');
        toneTag.textContent = localStorage.getItem('selectedTone') || 'Professional';

        const recipientName = localStorage.getItem('recipientName') || 'Unknown';
        const recipientLocation = localStorage.getItem('recipientLocation') || 'Unknown';
        recipientSummary.textContent = `${recipientName} from ${recipientLocation}`;

        generationTime.textContent = new Date().toLocaleString();
    }

    // Menu toggle functionality
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnMenuToggle = menuToggle.contains(event.target);
        
        if (!isClickInsideSidebar && !isClickOnMenuToggle && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
    });


        // Screen switching functionality
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const screenId = this.getAttribute('href').substring(1) + '-screen';
            
            if (screenId === 'compose-outreach-screen') {
                switchScreen(screenId);
                animateProgress(0, 25);
            } else {
                switchScreen(screenId);
            }

            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });

    // Function to validate inputs
    function validateInputs() {
        const selectedValue = businessTypeSelect.value;
        const customValue = customBusinessType.value.trim();
        
        businessTypeSelect.classList.remove('error');
        customBusinessType.classList.remove('error');
        
        if (!selectedValue && !customValue) {
            businessTypeSelect.classList.add('error');
            return false;
        }
        
        if (selectedValue === 'other' && !customValue) {
            customBusinessType.classList.add('error');
            return false;
        }
        
        return true;
    }

    // Handle select change
    if (businessTypeSelect && customBusinessType) {
        businessTypeSelect.addEventListener('change', function() {
            this.classList.remove('error');
            customBusinessType.classList.remove('error');
            
            if (this.value === 'other') {
                customBusinessType.setAttribute('required', 'required');
            } else {
                customBusinessType.removeAttribute('required');
            }
        });

        customBusinessType.addEventListener('input', function() {
            this.classList.remove('error');
        });
    }

    // Handle Next button click (Step 1)
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            if (validateInputs()) {
                const businessType = businessTypeSelect.value === 'other' 
                    ? customBusinessType.value 
                    : businessTypeSelect.options[businessTypeSelect.selectedIndex].text;
                
                localStorage.setItem('selectedBusinessType', businessType);
                animateProgress(25, 50);
                switchScreen('personalization-screen');
            }
        });
    }

    // Handle Save and Continue button click (Step 2)
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const recipientName = document.getElementById('recipientName').value;
            const recipientLocation = document.getElementById('recipientLocation').value;
            const portfolioLinks = document.getElementById('portfolioLinks').value;
            const service = document.getElementById('service').value;

            if (recipientName && recipientLocation && service) {
                localStorage.setItem('recipientName', recipientName);
                localStorage.setItem('recipientLocation', recipientLocation);
                localStorage.setItem('portfolioLinks', portfolioLinks);
                localStorage.setItem('service', service);

                animateProgress(50, 75);
                switchScreen('subject-lines-screen');
            } else {
                if (!recipientName) document.getElementById('recipientName').classList.add('error');
                if (!recipientLocation) document.getElementById('recipientLocation').classList.add('error');
                if (!service) document.getElementById('service').classList.add('error');
            }
        });
    }

    // Handle Next Step button (Step 3 to Step 4)
    if (nextStepButton) {
        nextStepButton.addEventListener('click', function() {
            switchScreen('email-content-screen');
            animateProgress(75, 100);
        });
    }

    // Specific copy functionality for Step 3 (Subject Lines Screen)
    const subjectLinesCopyButtons = document.querySelectorAll('.subject-line-item .copy-button');
    subjectLinesCopyButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const subjectLine = this.closest('.subject-line-item')
                .querySelector('.subject-line-title')
                .textContent;
            
            try {
                await navigator.clipboard.writeText(subjectLine);
                localStorage.setItem('selectedSubjectLine', subjectLine);
                
                // Visual feedback
                this.style.color = '#196be6';
                const originalSVG = this.innerHTML;
                this.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                    </svg>`;
                setTimeout(() => {
                    this.style.color = '#0e141b';
                    this.innerHTML = originalSVG;
                }, 1000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        });
    });

    // Email Section Animation Function
    function switchEmailSection(newTone) {
        const currentSection = document.querySelector('.email-compose-section.active');
        const newSection = document.querySelector(`.email-compose-section[data-tone="${newTone}"]`);
        
        if (currentSection === newSection) return;

        currentSection.classList.add('slide-out');
        newSection.style.display = 'block';
        newSection.classList.add('slide-in');

        setTimeout(() => {
            currentSection.classList.remove('active', 'slide-out');
            currentSection.style.display = 'none';
            newSection.classList.remove('slide-in');
            newSection.classList.add('active');
        }, 300);

        const newTextarea = newSection.querySelector('.email-textarea');
        if (newTextarea && tonePlaceholders[newTone]) {
            newTextarea.placeholder = tonePlaceholders[newTone];
        }
    }

    // Tone selector functionality
    toneOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (this.classList.contains('active')) return;

            toneOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            const selectedTone = this.getAttribute('data-tone');
            switchEmailSection(selectedTone);
        });
    });

    // Handle Generate button
    if (generateButton) {
        generateButton.addEventListener('click', function() {
            const activeTone = document.querySelector('.tone-option.active').getAttribute('data-tone');
            const activeSection = document.querySelector('.email-compose-section.active');
            const textarea = activeSection.querySelector('.email-textarea');
            
            this.disabled = true;
            this.textContent = 'Generating...';
            
            setTimeout(() => {
                textarea.value = `Sample ${activeTone} email content...`;
                this.disabled = false;
                this.textContent = 'Generate';
            }, 1500);
        });
    }


        // Copy buttons for email sections
    const copyButtonsInEmailSections = document.querySelectorAll('.email-compose-section .copy-button-round');
    copyButtonsInEmailSections.forEach(button => {
        button.addEventListener('click', async function() {
            // Find the textarea in the current email compose section
            const activeSection = this.closest('.email-compose-section');
            const textarea = activeSection.querySelector('.email-textarea');
            
            if (textarea && textarea.value.trim()) {
                try {
                    // Copy textarea content
                    await navigator.clipboard.writeText(textarea.value);
                    
                    // Visual feedback
                    this.style.backgroundColor = '#196be6';
                    this.style.color = 'white';

                    setTimeout(() => {
                        this.style.backgroundColor = '#e7edf3';
                        this.style.color = '#0e141b';
                    }, 1000);
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    alert('Failed to copy text');
                }
            } else {
                // alert('No text to copy');
            }
        });
    });

    // Step 4 to Result Screen transition
    document.querySelector('#email-content-screen .btn-next').addEventListener('click', async function() {
        const selectedEmail = document.querySelector('.email-compose-section.active .email-textarea').value;
        const selectedTone = document.querySelector('.tone-option.active').getAttribute('data-tone');
        
        localStorage.setItem('finalEmailContent', selectedEmail);
        localStorage.setItem('selectedTone', selectedTone);

        // Prepare outreach data for Firestore
        const outreachData = {
            businessType: localStorage.getItem('selectedBusinessType'),
            service: localStorage.getItem('service'),
            recipientName: localStorage.getItem('recipientName'),
            recipientLocation: localStorage.getItem('recipientLocation'),
            subjectLine: localStorage.getItem('selectedSubjectLine'),
            emailContent: selectedEmail,
            tone: selectedTone
        };

        try {
            // Save to Firestore
            await saveOutreachToFirestore(outreachData);
            
            // Update result screen
            updateResultScreen();
            
            // Switch to result screen
            switchScreen('result-screen');
        } catch (error) {
            console.error("Failed to save outreach:", error);
            alert("Failed to save your outreach. Please try again.");
        }
    });

    // Handle Back buttons
    document.querySelectorAll('.btn-back').forEach(button => {
        button.addEventListener('click', function() {
            const currentScreen = this.closest('.screen');
            
            switch(currentScreen.id) {
                case 'personalization-screen':
                    animateProgress(50, 25);
                    switchScreen('compose-outreach-screen');
                    break;
                case 'subject-lines-screen':
                    animateProgress(75, 50);
                    switchScreen('personalization-screen');
                    break;
                case 'email-content-screen':
                    animateProgress(100, 75);
                    switchScreen('subject-lines-screen');
                    break;
                case 'result-screen':
                    animateProgress(100, 75);
                    switchScreen('email-content-screen');
                    break;
            }
        });
    });

    // Result Screen Copy Buttons
    document.querySelectorAll('#result-screen .copy-button-round').forEach(button => {
        button.addEventListener('click', async function() {
            const copyType = this.getAttribute('data-copy');
            const textToCopy = copyType === 'subject' ? finalSubjectLine.textContent : finalEmailContent.textContent;

            try {
                await navigator.clipboard.writeText(textToCopy);
                this.classList.add('copy-success');
                this.style.backgroundColor = '#196be6';
                this.style.color = 'white';

                setTimeout(() => {
                    this.classList.remove('copy-success');
                    this.style.backgroundColor = '#e7edf3';
                    this.style.color = '#0e141b';
                }, 1000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        });
    });

    // Start New button functionality
    if (startNewButton) {
        startNewButton.addEventListener('click', function() {
            localStorage.clear();
            document.querySelectorAll('form').forEach(form => form.reset());
            document.querySelectorAll('textarea').forEach(textarea => textarea.value = '');
            animateProgress(100, 0);
            switchScreen('compose-outreach-screen');
        });
    }

    // Download functionality
    if (downloadButton) {
        downloadButton.addEventListener('click', function() {
            const content = `
Subject Line:
${finalSubjectLine.textContent}

Email Content (${document.querySelector('.tone-tag').textContent}):
${finalEmailContent.textContent}

Generated on: ${new Date().toLocaleString()}
Recipient: ${recipientSummary.textContent}
            `;

            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'outreach-content.txt';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    }

    // Initialize
    function initialize() {
        initializeEmailSections();
        
        const dashboardLink = document.querySelector('[data-screen="dashboard"]');
        if (dashboardLink) {
            dashboardLink.classList.add('active');
        }

        const progress = document.querySelector('.progress');
        if (progress) {
            progress.style.width = '0%';
        }
    }

    // Initialize email sections
    function initializeEmailSections() {
        emailSections.forEach(section => {
            const tone = section.getAttribute('data-tone');
            const textarea = section.querySelector('.email-textarea');
            if (textarea && tonePlaceholders[tone]) {
                textarea.placeholder = tonePlaceholders[tone];
            }
        });
    }

    // Call initialization
    initialize();
});



// Optional: Load platform metrics when dashboard is active
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dashboard-screen')) {
        if (typeof getPlatformMetrics === 'function') {
            getPlatformMetrics();
        }
    }
});


// Add these functions to your existing DashboardJS.js

// Function to update subject lines in the UI
function updateSubjectLines(generatedLines) {
    const subjectLinesList = document.querySelector('.subject-lines-list');
    
    // Clear existing subject lines
    subjectLinesList.innerHTML = '';

    // If generatedLines is a string, split it into an array
    const lines = typeof generatedLines === 'string' 
        ? generatedLines.split('\n').filter(line => line.trim() !== '')
        : generatedLines;

    // Create subject line items
    lines.slice(0, 3).forEach((line, index) => {
        const subjectLineItem = document.createElement('div');
        subjectLineItem.classList.add('subject-line-item');
        
        subjectLineItem.innerHTML = `
            <div class="subject-line-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M80,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H88A8,8,0,0,1,80,64Zm136,56H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm0,64H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16ZM44,52A12,12,0,1,0,56,64,12,12,0,0,0,44,52Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,116Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,180Z"></path>
                </svg>
            </div>
            <div class="subject-line-content">
                <p class="subject-line-title">${line.trim()}</p>
                <p class="subject-line-subtitle">Subject Line ${String.fromCharCode(65 + index)}</p>
            </div>
            <button class="copy-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path>
                </svg>
            </button>
        `;

        // Add copy functionality to each subject line
        const copyButton = subjectLineItem.querySelector('.copy-button');
        copyButton.addEventListener('click', async () => {
            const subjectLine = subjectLineItem.querySelector('.subject-line-title').textContent;
            try {
                await navigator.clipboard.writeText(subjectLine);
                localStorage.setItem('selectedSubjectLine', subjectLine);
                
                // Visual feedback
                copyButton.style.color = '#196be6';
                const originalSVG = copyButton.innerHTML;
                copyButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                    </svg>`;
                
                setTimeout(() => {
                    copyButton.style.color = '#0e141b';
                    copyButton.innerHTML = originalSVG;
                }, 1000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        });

        subjectLinesList.appendChild(subjectLineItem);
    });
}

// Function to update email content in the UI
function updateEmailContent(generatedContent) {
    const tones = ['professional', 'friendly', 'casual', 'creative'];
    
    tones.forEach(tone => {
        const textarea = document.querySelector(`.email-compose-section[data-tone="${tone}"] .email-textarea`);
        if (textarea) {
            textarea.value = generatedContent;
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const subjectLineGenerateButton = document.querySelector('.generate-button[data-type="subject-line"]');
    const emailContentGenerateButton = document.querySelector('.generate-button[data-type="email"]');

    if (subjectLineGenerateButton) {
        subjectLineGenerateButton.addEventListener('click', async function() {
            const context = {
                businessType: localStorage.getItem('selectedBusinessType') || 'Business',
                service: localStorage.getItem('service') || 'Services',
                tone: 'professional'
            };

            this.disabled = true;
            this.textContent = 'Generating...';

            try {
                const subjectLines = await huggingFaceService.generateSubjectLine(context);
                
                if (subjectLines && subjectLines.trim()) {
                    // Split and clean subject lines
                    const cleanedLines = subjectLines.split('\n')
                        .map(line => line.trim())
                        .filter(line => line !== '');
                    
                    updateSubjectLines(cleanedLines);
                } else {
                    const fallbackLines = huggingFaceService.fallbackGeneration(context, 'subjectLine');
                    updateSubjectLines(fallbackLines);
                }
            } catch (error) {
                console.error('Subject Line Generation Failed', error);
                alert('Failed to generate subject lines. Please try again.');
            } finally {
                this.disabled = false;
                this.textContent = 'Generate Subject Line';
            }
        });
    }

    if (emailContentGenerateButton) {
        emailContentGenerateButton.addEventListener('click', async function() {
            const context = {
                businessType: localStorage.getItem('selectedBusinessType') || 'Business',
                service: localStorage.getItem('service') || 'Services',
                recipientName: localStorage.getItem('recipientName') || 'Potential Client',
                portfolioLinks: localStorage.getItem('portfolioLinks') || 'Not provided',
                tone: document.querySelector('.tone-option.active')?.getAttribute('data-tone') || 'professional'
            };

            this.disabled = true;
            this.textContent = 'Generating...';

            try {
                const emailContent = await huggingFaceService.generateEmailContent(context);
                
                if (emailContent && emailContent.trim()) {
                    updateEmailContent(emailContent);
                } else {
                    const fallbackContent = huggingFaceService.fallbackGeneration(context, 'emailContent');
                    updateEmailContent(fallbackContent);
                }
            } catch (error) {
                console.error('Email Content Generation Failed', error);
                alert('Failed to generate email content. Please try again.');
            } finally {
                this.disabled = false;
                this.textContent = 'Generate';
            }
        });
    }
});