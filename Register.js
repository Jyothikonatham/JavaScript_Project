// === Particles Background ===
particlesJS('particles-js', {
    particles: {
        number: { value: 90 },
        color: { value: '#ffffff' },
        shape: { type: 'circle' },
        opacity: { value: 0.6, random: true },
        size: { value: 3, random: true },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#ffffff',
            opacity: 0.3,
            width: 1
        },
        move: { enable: true, speed: 2, direction: 'none', out_mode: 'out' }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: { enable: true, mode: 'repulse' },
            onclick: { enable: true, mode: 'push' },
            resize: true
        },
        modes: { repulse: { distance: 100 }, push: { particles_nb: 3 } }
    },
    retina_detect: true
});

// === Typing Animation ===
const typingElement = document.getElementById("typingText");
const messages = [
    "Track your daily expenses effortlessly 💸",
    "Visualize your spending with real-time analytics 📊",
    "Stay financially confident every day 💪"
];

let messageIndex = 0, charIndex = 0, isDeleting = false;

function typeEffect() {
    const current = messages[messageIndex];
    typingElement.textContent = current.substring(0, charIndex + 1);
    if (!isDeleting && charIndex < current.length) {
        charIndex++;
    } else if (isDeleting && charIndex > 0) {
        charIndex--;
    } else if (!isDeleting && charIndex === current.length) {
        isDeleting = true;
        setTimeout(typeEffect, 1500);
        return;
    } else {
        isDeleting = false;
        messageIndex = (messageIndex + 1) % messages.length;
    }
    setTimeout(typeEffect, isDeleting ? 40 : 80);
}
if (typingElement) typeEffect();

// === Register Form Validation ===
const form = document.getElementById("registerForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        errorMsg.classList.remove("hidden");
        return;
    } else {
        errorMsg.classList.add("hidden");
    }

    // Fetch existing users
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
        alert(`⚠️ The email "${email}" is already registered! Please login.`);
        return;
    }

    // Save new user
    users.push({ name, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("🎉 Registration Successful! Redirecting to Login...");
    window.location.href = "login.html";
});
