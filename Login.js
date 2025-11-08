document.addEventListener("DOMContentLoaded", () => {
  // === Typing Animation ===
  const typingTextContent = "Log in to track and visualize your daily spending in real time.";
  const typingElement = document.getElementById("typingText");
  const formContainer = document.getElementById("loginFormContainer");
  let index = 0;

  function typeText() {
    if (index < typingTextContent.length) {
      typingElement.innerHTML += typingTextContent.charAt(index);
      index++;
      setTimeout(typeText, 50);
    } else {
      formContainer.classList.remove("hidden"); // show login form after typing
    }
  }

  typeText();

  // === Toast Notification ===
  function showToast(message, duration = 2000) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("opacity-0");
    toast.classList.add("opacity-100");
    setTimeout(() => {
      toast.classList.remove("opacity-100");
      toast.classList.add("opacity-0");
    }, duration);
  }

  // === Login Form Validation ===
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      showToast("⚠️ Invalid email or password!", 2500);
      return;
    }

    // Save current user
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    showToast("✅ Login successful! Redirecting...", 2000);

    setTimeout(() => {
      window.location.href = "./Dashboard.html";
    }, 2000);
  });
});
