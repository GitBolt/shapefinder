export function getColorValue(colorName) {
  const colors = {
    red: '#ff6b6b',
    green: '#51cf66',
    blue: '#339af0',
    purple: '#cc5de8',
    yellow: '#ffd43b',
    orange: '#fd7e14'
  };
  
  if (!colors[colorName]) {
    console.warn(`Color "${colorName}" not found, using default red`);
  }
  
  return colors[colorName] || '#ff6b6b';
}

/**
 * Shows a notification to the user
 * @param {HTMLElement} element - The notification element
 * @param {string} message - The message to display
 * @param {number} duration - Duration in milliseconds to show the notification
 * @param {string} type - Notification type: 'default', 'success', 'error', 'info'
 */
export function showNotification(element, message, duration = 3000, type = 'default') {
  // Clear any existing timeout
  if (element._hideTimeout) {
    clearTimeout(element._hideTimeout);
  }
  
  // Set notification content
  element.textContent = message;
  element.style.display = 'block';
  
  // Remove any existing type classes
  element.classList.remove('notification-success', 'notification-error', 'notification-info');
  
  // Add appropriate class based on type
  if (type === 'success') {
    element.classList.add('notification-success');
  } else if (type === 'error') {
    element.classList.add('notification-error');
  } else if (type === 'info') {
    element.classList.add('notification-info');
  }
  
  // Set timeout to hide notification
  element._hideTimeout = setTimeout(() => {
    // Add fade-out class first
    element.classList.add('notification-fadeout');
    
    // Then hide after animation completes
    setTimeout(() => {
      element.style.display = 'none';
      element.classList.remove('notification-fadeout');
    }, 300);
  }, duration);
} 