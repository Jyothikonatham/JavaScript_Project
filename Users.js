// === Particles Background ===
particlesJS('particles-js', {
  particles: {
    number: { value: 80 },
    color: { value: '#ffffff' },
    shape: { type: 'circle' },
    opacity: { value: 0.6, random: true },
    size: { value: 3, random: true },
    line_linked: { enable: true, distance: 150, color: '#fff', opacity: 0.3, width: 1 },
    move: { enable: true, speed: 2, out_mode: 'out' }
  },
  interactivity: {
    detect_on: 'canvas',
    events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
    modes: { repulse: { distance: 100 }, push: { particles_nb: 3 } }
  },
  retina_detect: true
});

// === Elements ===
const usersContainer = document.getElementById("usersContainer");
const expenseModal = document.getElementById("expenseModal");
const modalExpensesList = document.getElementById("modalExpensesList");
const closeModal = document.getElementById("closeModal");
const logoutBtn = document.getElementById("logoutBtn");
const dashboardBtn = document.getElementById("dashboardBtn");

// === Check if logged in ===
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
  window.location.href = "./Login.html";
}

// === Load Users ===
const users = JSON.parse(localStorage.getItem("users")) || [];

function renderUsers() {
  usersContainer.innerHTML = "";
  if (users.length === 0) {
    usersContainer.innerHTML = `<p class="text-white/80 text-center col-span-full">No users found.</p>`;
    return;
  }

  users.forEach(user => {
    const userExpenses = JSON.parse(localStorage.getItem(`expenses_${user.email}`)) || [];
    const totalAmount = userExpenses.reduce((sum, e) => sum + e.amount, 0);

    const div = document.createElement("div");
    div.className = "bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 flex flex-col justify-between animate-fadeUp";
    div.innerHTML = `
      <h3 class="text-lg font-semibold text-gray-900">${user.name}</h3>
      <p class="text-sm text-gray-700">${user.email}</p>
      <p class="text-sm mt-2">Total Expenses: ${userExpenses.length}</p>
      <p class="text-sm">Total Amount: $${totalAmount.toFixed(2)}</p>
      <button class="submit-btn mt-3 view-expenses-btn">View Expenses</button>
    `;
    usersContainer.appendChild(div);

    // View expenses button
    div.querySelector(".view-expenses-btn").addEventListener("click", () => showExpenses(user.email, user.name));
  });
}

function showExpenses(email, name) {
  const expenses = JSON.parse(localStorage.getItem(`expenses_${email}`)) || [];
  modalExpensesList.innerHTML = `<h3 class="font-semibold mb-3 text-gray-900 text-center">${name}'s Expenses</h3>`;
  if (expenses.length === 0) {
    modalExpensesList.innerHTML += `<p class="text-gray-700 text-center">No expenses found.</p>`;
  } else {
    expenses.forEach(e => {
      const div = document.createElement("div");
      div.className = "bg-white/70 p-3 rounded-xl flex justify-between items-center";
      div.innerHTML = `<p>${e.title} • ${e.category}</p><p>$${e.amount}</p>`;
      modalExpensesList.appendChild(div);
    });
  }
  expenseModal.classList.remove("opacity-0", "pointer-events-none");
  expenseModal.classList.add("opacity-100");
}

closeModal.addEventListener("click", () => {
  expenseModal.classList.add("opacity-0", "pointer-events-none");
});

// Logout / Back
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "./Login.html";
});

dashboardBtn.addEventListener("click", () => {
  window.location.href = "./Dashboard.html";
});

// Initial render
renderUsers();
