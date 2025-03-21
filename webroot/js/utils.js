export function getColorValue(colorName) {
  const colors = {
    red: '#ff6b6b',
    green: '#51cf66',
    blue: '#339af0',
    purple: '#cc5de8',
    yellow: '#ffd43b',
    orange: '#fd7e14',
    teal: '#20c997'
  };
  
  if (!colors[colorName]) {
    console.warn(`Color "${colorName}" not found, using default red`);
  }
  
  return colors[colorName] || '#ff6b6b';
}

export function showNotification(element, message) {
  element.textContent = message;
  element.style.display = 'block';
  
  setTimeout(() => {
    element.style.display = 'none';
  }, 3000);
} 