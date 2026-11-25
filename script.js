/**
 * ==========================================================================
 * VOTESPHERE • ONLINE VOTING SYSTEM ENGINE
 * Pure Vanilla JavaScript • Standalone SaaS Architecture
 * ==========================================================================
 */

// ==========================================================================
// 1. DATA MODELS & IN-MEMORY STATE
// ==========================================================================

/**
 * Active Theme State (Light / Dark)
 */
let currentTheme = "light";

/**
 * Initial 5 Candidates (as specified in SaaS dashboard wireframe: Candidates: 05)
 */
const initialCandidatesList = [
    {
        id: 1,
        name: "Dr. Sarah Jenkins",
        party: "Progressive Alliance",
        symbol: "🌟 Torch of Progress",
        description: "Pioneering sustainable campus infrastructure, universal student healthcare coverage, and 100% digital governance transparency.",
        votes: 10,
        image: "assets/candidate1.jpg"
    },
    {
        id: 2,
        name: "Michael Chang",
        party: "National Development Forum",
        symbol: "⚡ Clean Energy",
        description: "Championing innovative tech grants, accelerated engineering labs modernization, and smart renewable solar facilities.",
        votes: 8,
        image: "assets/candidate2.jpg"
    },
    {
        id: 3,
        name: "Elena Rostova",
        party: "Democratic Green Coalition",
        symbol: "🕊️ Peace Dove",
        description: "Advocating for educational equality, zero-carbon environmental transit, and expansive mental health support initiatives.",
        votes: 11,
        image: "assets/candidate3.jpg"
    },
    {
        id: 4,
        name: "Marcus Vance",
        party: "Tech & Innovation Union",
        symbol: "🚀 Future Initiative",
        description: "Fostering university-startup incubation networks, AI-assisted research facilities, and competitive coding sponsorships.",
        votes: 4,
        image: "assets/candidate4.jpg"
    },
    {
        id: 5,
        name: "Priya Sharma",
        party: "Students & Civic Rights Movement",
        symbol: "⚖️ Equal Opportunity",
        description: "Leading the campaign for equitable campus representation, subsidized textbook programs, and diverse student leadership.",
        votes: 2,
        image: "assets/candidate5.jpg"
    }
];

let candidates = JSON.parse(JSON.stringify(initialCandidatesList));

/**
 * Initial sample registered voters for demonstration
 */
const initialSampleVoters = [
    {
        id: 1,
        voterId: "V101",
        name: "Alice Smith",
        age: 22,
        email: "alice.smith@university.edu",
        password: "pass123",
        hasVoted: false
    },
    {
        id: 2,
        voterId: "V102",
        name: "Bob Miller",
        age: 24,
        email: "bob.miller@university.edu",
        password: "pass123",
        hasVoted: true
    },
    {
        id: 3,
        voterId: "V103",
        name: "Carlos Rivera",
        age: 21,
        email: "carlos.rivera@university.edu",
        password: "pass123",
        hasVoted: true
    },
    {
        id: 4,
        voterId: "V104",
        name: "Diana Prince",
        age: 23,
        email: "diana.prince@university.edu",
        password: "pass123",
        hasVoted: true
    }
];

/**
 * Helper to generate 50 registered voters to match initial demo metrics:
 * Total: 50 | Votes: 35 | Not Voted: 15 | Turnout: 70.0%
 */
function generateVotersRegistry() {
    const list = JSON.parse(JSON.stringify(initialSampleVoters));
    const simulatedNames = [
        "Emily Watson", "David Kumar", "Fiona Gallagher", "George Clark", 
        "Hannah Abbott", "Ian Wright", "Julia Roberts", "Kevin Peterson",
        "Laura Palmer", "Marcus Aurelius", "Nadia Comaneci", "Oliver Twist",
        "Penelope Cruz", "Quentin Blake", "Rachel Green", "Simon Cowell",
        "Tina Turner", "Uma Thurman", "Victor Hugo", "Wanda Maximoff",
        "Xavier Woods", "Yvonne Strahovski", "Zachary Levi", "Arthur Dent",
        "Beatrice Potter", "Colin Firth", "Daisy Ridley", "Edward Norton",
        "Felicity Jones", "Gabriel Byrne", "Helen Mirren", "Isaac Newton",
        "Jessica Chastain", "Keith Urban", "Lisa Kudrow", "Matthew McConaughey",
        "Naomi Watts", "Oscar Isaac", "Piper Perabo", "Robert DeNiro",
        "Sigourney Weaver", "Tom Hiddleston", "Ursula LeGuin", "Viggo Mortensen",
        "Winona Ryder", "Xander Harris"
    ];

    let currentId = 5;
    simulatedNames.forEach((name, idx) => {
        const idNum = 100 + currentId;
        // 32 of these background voters have voted to make exactly 35 total initial votes
        const hasVoted = idx < 32;
        list.push({
            id: currentId,
            voterId: `V${idNum}`,
            name: name,
            age: 20 + (idx % 8),
            email: `${name.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
            password: "pass123",
            hasVoted: hasVoted
        });
        currentId++;
    });

    return list;
}

let voters = generateVotersRegistry();

/**
 * Current authenticated session user
 */
let currentUser = null;

// Election commissioner session
let commissionerLoggedIn = false;

/**
 * Currently chosen candidate on voting ballot
 */
let selectedCandidate = null;

// ==========================================================================
// 2. LIFECYCLE & INITIALIZATION
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    initVoteSphere();
});

function initVoteSphere() {
    // Window scroll event for sticky navbar shadow
    window.addEventListener("scroll", () => {
        const header = document.getElementById("main-header");
        if (header) {
            if (window.scrollY > 20) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        }
    });

    // Initialize views
    renderResults();
    renderAdminDashboard();
}

// ==========================================================================
// 3. THEME TOGGLE (LIGHT / DARK SAAS MODE)
// ==========================================================================

/**
 * Toggles between Light and Dark mode
 */
function toggleTheme() {
    const html = document.documentElement;
    const moonIcon = document.getElementById("theme-icon-moon");
    const sunIcon = document.getElementById("theme-icon-sun");

    if (currentTheme === "light") {
        currentTheme = "dark";
        html.setAttribute("data-theme", "dark");
        if (moonIcon) moonIcon.style.display = "none";
        if (sunIcon) sunIcon.style.display = "block";
        showMessage("Switched to Dark Mode 🌙", "info");
    } else {
        currentTheme = "light";
        html.setAttribute("data-theme", "light");
        if (moonIcon) moonIcon.style.display = "block";
        if (sunIcon) sunIcon.style.display = "none";
        showMessage("Switched to Light Mode ☀️", "info");
    }
}

// ==========================================================================
// 4. PASSWORD VISIBILITY TOGGLE (EYE ICON)
// ==========================================================================

/**
 * Toggles password visibility on inputs
 * @param {string} inputId 
 * @param {HTMLElement} btn 
 */
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🔒";
        btn.setAttribute("aria-label", "Hide password");
    } else {
        input.type = "password";
        btn.textContent = "👁️";
        btn.setAttribute("aria-label", "Show password");
    }
}

// ==========================================================================
// 5. NAVIGATION & SECTION ROUTING
// ==========================================================================

/**
 * Switches current SPA section
 * @param {string} sectionId - home | register | login | dashboard | success | results | admin
 */
function showSection(sectionId) {
    // Auto-close mobile drawer
    const navCenter = document.getElementById("nav-center");
    if (navCenter && navCenter.classList.contains("show")) {
        navCenter.classList.remove("show");
    }

    // Access control: Dashboard requires voter login; commissioner dashboard requires commissioner login
    if (sectionId === "dashboard" && !currentUser) {
        showMessage("Authentication required: Please log in to access your ballot.", "warning");
        showSection("login");
        return;
    }

    if (sectionId === "admin" && !commissionerLoggedIn) {
        showMessage("Commissioner authentication required. Please log in first.", "warning");
        showSection("commissioner");
        return;
    }

    // Hide all sections
    const sections = document.querySelectorAll(".app-section");
    sections.forEach(s => s.classList.remove("active-section"));

    // Activate selected section
    const target = document.getElementById(`${sectionId}-section`);
    if (target) {
        target.classList.add("active-section");
    }

    // Update nav link active state
    const navLinks = document.querySelectorAll(".nav-link-btn");
    navLinks.forEach(b => b.classList.remove("active"));
    const activeBtn = document.getElementById(`nav-${sectionId}`);
    if (activeBtn) {
        activeBtn.classList.add("active");
    }

    // Section specific triggers
    if (sectionId === "dashboard") {
        checkVotingStatus();
        renderCandidates();
    } else if (sectionId === "results") {
        renderResults();
    } else if (sectionId === "admin") {
        renderAdminDashboard();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleStartVotingClick() {
    if (currentUser) {
        showSection("dashboard");
    } else {
        showSection("login");
    }
}

function scrollToHowItWorks() {
    showSection("home");
    setTimeout(() => {
        const el = document.getElementById("how-it-works");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
}

function toggleMobileMenu() {
    const navCenter = document.getElementById("nav-center");
    if (navCenter) {
        navCenter.classList.toggle("show");
    }
}

function showCommissionerPortal() {
    if (commissionerLoggedIn) {
        showSection("admin");
    } else {
        showSection("commissioner");
    }
}

function loginCommissioner(event) {
    event.preventDefault();
    const id = document.getElementById("commissioner-id").value.trim();
    const password = document.getElementById("commissioner-password").value;
    const alertBox = document.getElementById("commissioner-message");

    if (!id || !password) {
        showFormAlert(alertBox, "Please enter both Commissioner ID and password.", "alert-error");
        return;
    }

    if (id.toLowerCase() !== "ec001" || password !== "admin123") {
        showFormAlert(alertBox, "Invalid commissioner credentials.", "alert-error");
        return;
    }

    commissionerLoggedIn = true;
    document.getElementById("commissioner-login-form").reset();
    showMessage("Commissioner login successful. Dashboard unlocked.", "success");
    showSection("admin");
}

function logoutCommissioner() {
    commissionerLoggedIn = false;
    showMessage("Commissioner logged out successfully.", "info");
    showSection("home");
}

// ==========================================================================
// 6. VOTER REGISTRATION
// ==========================================================================

function registerVoter(event) {
    event.preventDefault();

    const voterIdInput = document.getElementById("reg-voter-id");
    const nameInput = document.getElementById("reg-name");
    const ageInput = document.getElementById("reg-age");
    const emailInput = document.getElementById("reg-email");
    const passwordInput = document.getElementById("reg-password");
    const confirmPasswordInput = document.getElementById("reg-confirm-password");
    const alertBox = document.getElementById("reg-message");

    clearInlineErrors("registration-form");
    alertBox.style.display = "none";

    const voterId = voterIdInput.value.trim();
    const name = nameInput.value.trim();
    const ageStr = ageInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    let hasError = false;

    // 1. Mandatory check
    if (!voterId) { setFieldError("reg-voter-id", "Voter ID is required."); hasError = true; }
    if (!name) { setFieldError("reg-name", "Full name is required."); hasError = true; }
    if (!ageStr) { setFieldError("reg-age", "Age is required."); hasError = true; }
    if (!email) { setFieldError("reg-email", "Email is required."); hasError = true; }
    if (!password) { setFieldError("reg-password", "Password is required."); hasError = true; }
    if (!confirmPassword) { setFieldError("reg-confirm-password", "Please confirm password."); hasError = true; }

    if (hasError) {
        showFormAlert(alertBox, "Please complete all mandatory fields.", "alert-error");
        return;
    }

    // 2. Age Check (>= 18)
    const age = parseInt(ageStr, 10);
    if (isNaN(age) || age < 18) {
        setFieldError("reg-age", "Eligibility requirement: Age must be 18 or above.");
        showFormAlert(alertBox, "Eligibility error: You must be at least 18 years old to register.", "alert-error");
        return;
    }

    // 3. Unique Voter ID Check
    const exists = voters.find(v => v.voterId.toLowerCase() === voterId.toLowerCase());
    if (exists) {
        setFieldError("reg-voter-id", "This Voter ID is already registered.");
        showFormAlert(alertBox, "Duplicate Voter ID: An account with this ID already exists.", "alert-error");
        return;
    }

    // 4. Email Regex Check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        setFieldError("reg-email", "Please enter a valid email format.");
        showFormAlert(alertBox, "Invalid email address format.", "alert-error");
        return;
    }

    // 5. Password length check
    if (password.length < 4) {
        setFieldError("reg-password", "Password must be at least 4 characters.");
        showFormAlert(alertBox, "Password must be at least 4 characters.", "alert-error");
        return;
    }

    // 6. Match check
    if (password !== confirmPassword) {
        setFieldError("reg-confirm-password", "Passwords do not match.");
        showFormAlert(alertBox, "Password and confirm password must match.", "alert-error");
        return;
    }

    // Register Voter
    const newVoter = {
        id: voters.length + 1,
        voterId: voterId.toUpperCase(),
        name: name,
        age: age,
        email: email,
        password: password,
        hasVoted: false
    };

    voters.push(newVoter);
    document.getElementById("registration-form").reset();

    showMessage(`Registration successful! Welcome, ${newVoter.name}.`, "success");

    // Pre-fill login input
    const loginInput = document.getElementById("login-voter-id");
    if (loginInput) loginInput.value = newVoter.voterId;

    renderResults();
    renderAdminDashboard();
    showSection("login");
}

// ==========================================================================
// 7. VOTER LOGIN & SESSION
// ==========================================================================

function loginVoter(event) {
    event.preventDefault();

    const voterIdInput = document.getElementById("login-voter-id");
    const passwordInput = document.getElementById("login-password");
    const alertBox = document.getElementById("login-message");

    clearInlineErrors("login-form");
    alertBox.style.display = "none";

    const voterId = voterIdInput.value.trim();
    const password = passwordInput.value;

    if (!voterId) {
        setFieldError("login-voter-id", "Voter ID is required.");
        showFormAlert(alertBox, "Please provide your registered Voter ID.", "alert-error");
        return;
    }

    if (!password) {
        setFieldError("login-password", "Password is required.");
        showFormAlert(alertBox, "Please enter your password.", "alert-error");
        return;
    }

    const voter = voters.find(v => v.voterId.toLowerCase() === voterId.toLowerCase());

    if (!voter || voter.password !== password) {
        showFormAlert(alertBox, "Authentication failed: Invalid credentials.", "alert-error");
        showMessage("Invalid Voter ID or password.", "error");
        return;
    }

    // Login successful
    currentUser = voter;
    selectedCandidate = null;

    document.getElementById("login-form").reset();
    updateNavbarSession();

    showMessage(`Welcome back, ${currentUser.name}! Ballot unlocked.`, "success");
    showSection("dashboard");
}

function logout() {
    if (!currentUser) return;
    const name = currentUser.name;
    currentUser = null;
    selectedCandidate = null;

    updateNavbarSession();
    showMessage(`Goodbye, ${name}. You have logged out safely.`, "info");
    showSection("login");
}

function quickFillCredentials(voterId, password) {
    const voterIdInput = document.getElementById("login-voter-id");
    const passwordInput = document.getElementById("login-password");
    if (voterIdInput && passwordInput) {
        voterIdInput.value = voterId;
        passwordInput.value = password;
        showMessage(`Demo credentials loaded for ${voterId}`, "info");
    }
}

function updateNavbarSession() {
    const commissionerNav = document.getElementById("nav-commissioner");
    if (commissionerNav) commissionerNav.textContent = commissionerLoggedIn ? "Commissioner Dashboard" : "Commissioner Login";
    const guestActions = document.getElementById("nav-guest-actions");
    const userActions = document.getElementById("nav-user-actions");
    const displayName = document.getElementById("nav-user-display-name");
    const avatarInit = document.getElementById("user-avatar-initial");

    if (currentUser) {
        if (guestActions) guestActions.style.display = "none";
        if (userActions) userActions.style.display = "flex";
        if (displayName) displayName.textContent = currentUser.name.split(" ")[0];
        if (avatarInit) avatarInit.textContent = currentUser.name.charAt(0).toUpperCase();
    } else {
        if (guestActions) guestActions.style.display = "flex";
        if (userActions) userActions.style.display = "none";
    }
}

// ==========================================================================
// 8. VOTING DASHBOARD & 5 CANDIDATES SELECTION
// ==========================================================================

function checkVotingStatus() {
    if (!currentUser) return;

    // Header values
    const elName = document.getElementById("dashboard-voter-name");
    const elId = document.getElementById("dashboard-voter-id");
    const elAge = document.getElementById("dashboard-voter-age");
    const elEmail = document.getElementById("dashboard-voter-email");
    const elAvatar = document.getElementById("dash-avatar-circle");
    const elStatus = document.getElementById("dash-voter-status-val");
    const banner = document.getElementById("already-voted-banner");
    const actionBar = document.getElementById("sticky-vote-action-bar");

    if (elName) elName.textContent = currentUser.name;
    if (elId) elId.textContent = currentUser.voterId;
    if (elAge) elAge.textContent = currentUser.age;
    if (elEmail) elEmail.textContent = currentUser.email;
    if (elAvatar) elAvatar.textContent = currentUser.name.charAt(0).toUpperCase();

    // Stats calculations
    const stats = calculateResults();
    const elTurnout = document.getElementById("dash-turnout-pct");
    const elCandCount = document.getElementById("dash-candidate-count");
    if (elTurnout) elTurnout.textContent = `${stats.turnoutPct}%`;
    if (elCandCount) elCandCount.textContent = `0${candidates.length}`;

    if (currentUser.hasVoted) {
        if (elStatus) {
            elStatus.textContent = "VOTED ✓";
            elStatus.style.color = "var(--success)";
        }
        if (banner) banner.style.display = "flex";
        if (actionBar) actionBar.style.display = "none";
    } else {
        if (elStatus) {
            elStatus.textContent = "NOT VOTED";
            elStatus.style.color = "var(--warning)";
        }
        if (banner) banner.style.display = "none";
        if (actionBar) actionBar.style.display = "block";
    }
}

function renderCandidates() {
    const grid = document.getElementById("candidates-grid");
    if (!grid) return;

    grid.innerHTML = "";
    const isVoted = currentUser ? currentUser.hasVoted : false;

    candidates.forEach(cand => {
        const isSelected = selectedCandidate && selectedCandidate.id === cand.id;

        const card = document.createElement("div");
        card.className = `candidate-card ${isSelected ? "selected" : ""} ${isVoted ? "disabled-vote" : ""}`;
        card.setAttribute("data-cand-id", cand.id);

        card.innerHTML = `
            <div class="card-selected-ribbon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Selected
            </div>
            <div class="candidate-photo-frame">
                <img src="${cand.image}" alt="${cand.name}" class="candidate-portrait" onerror="this.src='assets/candidate1.jpg'">
                <div class="candidate-symbol-badge">
                    <span>${cand.symbol}</span>
                </div>
            </div>
            <div class="candidate-card-content">
                <span class="candidate-party-name">${cand.party}</span>
                <h4 class="candidate-full-name">${cand.name}</h4>
                <p class="candidate-manifesto">${cand.description}</p>
                <div>
                    ${isVoted ? `
                        <button class="candidate-card-btn" disabled>
                            ✓ Ballot Cast
                        </button>
                    ` : `
                        <button class="candidate-card-btn" onclick="selectCandidate(${cand.id})">
                            ${isSelected ? "✓ Candidate Selected" : "Select Candidate"}
                        </button>
                    `}
                </div>
            </div>
        `;

        if (!isVoted) {
            card.addEventListener("click", (e) => {
                if (e.target.tagName !== "BUTTON") {
                    selectCandidate(cand.id);
                }
            });
        }

        grid.appendChild(card);
    });

    updateStickyActionBar();
}

/**
 * Enforces single candidate selection
 * @param {number|null} candidateId 
 */
function selectCandidate(candidateId) {
    if (!currentUser) {
        showMessage("Please log in to make a selection.", "warning");
        return;
    }

    if (currentUser.hasVoted) {
        showMessage("You have already voted in this election.", "warning");
        return;
    }

    if (candidateId === null) {
        selectedCandidate = null;
    } else {
        const match = candidates.find(c => c.id === candidateId);
        selectedCandidate = match || null;
    }

    renderCandidates();
}

function updateStickyActionBar() {
    const bar = document.getElementById("sticky-vote-action-bar");
    const nameSpan = document.getElementById("bar-selected-name");
    const partySpan = document.getElementById("bar-selected-party");
    const clearBtn = document.getElementById("bar-clear-btn");
    const confirmBtn = document.getElementById("bar-confirm-btn");

    if (!bar) return;

    if (currentUser && currentUser.hasVoted) {
        bar.style.display = "none";
        return;
    }

    if (selectedCandidate) {
        nameSpan.textContent = selectedCandidate.name;
        partySpan.textContent = `${selectedCandidate.party} (${selectedCandidate.symbol})`;
        partySpan.style.display = "inline-block";
        clearBtn.disabled = false;
        confirmBtn.disabled = false;
    } else {
        nameSpan.textContent = "No candidate selected";
        partySpan.style.display = "none";
        clearBtn.disabled = true;
        confirmBtn.disabled = true;
    }
}

// ==========================================================================
// 9. VOTE CONFIRMATION & SUBMISSION
// ==========================================================================

function confirmVote() {
    if (!currentUser) {
        showMessage("Please log in to vote.", "error");
        showSection("login");
        return;
    }

    if (currentUser.hasVoted) {
        showMessage("You have already voted in this election.", "warning");
        return;
    }

    if (!selectedCandidate) {
        showMessage("Please select a candidate first.", "warning");
        return;
    }

    // Populate confirmation modal dialog
    document.getElementById("modal-cand-name").textContent = selectedCandidate.name;
    document.getElementById("modal-cand-party").textContent = selectedCandidate.party;
    document.getElementById("modal-cand-symbol").textContent = selectedCandidate.symbol;
    document.getElementById("modal-cand-image").src = selectedCandidate.image;

    const modal = document.getElementById("confirmation-modal");
    if (modal) {
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
    }
}

function closeConfirmationModal() {
    const modal = document.getElementById("confirmation-modal");
    if (modal) {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
    }
}

function submitVote() {
    if (!currentUser || currentUser.hasVoted || !selectedCandidate) {
        closeConfirmationModal();
        return;
    }

    // 1. Increment candidate vote count
    const target = candidates.find(c => c.id === selectedCandidate.id);
    if (target) {
        target.votes += 1;
    }

    // 2. Mark current user as hasVoted = true
    currentUser.hasVoted = true;

    // Synchronize in voters array
    const record = voters.find(v => v.voterId === currentUser.voterId);
    if (record) record.hasVoted = true;

    // 3. Clear selected candidate (protecting ballot secrecy)
    selectedCandidate = null;

    // 4. Close modal dialog
    closeConfirmationModal();

    // 5. Trigger notification
    showMessage("Vote submitted successfully! Ballot recorded.", "success");

    // 6. Update all dependent views
    renderResults();
    renderAdminDashboard();

    // 7. Transition to dedicated animated Success Screen
    showSection("success");
}

// ==========================================================================
// 10. RESULTS CALCULATION & RENDERING
// ==========================================================================

function calculateResults() {
    const totalVoters = voters.length;
    const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
    const notVoted = Math.max(0, totalVoters - totalVotes);
    const turnoutPct = totalVoters > 0 ? ((totalVotes / totalVoters) * 100).toFixed(1) : "0.0";

    return { totalVoters, totalVotes, notVoted, turnoutPct };
}

function renderResults() {
    const stats = calculateResults();

    // Update KPIs
    const elVoters = document.getElementById("res-total-voters");
    const elVotes = document.getElementById("res-total-votes");
    const elNot = document.getElementById("res-not-voted");
    const elTurnout = document.getElementById("res-turnout-pct");

    if (elVoters) elVoters.textContent = stats.totalVoters.toLocaleString();
    if (elVotes) elVotes.textContent = stats.totalVotes.toLocaleString();
    if (elNot) elNot.textContent = stats.notVoted.toLocaleString();
    if (elTurnout) elTurnout.textContent = `${stats.turnoutPct}%`;

    // Candidate breakdown list
    const container = document.getElementById("candidate-results-container");
    if (!container) return;

    container.innerHTML = "";
    const highestVotes = Math.max(...candidates.map(c => c.votes));

    candidates.forEach(cand => {
        const pct = stats.totalVotes > 0 
            ? ((cand.votes / stats.totalVotes) * 100).toFixed(1) 
            : "0.0";
        const isLeader = stats.totalVotes > 0 && cand.votes === highestVotes;

        const item = document.createElement("div");
        item.className = "candidate-result-item";
        item.innerHTML = `
            <div class="result-meta-row">
                <div class="result-candidate-left">
                    <img src="${cand.image}" alt="${cand.name}" class="result-thumb-img" onerror="this.src='assets/candidate1.jpg'">
                    <div>
                        <div class="result-name-text">
                            ${cand.name}
                            ${isLeader ? `<span class="leading-tag">★ Leading</span>` : ""}
                        </div>
                        <div class="result-party-text">${cand.party} &bull; ${cand.symbol}</div>
                    </div>
                </div>
                <div class="result-stats-right">
                    <span class="result-tally-number">${cand.votes} votes</span>
                    <span class="result-percentage-badge">${pct}%</span>
                </div>
            </div>
            <div class="animated-progress-track">
                <div class="animated-progress-bar ${isLeader ? "leader" : ""}" style="width: ${pct}%;"></div>
            </div>
        `;
        container.appendChild(item);
    });
}

// ==========================================================================
// 11. DEMO ADMIN PANEL & PURE CSS CHARTS
// ==========================================================================

function renderAdminDashboard() {
    const stats = calculateResults();

    const kpiVoters = document.getElementById("admin-kpi-voters");
    const kpiCand = document.getElementById("admin-kpi-candidates");
    const kpiVotes = document.getElementById("admin-kpi-votes");
    const kpiTurnout = document.getElementById("admin-kpi-turnout");

    if (kpiVoters) kpiVoters.textContent = stats.totalVoters.toLocaleString();
    if (kpiCand) kpiCand.textContent = `0${candidates.length}`;
    if (kpiVotes) kpiVotes.textContent = stats.totalVotes.toLocaleString();
    if (kpiTurnout) kpiTurnout.textContent = `${stats.turnoutPct}%`;

    // Pure CSS horizontal bar chart
    const chart = document.getElementById("admin-bar-chart-content");
    if (chart) {
        chart.innerHTML = "";

        candidates.forEach(cand => {
            const pct = stats.totalVotes > 0 
                ? ((cand.votes / stats.totalVotes) * 100).toFixed(1) 
                : "0.0";

            const row = document.createElement("div");
            row.className = "chart-row-item";
            row.innerHTML = `
                <div class="chart-labels-row">
                    <span>${cand.name} <small style="color: var(--text-muted);">(${cand.party})</small></span>
                    <span><strong>${cand.votes}</strong> (${pct}%)</span>
                </div>
                <div class="chart-bar-channel">
                    <div class="chart-bar-fill-bar" style="width: ${Math.max(Number(pct), 5)}%;">
                        ${pct}%
                    </div>
                </div>
            `;
            chart.appendChild(row);
        });
    }

    renderAdminVotersTable();

    const adminHeader = document.querySelector("#admin-section .admin-layout-wrapper");
    if (adminHeader && !document.getElementById("commissioner-logout-btn")) {
        const btn = document.createElement("button");
        btn.id = "commissioner-logout-btn";
        btn.className = "btn btn-sm btn-outline";
        btn.textContent = "Commissioner Logout";
        btn.onclick = logoutCommissioner;
        adminHeader.parentElement.insertBefore(btn, adminHeader);
    }
}

function renderAdminVotersTable(filteredList = null) {
    const tbody = document.getElementById("admin-voters-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    const listToRender = filteredList || voters;

    if (listToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    No registered voters matched your search filter.
                </td>
            </tr>
        `;
        return;
    }

    listToRender.forEach(v => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${v.voterId}</strong></td>
            <td>${v.name}</td>
            <td>${v.age}</td>
            <td>${v.email}</td>
            <td>
                ${v.hasVoted ? `
                    <span class="badge-voted-pill">✓ Voted</span>
                ` : `
                    <span class="badge-unvoted-pill">● Not Voted</span>
                `}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterAdminVoters() {
    const input = document.getElementById("voter-search-input");
    if (!input) return;

    const query = input.value.trim().toLowerCase();
    if (!query) {
        renderAdminVotersTable(voters);
        return;
    }

    const filtered = voters.filter(v => 
        v.name.toLowerCase().includes(query) || 
        v.voterId.toLowerCase().includes(query) ||
        v.email.toLowerCase().includes(query)
    );

    renderAdminVotersTable(filtered);
}

function switchAdminTab(tabName, btn) {
    const items = document.querySelectorAll(".admin-nav-item");
    items.forEach(i => i.classList.remove("active"));
    if (btn) btn.classList.add("active");

    if (tabName === "voters") {
        const input = document.getElementById("voter-search-input");
        if (input) input.scrollIntoView({ behavior: "smooth" });
    } else if (tabName === "candidates") {
        const chart = document.getElementById("admin-bar-chart-content");
        if (chart) chart.scrollIntoView({ behavior: "smooth" });
    } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

function resetDemoData() {
    if (confirm("Reset all session votes and registered voters to default demo values?")) {
        candidates = JSON.parse(JSON.stringify(initialCandidatesList));
        voters = generateVotersRegistry();
        currentUser = null;
        selectedCandidate = null;
        commissionerLoggedIn = false;

        updateNavbarSession();
        renderResults();
        renderAdminDashboard();
        showSection("home");

        showMessage("Demo session data reset to initial values.", "info");
    }
}

// ==========================================================================
// 12. TOAST NOTIFICATIONS & VALIDATION HELPERS
// ==========================================================================

function showMessage(text, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-message ${type}`;

    let iconGlyph = "ℹ️";
    if (type === "success") iconGlyph = "✓";
    else if (type === "error") iconGlyph = "✕";
    else if (type === "warning") iconGlyph = "⚠";

    toast.innerHTML = `
        <span class="toast-icon-glyph">${iconGlyph}</span>
        <span class="toast-body-text">${text}</span>
        <button class="toast-dismiss" onclick="this.parentElement.remove()" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add("toast-exit");
            setTimeout(() => toast.remove(), 300);
        }
    }, 4500);
}

function setFieldError(id, msg) {
    const input = document.getElementById(id);
    const err = document.getElementById(`${id}-error`);
    if (input) input.classList.add("is-invalid");
    if (err) err.textContent = msg;
}

function clearInlineErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.querySelectorAll(".input-control").forEach(i => i.classList.remove("is-invalid"));
    form.querySelectorAll(".field-error-text").forEach(e => e.textContent = "");
}

function showFormAlert(el, msg, cls) {
    if (!el) return;
    el.textContent = msg;
    el.className = `form-banner-alert ${cls}`;
    el.style.display = "flex";
}
