// Generate floating background particles across the entire page

function createBackgroundParticles() {
  // Create the container for particles
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'bg-particles-container';
  document.body.appendChild(particlesContainer);
  
  // Particle types and colors
  const particleTypes = ['circle', 'square', 'triangle', 'star'];
  const particleColors = ['#ff6b3d', '#3b82f6', '#84cc16', '#f43f5e', '#06b6d4'];
  
  // Generate 30 particles
  for (let i = 0; i < 30; i++) {
    // Create particle element
    const particle = document.createElement('div');
    
    // Randomize particle properties
    const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
    const color = particleColors[Math.floor(Math.random() * particleColors.length)];
    const size = Math.random() * 30 + 20; // 20-50px
    const left = Math.random() * 100; // Random horizontal position
    const duration = Math.random() * 30 + 20; // 20-50 seconds to float down
    const delay = Math.random() * 15; // Random delay up to 15 seconds
    
    // Set particle class and style
    particle.className = `bg-particle ${type}`;
    particle.style.backgroundColor = color;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}%`;
    particle.style.top = '-5%'; // Start above the viewport
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    
    // Special styling for triangle particles
    if (type === 'triangle') {
      const borderSize = size / 2;
      particle.style.borderWidth = `0 ${borderSize}px ${size}px ${borderSize}px`;
      particle.style.borderColor = `transparent transparent ${color} transparent`;
    }
    
    // Add to container
    particlesContainer.appendChild(particle);
  }
}

// Initialize particles when the DOM is loaded
document.addEventListener('DOMContentLoaded', createBackgroundParticles); 