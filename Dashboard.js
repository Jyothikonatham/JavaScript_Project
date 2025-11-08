document.addEventListener("DOMContentLoaded", () => {
  // --- USER LOGIN CHECK ---
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser) {
    window.location.href = "./Login.html";
    return;
  }

  // --- DOM ELEMENTS ---
  const userNameEl = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");
  const profilePic = document.getElementById("profilePic");
  const profilePlaceholder = document.getElementById("profilePlaceholder");

  const expenseForm = document.getElementById("expenseForm");
  const popupModal = document.getElementById("popupModal");
  const popupTitle = document.getElementById("popupTitle");
  const popupContent = document.getElementById("popupContent");
  const closePopup = document.getElementById("closePopup");

  const btnTotal = document.getElementById("btnTotal");
  const btnToday = document.getElementById("btnToday");
  const btnMonth = document.getElementById("btnMonth");
  const btnRecent = document.getElementById("btnLast");
  const quickAddBtn = document.getElementById("quickAddBtn");

  const searchInput = document.getElementById("searchExpense");
  const filterCategory = document.getElementById("filterCategory");
  const filterFrom = document.getElementById("filterFrom");
  const filterTo = document.getElementById("filterTo");
  const clearFilters = document.getElementById("clearFilters");

  const insightTopCat = document.getElementById("insightTopCat");
  const insightHighExp = document.getElementById("insightHighExp");
  const insightActiveDay = document.getElementById("insightActiveDay");
  const insightAvgSpend = document.getElementById("insightAvgSpend");
  const insightAlert = document.getElementById("insightAlert");

  const downloadCsvBtn = document.getElementById("downloadCsv");
  const shareSummaryBtn = document.getElementById("shareSummary");

  const categoryChartCtx = document.getElementById("categoryChart").getContext("2d");
  const timeChartCtx = document.getElementById("timeChart").getContext("2d");

  let expenses = JSON.parse(localStorage.getItem(`expenses_${loggedInUser.email}`)) || [];
  let categoryChart = null;
  let timeChart = null;

  // --- DROPDOWN & TAB JS ---
  const userIcon = document.getElementById("userIcon");
  const userDropdown = document.getElementById("userDropdown");
  const dropdownBtns = document.querySelectorAll(".dropdown-btn");
  const tabs = document.querySelectorAll(".tab-content");

  // Toggle dropdown
  userIcon.addEventListener("click", () => {
    userDropdown.classList.toggle("hidden");
  });

  // Switch tabs
  dropdownBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(tab => tab.classList.add("hidden"));
      const target = document.getElementById(btn.dataset.tab);
      target.classList.remove("hidden");
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!userDropdown.contains(e.target) && !userIcon.contains(e.target)) {
      userDropdown.classList.remove("show");
    }
  });

  // Populate user info dynamically
  document.getElementById("tabUserName").textContent = loggedInUser.name || "User";
document.getElementById("tabUserEmail").textContent = loggedInUser.email || "user@example.com";

  // --- SET USER INFO ---
  userNameEl.textContent = loggedInUser.name || "User";

  logoutBtn.onclick = () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "./Login.html";
  };

  // --- PROFILE PICTURE ---
  const profileKey = `profile_${loggedInUser.email}`;
  loggedInUser.profilePic = localStorage.getItem(profileKey) || loggedInUser.profilePic || null;

  const hiddenInput = document.createElement("input");
  hiddenInput.type = "file";
  hiddenInput.accept = "image/*";
  hiddenInput.classList.add("hidden");
  document.body.appendChild(hiddenInput);
  function displayProfile() {
    if (loggedInUser.profilePic) {
      profilePic.src = loggedInUser.profilePic;
      profilePic.classList.remove("hidden");
      profilePlaceholder.classList.add("hidden");

      // Also update the dropdown icon
      const userIcon = document.getElementById("userIcon");
      userIcon.src = loggedInUser.profilePic;
    } else {
      profilePic.classList.add("hidden");
      profilePlaceholder.classList.remove("hidden");

      // Default or placeholder for dropdown icon
      const userIcon = document.getElementById("userIcon");
      userIcon.src = "default_user_icon.png"; // or any default placeholder
      userNameEl.textContent = loggedInUser.name || "User";
      document.getElementById("tabUserName").textContent = loggedInUser.name || "User";
      document.getElementById("tabUserEmail").textContent = loggedInUser.email || "user@example.com";
    }
  }


  profilePic.onclick = profilePlaceholder.onclick = () => hiddenInput.click();

  hiddenInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      loggedInUser.profilePic = ev.target.result;
      localStorage.setItem(profileKey, ev.target.result);
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
      displayProfile();
    };
    reader.readAsDataURL(file);
  };

  displayProfile();


  // --- HELPER FUNCTIONS ---
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  function saveExpenses() {
    localStorage.setItem(`expenses_${loggedInUser.email}`, JSON.stringify(expenses));
    updateInsights();
    updateCharts();
  }

  // --- SMART INSIGHTS ---
  function updateInsights() {
    if (!expenses.length) {
      insightTopCat.textContent = "—";
      insightHighExp.textContent = "—";
      insightActiveDay.textContent = "—";
      insightAvgSpend.textContent = "—";
      insightAlert.classList.add("hidden");
      return;
    }

    // Top Category
    const categoryMap = {};
    expenses.forEach(e => categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount);
    const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
    insightTopCat.textContent = `${topCategory[0]} (₹${topCategory[1].toFixed(2)})`;

    // Highest Expense
    const highest = expenses.reduce((prev, curr) => (curr.amount > prev.amount ? curr : prev), expenses[0]);
    insightHighExp.textContent = `${highest.title} - ₹${highest.amount.toFixed(2)}`;

    // Most Active Day
    const dayMap = {};
    expenses.forEach(e => {
      const d = new Date(e.date).toLocaleDateString("en-IN");
      dayMap[d] = (dayMap[d] || 0) + 1;
    });
    const activeDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];
    insightActiveDay.textContent = `${activeDay[0]} (${activeDay[1]} expenses)`;

    // Average Daily Spend
    const uniqueDays = [...new Set(expenses.map(e => e.date))];
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const avgDaily = totalAmount / uniqueDays.length;
    insightAvgSpend.textContent = `₹${avgDaily.toFixed(2)}`;

    // Overspend Alert
    insightAlert.classList.toggle("hidden", totalAmount <= 10000);
  }

  updateInsights();

  // --- CHARTS ---
  function updateCharts() {
    if (!expenses.length) {
      if (categoryChart) categoryChart.destroy();
      if (timeChart) timeChart.destroy();
      return;
    }

    // Category Pie
    const categoryMap = {};
    expenses.forEach(e => categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount);
    const catLabels = Object.keys(categoryMap);
    const catData = Object.values(categoryMap);

    if (categoryChart) categoryChart.destroy();
    categoryChart = new Chart(categoryChartCtx, {
      type: 'pie',
      data: { labels: catLabels, datasets: [{ data: catData, backgroundColor: catLabels.map(() => `hsl(${Math.random() * 360},70%,60%)`) }] },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    // Time Bar
    const dateMap = {};
    expenses.forEach(e => {
      const d = new Date(e.date).toLocaleDateString("en-IN");
      dateMap[d] = (dateMap[d] || 0) + e.amount;
    });

    const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(a) - new Date(b));
    const timeData = sortedDates.map(d => dateMap[d]);

    if (timeChart) timeChart.destroy();
    timeChart = new Chart(timeChartCtx, {
      type: 'bar',
      data: { labels: sortedDates, datasets: [{ label: 'Daily Spending', data: timeData, backgroundColor: 'rgba(59,130,246,0.7)' }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }

  updateCharts();

  // --- RECENT EXPENSES ---
  function updateRecentExpenses() {
    const recentList = document.getElementById("recentList");
    recentList.innerHTML = expenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(e => `<li class="flex justify-between border-b py-1"><span>${e.title} (${e.category})</span><span>₹${e.amount}</span></li>`)
      .join("");
  }

  updateRecentExpenses();

  // --- ADD EXPENSE ---
  expenseForm.addEventListener("submit", e => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (!title || !amount || !category || !date) return alert("Please fill all fields.");

    expenses.push({ id: Date.now(), title, amount, category, date });
    saveExpenses();
    expenseForm.reset();
    updateRecentExpenses();
    alert("✅ Expense added successfully!");
  });

  // --- POPUP UTILS ---
  function showPopup(title, contentHTML) {
    popupTitle.textContent = title;
    popupContent.innerHTML = contentHTML;
    popupModal.classList.remove("hidden");
  }

  closePopup.onclick = () => popupModal.classList.add("hidden");

  const fullCategoriesHTML = `
    <option value="">All Categories</option>
    <option value="Food">🍔 Food & Dining</option>
    <option value="Shopping">🛍️ Shopping</option>
    <option value="Travel">✈️ Travel</option>
    <option value="Groceries">🛒 Groceries</option>
    <option value="Entertainment">🎬 Entertainment</option>
    <option value="Bills">💡 Bills & Utilities</option>
    <option value="Health">💊 Health & Fitness</option>
    <option value="Education">📚 Education</option>
    <option value="Transport">🚗 Transport</option>
    <option value="Subscriptions">💻 Subscriptions</option>
    <option value="Other">📝 Other</option>
  `;

  function renderExpensesPopup(filteredExpenses, title) {
    let currentSort = "newest";
    let selectedCategory = "";

    function render() {
      let list = [...filteredExpenses];
      if (selectedCategory) list = list.filter(e => e.category === selectedCategory);
      if (currentSort === "highest") list.sort((a, b) => b.amount - a.amount);
      else if (currentSort === "oldest") list.sort((a, b) => new Date(a.date) - new Date(b.date));
      else list.sort((a, b) => new Date(b.date) - new Date(a.date));

      const total = list.reduce((sum, e) => sum + e.amount, 0);

      popupContent.innerHTML = `
        <div class="flex justify-between gap-2 mb-3">
          <select id="filterPopupCat" class="border px-2 py-1 rounded-lg">${fullCategoriesHTML}</select>
          <select id="sortPopup" class="border px-2 py-1 rounded-lg">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest ₹</option>
          </select>
        </div>
        <p class="text-center font-semibold mb-2">Total: ₹${total.toFixed(2)}</p>
        ${list.map(e => `<div class="flex justify-between border-b py-2"><span>${e.title} (${e.category})</span><span>₹${e.amount}</span></div>`).join("") || "<p>No expenses found.</p>"}
      `;

      document.getElementById("filterPopupCat").value = selectedCategory;
      document.getElementById("sortPopup").value = currentSort;

      document.getElementById("filterPopupCat").onchange = e => { selectedCategory = e.target.value; render(); };
      document.getElementById("sortPopup").onchange = e => { currentSort = e.target.value; render(); };
    }

    showPopup(title, "");
    render();
  }

  btnTotal.onclick = () => renderExpensesPopup(expenses, "💰 Total Expenses");

  btnToday.onclick = () => {
    const today = new Date().toISOString().split("T")[0];
    renderExpensesPopup(expenses.filter(e => e.date === today), "📅 Today's Spending");
  };

  btnMonth.onclick = () => {
    const now = new Date();
    renderExpensesPopup(expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }), "🗓️ This Month");
  };

  btnRecent.onclick = () => {
    function renderRecent() {
      const topExpenses = expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
      if (!topExpenses.length) { popupContent.innerHTML = "<p class='text-center'>No expenses found.</p>"; return; }

      popupContent.innerHTML = `<ul class="space-y-2 max-h-80 overflow-y-auto">${topExpenses.map(e => `
        <li class="flex justify-between items-center border-b py-2">
          <div><strong>${e.title}</strong> (${e.category}) - ₹${e.amount}<br><small>${formatDate(e.date)}</small></div>
          <div class="flex gap-2">
            <button class="edit-btn px-2 py-1 bg-blue-500 text-white rounded" data-id="${e.id}">Edit</button>
            <button class="delete-btn px-2 py-1 bg-red-500 text-white rounded" data-id="${e.id}">Delete</button>
          </div>
        </li>`).join("")}</ul>`;

      popupContent.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = () => {
          const id = parseInt(btn.dataset.id);
          if (confirm("Are you sure you want to delete this expense?")) {
            expenses = expenses.filter(e => e.id !== id);
            saveExpenses();
            renderRecent();
            updateRecentExpenses();
          }
        };
      });

      popupContent.querySelectorAll(".edit-btn").forEach(btn => {
        btn.onclick = () => {
          const id = parseInt(btn.dataset.id);
          const exp = expenses.find(e => e.id === id);
          if (!exp) return;

          document.getElementById("title").value = exp.title;
          document.getElementById("amount").value = exp.amount;
          document.getElementById("category").value = exp.category;
          document.getElementById("date").value = exp.date;

          expenses = expenses.filter(e => e.id !== id);
          saveExpenses();
          updateRecentExpenses();
          popupModal.classList.add("hidden");
          alert("You can now edit the expense and submit.");
        };
      });
    }

    showPopup("🧾 Recent Expenses (Top 20)", "");
    renderRecent();
  };

  quickAddBtn.onclick = () => { window.scrollTo({ top: 0, behavior: "smooth" }); document.getElementById("title").focus(); };

  // --- DOWNLOAD CSV ---
  downloadCsvBtn.onclick = () => {
    if (!expenses.length) return alert("No expenses to download!");
    const headers = ["Title", "Category", "Amount", "Date"];
    const rows = expenses.map(e => [e.title, e.category, e.amount, e.date]);
    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${loggedInUser.email}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- SHARE SUMMARY ---
  shareSummaryBtn.onclick = async () => {
    if (!expenses.length) return alert("No expenses to share!");
    const total = expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2);
    const summary = `💰 Expense Summary for ${loggedInUser.name}:\nTotal Expenses: ₹${total}\nTop 5 Recent Expenses:\n` +
      expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(e => `- ${e.title} (${e.category}) - ₹${e.amount} on ${formatDate(e.date)}`).join("\n");

    if (navigator.share) {
      try { await navigator.share({ title: `Expense Summary for ${loggedInUser.name}`, text: summary }); alert("Summary shared successfully!"); }
      catch (err) { console.error("Share failed:", err); }
    } else {
      navigator.clipboard.writeText(summary);
      alert("Summary copied to clipboard!");
    }
  };
});

// Editing profile 
const editProfileBtn = document.getElementById("editProfileBtn");

editProfileBtn.onclick = () => {
  const formHTML = `
    <form id="editProfileForm" class="space-y-3">
      <div>
        <label class="block text-gray-700 font-medium mb-1">Name</label>
        <input type="text" id="editName" value="${loggedInUser.name}" class="w-full border px-2 py-1 rounded-lg">
      </div>
      <div>
        <label class="block text-gray-700 font-medium mb-1">Email</label>
        <input type="email" id="editEmail" value="${loggedInUser.email}" class="w-full border px-2 py-1 rounded-lg">
      </div>
      <div>
        <label class="block text-gray-700 font-medium mb-1">Profile Picture</label>
        <input type="file" id="editProfilePic" accept="image/*" class="w-full">
      </div>
      <div class="flex justify-end gap-2">
        <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
        <button type="button" id="cancelEditProfile" class="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
      </div>
    </form>
  `;

  showPopup("✏️ Edit Profile", formHTML);

  // Handle cancel
  document.getElementById("cancelEditProfile").onclick = () => popupModal.classList.add("hidden");

  // Handle submit
  document.getElementById("editProfileForm").onsubmit = e => {
    e.preventDefault();
    const newName = document.getElementById("editName").value.trim();
    const newEmail = document.getElementById("editEmail").value.trim();
    const newPicFile = document.getElementById("editProfilePic").files[0];

    if (!newName || !newEmail) return alert("Name and Email cannot be empty!");

    // Update picture if selected
    if (newPicFile) {
      const reader = new FileReader();
      reader.onload = ev => {
        loggedInUser.profilePic = ev.target.result;
        localStorage.setItem(`profile_${loggedInUser.email}`, ev.target.result);
        saveProfile();
      };
      reader.readAsDataURL(newPicFile);
    }

    // Update name & email
    loggedInUser.name = newName;
    loggedInUser.email = newEmail;

    saveProfile();
  };

  function saveProfile() {
    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    displayProfile();
    popupModal.classList.add("hidden");
    alert("✅ Profile updated successfully!");
  }
};
