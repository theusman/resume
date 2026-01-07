// Core Variables
const smartActionBtn = document.getElementById('smartActionBtn');
const printBtn = document.getElementById('printBtn');
const navItems = document.querySelectorAll('.nav-item');

// Sections for navigation
const sections = {
    'about': document.getElementById('about'),
    'experience': document.getElementById('experience'),
    'skills': document.getElementById('skills'),
    'keypoints': document.getElementById('keypoints'),
    'focus': document.getElementById('focus')
};

// Intro Tour Configuration
let isIntroActive = false;
let currentStep = 0;
let highlightElement = null;
let tooltipElement = null;
let autoAdvanceTimer = null;

// Mobile-only intro steps (with concise one-liners)
const mobileIntroSteps = [
    {
        element: '.whatsapp-item',
        text: 'Tap to contact me directly on WhatsApp',
        position: 'bottom'
    },
    {
        element: '#smartActionBtn',
        text: 'Theme toggle • Switches to "Back to Top" when scrolling',
        position: 'left'
    },
    {
        element: '#bottomNav',
        text: 'Swipe or tap icons to navigate sections',
        position: 'top'
    },
    {
        element: '#skillsTabs',
        text: 'Tap to switch between Technical and Business skills',
        position: 'top'
    },
    {
        element: '#printBtn',
        text: 'Tap for printer-friendly resume',
        position: 'left'
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Show mobile intro if first visit on mobile (no overlay, just tooltips)
    if (isMobileDevice() && !localStorage.getItem('hasSeenMobileIntro')) {
        setTimeout(() => {
            startMobileIntro();
        }, 800); // Slightly reduced delay
    }
    
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

// Mobile Intro System (main functionality)
function startMobileIntro() {
    if (isIntroActive || !isMobileDevice()) return;
    
    isIntroActive = true;
    currentStep = 0;
    showMobileStep(currentStep);
}

function showMobileStep(stepIndex) {
    // Clear any existing timers
    if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
    }
    
    if (stepIndex >= mobileIntroSteps.length) {
        endMobileIntro();
        return;
    }
    
    const step = mobileIntroSteps[stepIndex];
    const element = document.querySelector(step.element);
    
    if (!element) {
        showMobileStep(stepIndex + 1);
        return;
    }
    
    // Remove previous highlight and tooltip
    removeHighlight();
    
    // Scroll element into view if needed
    if (stepIndex > 0) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    }
    
    // Add highlight after a short delay
    setTimeout(() => {
        addMobileHighlight(element, step, stepIndex);
    }, 500);
}

function addMobileHighlight(element, step, stepIndex) {
    // Add subtle highlight effect
    element.classList.add('mobile-highlight');
    highlightElement = element;
    
    // Create minimal tooltip
    const tooltip = createMobileTooltip(step, stepIndex, element);
    document.body.appendChild(tooltip);
    tooltipElement = tooltip;
    
    // Position tooltip
    positionMobileTooltip(tooltip, element, step.position);
    
    // Auto-advance after 3 seconds (shorter than before)
    autoAdvanceTimer = setTimeout(() => {
        currentStep++;
        showMobileStep(currentStep);
    }, 3000);
    
    // Allow tapping the element to advance
    element.addEventListener('click', advanceOnClick, { once: true });
}

function createMobileTooltip(step, stepIndex, targetElement) {
    const tooltip = document.createElement('div');
    tooltip.className = 'mobile-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-label', `Tip: ${step.text}`);
    
    tooltip.innerHTML = `
        <div class="tooltip-content">
            <p>${step.text}</p>
            <div class="tooltip-progress">
                <span class="tooltip-step">${stepIndex + 1}/${mobileIntroSteps.length}</span>
                <button class="tooltip-skip" aria-label="Skip tour">Skip</button>
                <button class="tooltip-next" aria-label="Next tip">Got it</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    tooltip.querySelector('.tooltip-skip').addEventListener('click', endMobileIntro);
    tooltip.querySelector('.tooltip-next').addEventListener('click', () => {
        currentStep++;
        showMobileStep(currentStep);
    });
    
    return tooltip;
}

function positionMobileTooltip(tooltip, element, position) {
    const elementRect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let top, left;
    const margin = 10;
    
    // Calculate position based on element location
    switch(position) {
        case 'top':
            top = elementRect.top - tooltipRect.height - margin;
            left = Math.max(margin, Math.min(
                elementRect.left + (elementRect.width - tooltipRect.width) / 2,
                viewportWidth - tooltipRect.width - margin
            ));
            break;
            
        case 'bottom':
            top = elementRect.bottom + margin;
            left = Math.max(margin, Math.min(
                elementRect.left + (elementRect.width - tooltipRect.width) / 2,
                viewportWidth - tooltipRect.width - margin
            ));
            break;
            
        case 'left':
            top = Math.max(margin, Math.min(
                elementRect.top + (elementRect.height - tooltipRect.height) / 2,
                viewportHeight - tooltipRect.height - margin
            ));
            left = elementRect.left - tooltipRect.width - margin;
            break;
            
        case 'right':
            top = Math.max(margin, Math.min(
                elementRect.top + (elementRect.height - tooltipRect.height) / 2,
                viewportHeight - tooltipRect.height - margin
            ));
            left = elementRect.right + margin;
            break;
            
        default:
            top = elementRect.bottom + margin;
            left = Math.max(margin, Math.min(
                elementRect.left + (elementRect.width - tooltipRect.width) / 2,
                viewportWidth - tooltipRect.width - margin
            ));
    }
    
    // Ensure tooltip stays visible
    if (left < margin) left = margin;
    if (left + tooltipRect.width > viewportWidth - margin) {
        left = viewportWidth - tooltipRect.width - margin;
    }
    if (top < margin) top = margin;
    if (top + tooltipRect.height > viewportHeight - margin) {
        top = viewportHeight - tooltipRect.height - margin;
    }
    
    tooltip.style.position = 'fixed';
    tooltip.style.top = `${top + window.scrollY}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.zIndex = '10000';
}

function advanceOnClick() {
    currentStep++;
    showMobileStep(currentStep);
}

function endMobileIntro() {
    isIntroActive = false;
    removeHighlight();
    localStorage.setItem('hasSeenMobileIntro', 'true');
}

function removeHighlight() {
    if (highlightElement) {
        highlightElement.classList.remove('feature-highlight');
        highlightElement.classList.remove('mobile-highlight');
        highlightElement.removeEventListener('click', advanceOnClick);
        highlightElement = null;
    }
    if (tooltipElement) {
        tooltipElement.remove();
        tooltipElement = null;
    }
    if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = null;
    }
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
