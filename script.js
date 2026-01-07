// Core Variables
const smartActionBtn = document.getElementById('smartActionBtn');
const printBtn = document.getElementById('printBtn');
const navItems = document.querySelectorAll('.nav-item');
const mobileTooltip = document.getElementById('mobileTooltip');
const tooltipText = mobileTooltip.querySelector('.tooltip-text');

// Sections for navigation
const sections = {
    'about': document.getElementById('about'),
    'experience': document.getElementById('experience'),
    'skills': document.getElementById('skills'),
    'keypoints': document.getElementById('keypoints'),
    'focus': document.getElementById('focus')
};

// Mobile Intro System
const whatsappBtn = document.querySelector('.whatsapp-item');
const bottomNav = document.getElementById('bottomNav');
let isIntroActive = false;
let currentStep = 0;
let autoAdvanceTimer = null;

// Simple intro steps (only 2 steps)
const mobileIntroSteps = [
    {
        element: whatsappBtn,
        message: 'Tap here to text via WhatsApp',
        highlightClass: 'intro-highlight'
    },
    {
        element: bottomNav,
        message: 'Use these icons for quick overview',
        highlightClass: 'intro-highlight'
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core functionality
    initTheme();
    initNavigation();
    initTabs();
    initHoverEffects();
    updateSmartButton();
    
    // Name fade-in animation
    const nameElement = document.querySelector('.profile-title h1');
    nameElement.style.opacity = '0';
    
    setTimeout(() => {
        nameElement.style.transition = 'opacity 0.8s ease';
        nameElement.style.opacity = '1';
    }, 300);
    
    // Show mobile intro if first visit on mobile
    if (isMobileDevice() && !localStorage.getItem('hasSeenMobileIntro')) {
        setTimeout(() => {
            startMobileIntro();
        }, 800); // Short delay
    }
    
    // Setup tap anywhere to advance
    setupTapAdvance();
});

// Mobile detection
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        updateThemeIcon();
    }
    
    smartActionBtn.addEventListener('click', handleSmartButtonClick);
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}

function updateThemeIcon() {
    const btnIcon = smartActionBtn.querySelector('i');
    if (document.body.classList.contains('dark-theme')) {
        btnIcon.className = 'fas fa-sun';
        smartActionBtn.title = 'Light Mode';
    } else {
        btnIcon.className = 'fas fa-moon';
        smartActionBtn.title = 'Dark Mode';
    }
}

// Smart Button Behavior
function handleSmartButtonClick() {
    if (smartActionBtn.classList.contains('back-to-top')) {
        // Scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else {
        // Toggle theme
        toggleTheme();
    }
}

function updateSmartButton() {
    const scrollY = window.scrollY;
    const btnIcon = smartActionBtn.querySelector('i');
    
    if (scrollY > 300) {
        smartActionBtn.classList.add('back-to-top');
        smartActionBtn.classList.remove('theme-mode');
        smartActionBtn.classList.add('visible');
        smartActionBtn.title = 'Back to Top';
        btnIcon.className = 'fas fa-arrow-up';
    } else {
        smartActionBtn.classList.remove('back-to-top');
        smartActionBtn.classList.add('theme-mode');
        smartActionBtn.classList.remove('visible');
        updateThemeIcon();
    }
}

// Navigation
function initNavigation() {
    // Handle nav item clicks
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('href').substring(1);
            
            // Update active state
            navItems.forEach(navItem => navItem.classList.remove('active'));
            item.classList.add('active');
            
            // Scroll to section
            scrollToSection(target);
            
            // For skills section, show technical tab by default
            if (target === 'skills') {
                setTimeout(() => {
                    const techTab = document.querySelector('.tab[data-tab="technical"]');
                    if (techTab) techTab.click();
                }, 300);
            }
        });
    });
    
    // Update active nav on scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(() => {
            updateActiveNavItem();
            updateSmartButton();
        }, 50);
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const offset = 20;
    const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - offset;
    
    window.scrollTo({
        top: sectionTop,
        behavior: 'smooth'
    });
}

function updateActiveNavItem() {
    const scrollPosition = window.scrollY + 100;
    
    let currentSection = '';
    
    // Find which section is currently in view
    for (const [key, section] of Object.entries(sections)) {
        if (!section) continue;
        
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && 
            scrollPosition < sectionTop + sectionHeight) {
            currentSection = key;
            break;
        }
    }
    
    // Update active state
    navItems.forEach(item => {
        const target = item.getAttribute('href').substring(1);
        if (target === currentSection) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Skills Tabs
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Print Functionality
printBtn.addEventListener('click', () => {
    window.print();
});

// Mobile Intro System (Simplified)
function setupTapAdvance() {
    // Tap anywhere to advance to next step
    document.addEventListener('click', (e) => {
        if (isIntroActive) {
            // Don't advance if clicking on the highlighted element itself
            if (!mobileIntroSteps[currentStep]?.element?.contains(e.target)) {
                currentStep++;
                showMobileStep(currentStep);
            }
        }
    });
    
    // Also allow tapping on highlighted element to advance
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            if (isIntroActive && currentStep === 0) {
                currentStep++;
                showMobileStep(currentStep);
            }
        }, { once: false });
    }
}

function startMobileIntro() {
    if (isIntroActive || !isMobileDevice()) return;
    
    isIntroActive = true;
    currentStep = 0;
    mobileTooltip.style.display = 'block';
    
    // Show first step
    showMobileStep(currentStep);
}

function showMobileStep(stepIndex) {
    // Clear any existing timers
    if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
    }
    
    // Remove all highlights first
    mobileIntroSteps.forEach(step => {
        if (step.element) {
            step.element.classList.remove(step.highlightClass);
        }
    });
    
    // Check if we've completed the intro
    if (stepIndex >= mobileIntroSteps.length) {
        endMobileIntro();
        return;
    }
    
    const step = mobileIntroSteps[stepIndex];
    
    if (!step.element) {
        // Move to next step if element not found
        currentStep++;
        showMobileStep(currentStep);
        return;
    }
    
    // Update tooltip text
    tooltipText.textContent = step.message;
    
    // Add highlight to element
    step.element.classList.add(step.highlightClass);
    
    // Position tooltip near the highlighted element
    positionTooltip(step.element);
    
    // Scroll element into view if needed (for WhatsApp)
    if (stepIndex === 0) {
        step.element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
    
    // Auto-advance after 5 seconds
    autoAdvanceTimer = setTimeout(() => {
        currentStep++;
        showMobileStep(currentStep);
    }, 5000);
}

function positionTooltip(element) {
    const elementRect = element.getBoundingClientRect();
    const tooltipRect = mobileTooltip.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    let top, left;
    
    // Position tooltip above the element with some spacing
    top = elementRect.top - tooltipRect.height - 20;
    left = Math.max(20, Math.min(
        elementRect.left + (elementRect.width - tooltipRect.width) / 2,
        viewportWidth - tooltipRect.width - 20
    ));
    
    // If tooltip would go off the top, position below instead
    if (top < 20) {
        top = elementRect.bottom + 20;
    }
    
    // Ensure tooltip stays within viewport
    if (top < 20) top = 20;
    if (top + tooltipRect.height > viewportHeight - 20) {
        top = viewportHeight - tooltipRect.height - 20;
    }
    if (left < 20) left = 20;
    if (left + tooltipRect.width > viewportWidth - 20) {
        left = viewportWidth - tooltipRect.width - 20;
    }
    
    mobileTooltip.style.top = `${top}px`;
    mobileTooltip.style.left = `${left}px`;
}

function endMobileIntro() {
    isIntroActive = false;
    mobileTooltip.style.display = 'none';
    
    // Remove all highlights
    mobileIntroSteps.forEach(step => {
        if (step.element) {
            step.element.classList.remove(step.highlightClass);
        }
    });
    
    // Clear any timers
    if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = null;
    }
    
    // Mark as seen
    localStorage.setItem('hasSeenMobileIntro', 'true');
}

// Hover Effects
function initHoverEffects() {
    // Card hover
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'var(--box-shadow)';
        });
    });
    
    // Skill tag hover
    document.querySelectorAll('.skill-tag').forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.05)';
            this.style.boxShadow = '0 6px 12px rgba(255, 105, 0, 0.2)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Nav item hover
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(-4px) scale(1.1)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
}

// Update smart button on scroll
window.addEventListener('scroll', updateSmartButton);
