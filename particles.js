/**
 * Particle animation background for Dr. Rajesh Kumar Mundotiya's website
 * Creates a subtle, professional animated background
 */

// Prevent main.js 404 errors
if (typeof window.main === 'undefined') {
    window.main = {};
}

document.addEventListener('DOMContentLoaded', function() {
    // Create canvas element for particles
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-background';
    document.body.insertBefore(canvas, document.body.firstChild);
    
    // Set canvas styles
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    
    // Initialize particles
    initParticles();
});

/**
 * Initialize the particle animation
 */
function initParticles() {
    const canvas = document.getElementById('particles-background');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Particle settings
    const particleCount = 50;
    const particles = [];
    const colors = ['#0055a4', '#4a90e2', '#00a8e8', '#f0f4f8'];
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 5 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.5 + 0.1
        });
    }
    
    // Animation function
    function animate() {
        requestAnimationFrame(animate);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(particle => {
            // Move particle
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > canvas.width) {
                particle.speedX *= -1;
            }
            
            if (particle.y < 0 || particle.y > canvas.height) {
                particle.speedY *= -1;
            }
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${hexToRgb(particle.color)}, ${particle.opacity})`;
            ctx.fill();
            
            // Draw connecting lines
            connectParticles(particle, particles);
        });
    }
    
    // Draw connecting lines between particles
    function connectParticles(p1, particles) {
        const connectionDistance = 150;
        
        particles.forEach(p2 => {
            if (p1 === p2) return;
            
            const distance = Math.sqrt(
                Math.pow(p1.x - p2.x, 2) + 
                Math.pow(p1.y - p2.y, 2)
            );
            
            if (distance < connectionDistance) {
                // Calculate opacity based on distance
                const opacity = 1 - (distance / connectionDistance);
                
                // Draw line
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(${hexToRgb(p1.color)}, ${opacity * 0.2})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
    }
    
    // Convert hex color to RGB
    function hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse the hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `${r}, ${g}, ${b}`;
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    // Start animation
    animate();
} 