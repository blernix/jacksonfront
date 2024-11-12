// lib/floatingBubbles.js
export default function applyFloatingBubbles() {
    // Vérifier si le code s'exécute côté client
    if (typeof window === 'undefined') return;
    
    // Vérifier si le conteneur existe déjà
    if (document.querySelector('.bubble-container')) return;

    const bubbleContainer = document.createElement("div");
    bubbleContainer.classList.add("bubble-container");
    document.body.appendChild(bubbleContainer);
  
    for (let i = 0; i < 20; i++) {
      const bubble = document.createElement("div");
      bubble.classList.add("bubble");
  
      const size = Math.random() * 60 + 20;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}vw`;
      bubble.style.animationDuration = `${Math.random() * 5 + 5}s`;
      bubble.style.animationDelay = `${Math.random() * 10}s`;
  
      bubbleContainer.appendChild(bubble);
    }
}