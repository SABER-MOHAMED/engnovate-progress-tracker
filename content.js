// IELTS Test Completion Tracker - Content Script

function extractTestPath(testCard) {
  // Look for various test button types
  const testButtons = [
    'a.ielts-reading-take-test-button',
    'a.ielts-listening-take-test-button', 
    'a.ielts-writing-take-test-button',
    'a[href*="take-test"]',
    'a[href*="ielts-reading-tests"]',
    'a[href*="ielts-listening-tests"]',
    'a[href*="ielts-writing-tests"]'
  ];

  for (const selector of testButtons) {
    const takeTestLink = testCard.querySelector(selector);
    if (takeTestLink) {
      const href = takeTestLink.getAttribute('href');
      if (href) {
        try {
          const url = new URL(href);
          return url.pathname;
        } catch (e) {
          console.error('Error parsing URL:', href, e);
        }
      }
    }
  }

  // Alternative: look for the h2 link with any IELTS test type
  const titleSelectors = [
    'h2 a[href*="ielts-reading-tests"]',
    'h2 a[href*="ielts-listening-tests"]', 
    'h2 a[href*="ielts-writing-tests"]'
  ];

  for (const selector of titleSelectors) {
    const titleLink = testCard.querySelector(selector);
    if (titleLink) {
      const href = titleLink.getAttribute('href');
      if (href) {
        try {
          const url = new URL(href);
          return url.pathname;
        } catch (e) {
          console.error('Error parsing URL:', href, e);
        }
      }
    }
  }

  return null;
}

function isTestCompleted(testPath) {
  if (!testPath) return false;
  
  try {
    // Check multiple possible localStorage key formats based on actual data
    const possibleKeys = [
      testPath,
      testPath + '/',
      testPath.replace(/\/$/, ''),
      'answers_' + testPath,
      'test_' + testPath
    ];
    
    // For writing tests, check the specific format: ielts-writing-answer-1/ielts-writing-tests/...
    if (testPath.includes('ielts-writing-tests')) {
      possibleKeys.push('ielts-writing-answer-1' + testPath);
      possibleKeys.push('ielts-writing-answer-2' + testPath);
      // Also check for task-specific paths
      possibleKeys.push('ielts-writing-answer-1' + testPath + '-task-1');
      possibleKeys.push('ielts-writing-answer-1' + testPath + '-task-2');
      possibleKeys.push('ielts-writing-answer-2' + testPath + '-task-1');
      possibleKeys.push('ielts-writing-answer-2' + testPath + '-task-2');
    }
    
    // For listening tests, check for section-specific paths
    if (testPath.includes('ielts-listening-tests')) {
      possibleKeys.push(testPath + '-questions-01-10');
      possibleKeys.push(testPath + '-questions-11-20');
      possibleKeys.push(testPath + '-questions-21-30');
      possibleKeys.push(testPath + '-questions-31-40');
    }
    
    // For reading tests, check for section-specific paths
    if (testPath.includes('ielts-reading-tests')) {
      possibleKeys.push(testPath + '-questions-1-13');
      possibleKeys.push(testPath + '-questions-14-19');
      possibleKeys.push(testPath + '-questions-20-23');
      possibleKeys.push(testPath + '-questions-24-26');
      possibleKeys.push(testPath + '-questions-27-33');
      possibleKeys.push(testPath + '-questions-34-40');
    }
    
    for (const key of possibleKeys) {
      const storedAnswers = localStorage.getItem(key);
      if (storedAnswers !== null && storedAnswers !== '') {
        console.log(`Found stored answers for key: ${key}`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking localStorage:', error);
    return false;
  }
}

function addCompletionTag(testCard, isCompleted) {
  // Remove existing tags first
  const existingTag = testCard.querySelector('.completion-tag');
  if (existingTag) {
    existingTag.remove();
  }
  
  // Create the completion tag
  const tag = document.createElement('div');
  tag.className = `completion-tag ${isCompleted ? 'completed' : 'not-completed'}`;
  tag.textContent = isCompleted ? '✓ COMPLETED' : '○ NOT TAKEN';
  
  // Position the tag (will be styled with CSS)
  testCard.style.position = 'relative';
  testCard.appendChild(tag);
  
  console.log(`Added ${isCompleted ? 'completed' : 'not-completed'} tag to test card`);
}

function processTestCards() {
  console.log('Processing IELTS test cards...');
  
  // Target all IELTS test containers - reading, listening, writing
  const containerSelectors = [
    '#ielts_reading_test_filter_results article[id^="post-"]',
    '#ielts_listening_test_filter_results article[id^="post-"]',
    '#ielts_writing_test_filter_results article[id^="post-"]',
    // Fallback for any container with ielts test articles
    'article[id^="post-"]'
  ];
  
  let testCards = [];
  
  // Try each container selector
  for (const selector of containerSelectors) {
    const cards = document.querySelectorAll(selector);
    if (cards.length > 0) {
      testCards = Array.from(cards);
      console.log(`Found ${cards.length} test cards using selector: ${selector}`);
      break;
    }
  }
  
  // If no specific containers found, look for any articles with IELTS test links
  if (testCards.length === 0) {
    const allArticles = document.querySelectorAll('article[id^="post-"]');
    testCards = Array.from(allArticles).filter(article => {
      const hasIELTSLink = article.querySelector('a[href*="ielts-reading-tests"], a[href*="ielts-listening-tests"], a[href*="ielts-writing-tests"]');
      return hasIELTSLink !== null;
    });
    console.log(`Found ${testCards.length} test cards by filtering articles with IELTS links`);
  }
  
  console.log(`Processing ${testCards.length} test card articles`);
  
  testCards.forEach((testCard, index) => {
    const testPath = extractTestPath(testCard);
    
    if (testPath) {
      const isCompleted = isTestCompleted(testPath);
      addCompletionTag(testCard, isCompleted);
      
      // Get test title for logging
      const titleElement = testCard.querySelector('h2 a');
      const testTitle = titleElement ? titleElement.textContent.trim() : 'Unknown Test';
      
      console.log(`Processed test ${index + 1}: "${testTitle}" - Path: ${testPath} - Completed: ${isCompleted}`);
    } else {
      console.warn('Could not extract test path from card:', testCard);
    }
  });
  
  console.log(`Processed ${testCards.length} test cards total`);
}

// Debug function to help test the extension
function debugExtension() {
  console.log('=== IELTS Extension Debug ===');
  console.log('Current URL:', window.location.href);
  console.log('localStorage keys:', Object.keys(localStorage));
  
  // Check for test articles in all containers
  const containerSelectors = [
    '#ielts_reading_test_filter_results',
    '#ielts_listening_test_filter_results', 
    '#ielts_writing_test_filter_results'
  ];
  
  containerSelectors.forEach(selector => {
    const container = document.querySelector(selector);
    if (container) {
      const articles = container.querySelectorAll('article[id^="post-"]');
      console.log(`Found ${articles.length} articles in ${selector}`);
      
      articles.forEach((article, index) => {
        const title = article.querySelector('h2 a')?.textContent;
        const takeTestButton = article.querySelector('a[class*="take-test-button"]');
        const href = takeTestButton?.getAttribute('href');
        console.log(`  Article ${index + 1}: "${title}" - Link: ${href}`);
      });
    }
  });
  
  // Check for all IELTS test links
  const allTestLinks = document.querySelectorAll('a[href*="ielts-reading-tests"], a[href*="ielts-listening-tests"], a[href*="ielts-writing-tests"]');
  console.log('Found total IELTS test links:', allTestLinks.length);
  
  // Check for IELTS text
  const allText = document.body.textContent;
  console.log('Page contains "Cambridge IELTS":', allText.includes('Cambridge IELTS'));
  console.log('Page contains "Reading Test":', allText.includes('Reading Test'));
  console.log('Page contains "Listening Test":', allText.includes('Listening Test'));
  console.log('Page contains "Writing Test":', allText.includes('Writing Test'));
  
  // Check for existing tags
  const existingTags = document.querySelectorAll('.completion-tag');
  console.log('Existing completion tags:', existingTags.length);
  
  // Check for main containers
  containerSelectors.forEach(selector => {
    const container = document.querySelector(selector);
    console.log(`${selector} found:`, !!container);
  });
  
  console.log('=== End Debug ===');
}

// Function to simulate test completion for testing
function simulateTestCompletion(testPath) {
  localStorage.setItem(testPath, JSON.stringify({ completed: true, answers: [] }));
  console.log(`Simulated completion for: ${testPath}`);
  processTestCards(); // Re-process to update tags
}

// Function to clear test completion for testing
function clearTestCompletion(testPath) {
  localStorage.removeItem(testPath);
  console.log(`Cleared completion for: ${testPath}`);
  processTestCards(); // Re-process to update tags
}

// Function to clear all test completions
function clearAllTestCompletions() {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('ielts-reading-tests') || 
        key.includes('ielts-listening-tests') ||
        key.includes('ielts-writing-tests')) {
      localStorage.removeItem(key);
    }
  });
  console.log('Cleared all test completions');
  processTestCards(); // Re-process to update tags
}

// Make test functions available globally
window.simulateTestCompletion = simulateTestCompletion;
window.clearTestCompletion = clearTestCompletion;
window.clearAllTestCompletions = clearAllTestCompletions;

// Make debug function available globally for testing
window.debugIELTSExtension = debugExtension;

// Run when page loads
function init() {
  console.log('IELTS Test Completion Tracker initialized');
  
  // Initial processing with delay to ensure DOM is ready
  setTimeout(processTestCards, 500);
  
  // Re-process when DOM changes (for dynamic content like pagination)
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            // Check if new test cards were added
            if (node.id && node.id.startsWith('post-') ||
                node.querySelector && node.querySelector('article[id^="post-"]') ||
                node.querySelector && node.querySelector('#ielts_reading_test_filter_results')) {
              shouldProcess = true;
            }
          }
        });
      }
    });
    
    if (shouldProcess) {
      console.log('DOM changes detected, re-processing test cards...');
      setTimeout(processTestCards, 100);
    }
  });
  
  // Observe changes in the test results container
  const testResultsContainers = [
    '#ielts_reading_test_filter_results',
    '#ielts_listening_test_filter_results', 
    '#ielts_writing_test_filter_results'
  ];
  
  let observerAttached = false;
  for (const containerSelector of testResultsContainers) {
    const testResultsContainer = document.querySelector(containerSelector);
    if (testResultsContainer) {
      observer.observe(testResultsContainer, {
        childList: true,
        subtree: true
      });
      console.log(`Mutation observer attached to: ${containerSelector}`);
      observerAttached = true;
    }
  }
  
  if (!observerAttached) {
    // Fallback: observe the entire body
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    console.log('Mutation observer attached to document body (fallback)');
  }
  
  // Also observe pagination clicks
  const paginationContainers = [
    '.ielts-reading-filter-pagination',
    '.ielts-listening-filter-pagination',
    '.ielts-writing-filter-pagination'
  ];
  
  paginationContainers.forEach(selector => {
    const paginationContainer = document.querySelector(selector);
    if (paginationContainer) {
      paginationContainer.addEventListener('click', () => {
        console.log('Pagination clicked, will re-process after delay');
        setTimeout(processTestCards, 1000); // Give time for new content to load
      });
    }
  });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Also run after a short delay to catch any dynamically loaded content
setTimeout(() => {
  console.log('Running delayed processTestCards (1s)');
  processTestCards();
}, 1000);
setTimeout(() => {
  console.log('Running delayed processTestCards (3s)');
  processTestCards();
}, 3000);