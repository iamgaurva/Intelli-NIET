const TAB_TITLES = {
    dashboard: "Admin Dashboard",
    complaints: "All Complaints",
    pending: "Pending Action",
    analytics: "Analytics",
    notifications: "Notifications",
    profile: "Profile"
};

const ADMIN_PROFILE_KEY = "intell_niet_profile_admin";
const ADMIN_NOTIF_MUTE_KEY = "intell_niet_notif_mute_admin";

let allComplaints = [];

// ======================================================
// LOAD COMPLAINTS FROM BACKEND
// ======================================================

async function loadAdminComplaints() {
    try {
        const response = await fetch("/api/complaints/all");

        if (response.status === 401) {
            window.location.href = "/login.html";
            return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load complaints");
        }

        allComplaints = data.complaints || [];

        updateDashboardStats();
        renderAdminComplaints(allComplaints);
        renderRecentComplaints();
        renderPendingComplaints();
        updateNavigationBadges();

        console.log("Live complaints loaded:", allComplaints);

    } catch (error) {
        console.error("Admin complaint loading error:", error);

        showToast(
            "Unable to connect to server.",
            "error"
        );
    }
}
async function deleteAdminComplaint(complaintId) {
    const confirmed = confirm(
        `Are you sure you want to delete complaint ${complaintId}?`
    );

    if (!confirmed) {
        return;
    }

    try {
        showToast('Deleting complaint...', 'info');

        const response = await fetch(
            `/api/complaints/${encodeURIComponent(complaintId)}`,
            {
                method: 'DELETE'
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        if (response.status === 403) {
            showToast('You are not allowed to delete this complaint.', 'error');
            return;
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Unable to delete complaint');
        }

        showToast('Complaint deleted successfully.', 'success');

        await loadAdminComplaints();

    } catch (error) {
        console.error('Delete complaint error:', error);

        showToast(
            error.message || 'Unable to delete complaint.',
            'error'
        );
    }
}


// ======================================================
// DASHBOARD STATS
// ======================================================

function updateDashboardStats() {

    const total = allComplaints.length;

    const pending = allComplaints.filter(c =>
        c.status === "SUBMITTED" ||
        c.status === "IN_PROGRESS" ||
        c.status === "REOPENED"
    ).length;

    const resolved = allComplaints.filter(c =>
        c.status === "RESOLVED" ||
        c.status === "CLOSED"
    ).length;

    const delayed = allComplaints.filter(c =>
        c.status === "DELAYED"
    ).length;

    const statValues = document.querySelectorAll(
        ".big-stat .bs-val"
    );

    if (statValues.length >= 4) {
        statValues[0].textContent = total;
        statValues[1].textContent = pending;
        statValues[2].textContent = resolved;
        statValues[3].textContent = delayed;
    }
}


// ======================================================
// NAVIGATION BADGES
// ======================================================

function updateNavigationBadges() {

    const pendingCount = allComplaints.filter(c =>
        c.status === "SUBMITTED" ||
        c.status === "IN_PROGRESS" ||
        c.status === "REOPENED"
    ).length;

    const complaintBadge =
        document.querySelector("#nav-complaints .nav-badge-orange");

    const pendingBadge =
        document.querySelector("#nav-pending .nav-badge-yellow");

    if (complaintBadge) {
        complaintBadge.textContent = allComplaints.length;
    }

    if (pendingBadge) {
        pendingBadge.textContent = pendingCount;
    }
}


// ======================================================
// ALL COMPLAINTS TABLE
// ======================================================

function renderAdminComplaints(complaints) {

    const tbody = document.querySelector(
        "#all-complaints-table tbody"
    );

    if (!tbody) return;

    tbody.innerHTML = "";

    if (complaints.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="9"
                    style="text-align:center;color:var(--muted);padding:30px;">
                    No complaints found.
                </td>
            </tr>
        `;

        return;
    }

    complaints.forEach(complaint => {

        const statusClass = {
            SUBMITTED: "b-submitted",
            IN_PROGRESS: "b-progress",
            RESOLVED: "b-resolved",
            CLOSED: "b-closed",
            REOPENED: "b-reopened",
            DELAYED: "b-delayed"
        };

        const priorityClass = {
            HIGH: "p-high",
            MEDIUM: "p-medium",
            LOW: "p-low",
            URGENT: "p-high"
        };

        const date = new Date(
            complaint.createdAt
        ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        const reporter =
            complaint.faculty?.name || "Unknown Faculty";

        const location = [
            complaint.block,
            complaint.floor,
            complaint.room
        ]
            .filter(Boolean)
            .join(", ");

        const row = document.createElement("tr");

        row.dataset.status =
            complaint.status.toLowerCase();

        row.innerHTML = `
            <td style="color:var(--muted);font-size:12px;">
                ${complaint.complaintId}
            </td>

            <td>
                ${complaint.title}
            </td>

            <td style="color:var(--muted);">
                ${complaint.category}
            </td>

            <td style="font-size:12px;color:var(--muted);">
                ${location}
            </td>

            <td style="color:var(--muted);">
                ${reporter}
            </td>

            <td>
                <span class="badge ${statusClass[complaint.status] || "b-submitted"
            }">
                    ${complaint.status.replace(/_/g, " ")}
                </span>
            </td>

            <td>
                <span class="pri-dot ${priorityClass[complaint.priority] || "p-medium"
            }">
                    ${complaint.priority}
                </span>
            </td>

            <td style="color:var(--muted);font-size:13px;">
                ${date}
            </td>

            <td>
                <div class="action-btns">

                   <button
    class="action-btn ab-view"
    onclick="viewComplaint('${complaint.complaintId}')">
    View
</button>

<button
    class="action-btn"
    style="color: var(--accent);"
    onclick="deleteAdminComplaint('${complaint.complaintId}')">
    Delete
</button>

                    ${complaint.status === "SUBMITTED" ||
                complaint.status === "REOPENED"
                ? `
                        <button
                            class="action-btn ab-update"
                            onclick="openUpdateModal('${complaint.complaintId}')">
                            Update
                        </button>
                        `
                : ""
            }

                    ${complaint.status === "IN_PROGRESS"
                ? `
                        <button
                            class="action-btn ab-resolve"
                            onclick="openResolveModal('${complaint.complaintId}')">
                            Resolve
                        </button>
                        `
                : ""
            }

                    ${complaint.status === "IN_PROGRESS"
                ? `
                        <button
                            class="action-btn ab-delay"
                            onclick="openDelayModal('${complaint.complaintId}')">
                            Delay
                        </button>
                        `
                : ""
            }

                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
}


// ======================================================
// RECENT COMPLAINTS
// ======================================================

function renderRecentComplaints() {

    const dashboard =
        document.querySelector("#tab-dashboard");

    if (!dashboard) return;

    const tables =
        dashboard.querySelectorAll("table");

    if (!tables.length) return;

    const tbody =
        tables[0].querySelector("tbody");

    if (!tbody) return;

    tbody.innerHTML = "";

    const recent =
        [...allComplaints]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 5);

    recent.forEach(complaint => {

        const statusClass = {
            SUBMITTED: "b-submitted",
            IN_PROGRESS: "b-progress",
            RESOLVED: "b-resolved",
            CLOSED: "b-closed",
            REOPENED: "b-reopened",
            DELAYED: "b-delayed"
        };

        const priorityClass = {
            HIGH: "p-high",
            MEDIUM: "p-medium",
            LOW: "p-low",
            URGENT: "p-high"
        };

        const reporter =
            complaint.faculty?.name ||
            "Unknown Faculty";

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td style="color:var(--muted);font-size:12px;">
                ${complaint.complaintId}
            </td>

            <td>
                ${complaint.title}
            </td>

            <td style="color:var(--muted);">
                ${reporter}
            </td>

            <td>
                <span class="badge ${statusClass[complaint.status] ||
            "b-submitted"
            }">
                    ${complaint.status.replace(/_/g, " ")}
                </span>
            </td>

            <td>
                <span class="pri-dot ${priorityClass[complaint.priority] ||
            "p-medium"
            }">
                    ${complaint.priority}
                </span>
            </td>

            <td>
                <div class="action-btns">

                    <button
                        class="action-btn ab-view"
                        onclick="viewComplaint('${complaint.complaintId}')">
                        View
                    </button>

                    ${complaint.status === "IN_PROGRESS"
                ? `
                        <button
                            class="action-btn ab-resolve"
                            onclick="openResolveModal('${complaint.complaintId}')">
                            Resolve
                        </button>
                        `
                : ""
            }

                    ${complaint.status === "SUBMITTED" ||
                complaint.status === "REOPENED"
                ? `
                        <button
                            class="action-btn ab-update"
                            onclick="openUpdateModal('${complaint.complaintId}')">
                            Update
                        </button>
                        `
                : ""
            }

                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
}


// ======================================================
// PENDING ACTION TABLE
// ======================================================

function renderPendingComplaints() {

    const tbody =
        document.querySelector(
            "#tab-pending table tbody"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    const pending =
        allComplaints.filter(c =>
            c.status === "SUBMITTED" ||
            c.status === "IN_PROGRESS" ||
            c.status === "REOPENED"
        );

    if (pending.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center;color:var(--muted);padding:30px;">
                    No pending complaints.
                </td>
            </tr>
        `;

        return;
    }

    pending.forEach(complaint => {

        const reporter =
            complaint.faculty?.name ||
            "Unknown Faculty";

        const date =
            new Date(
                complaint.createdAt
            ).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });

        const statusClass = {
            SUBMITTED: "b-submitted",
            IN_PROGRESS: "b-progress",
            REOPENED: "b-reopened"
        };

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td style="color:var(--muted);font-size:12px;">
                ${complaint.complaintId}
            </td>

            <td>
                ${complaint.title}
            </td>

            <td style="color:var(--muted);">
                ${complaint.category}
            </td>

            <td style="color:var(--muted);">
                ${reporter}
            </td>

            <td>
                <span class="badge ${statusClass[complaint.status] ||
            "b-submitted"
            }">
                    ${complaint.status.replace(/_/g, " ")}
                </span>
            </td>

            <td style="color:var(--muted);font-size:13px;">
                ${date}
            </td>

            <td>
                <div class="action-btns">

                    ${complaint.status === "IN_PROGRESS"
                ? `
                        <button
                            class="action-btn ab-resolve"
                            onclick="openResolveModal('${complaint.complaintId}')">
                            Mark Resolved
                        </button>

                        <button
                            class="action-btn ab-delay"
                            onclick="openDelayModal('${complaint.complaintId}')">
                            Mark Delay
                        </button>
                        `
                : ""
            }

                    ${complaint.status === "SUBMITTED" ||
                complaint.status === "REOPENED"
                ? `
                        <button
                            class="action-btn ab-update"
                            onclick="openUpdateModal('${complaint.complaintId}')">
                            Update Status
                        </button>
                        `
                : ""
            }

                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
}


// ======================================================
// VIEW COMPLAINT
// ======================================================

function viewComplaint(id) {

    const complaint =
        allComplaints.find(
            c => c.complaintId === id
        );

    if (!complaint) {
        showToast(
            "Complaint not found.",
            "error"
        );
        return;
    }

    const date =
        new Date(
            complaint.createdAt
        ).toLocaleString("en-IN");

    openDetailModal(
        complaint.complaintId,
        complaint.title,
        complaint.category,
        complaint.status,
        complaint.priority,
        date,
        complaint.description,
        complaint.block,
        complaint.floor || "-",
        complaint.room || "-"
    );
}


// ======================================================
// SEARCH
// ======================================================

function searchComplaints(query) {

    const q =
        query.toLowerCase().trim();

    const filtered =
        allComplaints.filter(complaint => {

            const location = `
                ${complaint.block}
                ${complaint.floor || ""}
                ${complaint.room || ""}
            `;

            const reporter =
                complaint.faculty?.name || "";

            const text = `
                ${complaint.complaintId}
                ${complaint.title}
                ${complaint.category}
                ${location}
                ${reporter}
                ${complaint.status}
                ${complaint.priority}
            `.toLowerCase();

            return text.includes(q);
        });

    renderAdminComplaints(filtered);
}


// ======================================================
// FILTER
// ======================================================

function filterByStatus(status) {

    if (status === "all") {
        renderAdminComplaints(allComplaints);
        return;
    }

    const filtered =
        allComplaints.filter(
            complaint =>
                complaint.status.toLowerCase() === status
        );

    renderAdminComplaints(filtered);
}


// ======================================================
// TAB NAVIGATION
// ======================================================

function switchTab(tab) {

    document
        .querySelectorAll(".tab-pane")
        .forEach(p =>
            p.classList.remove("active")
        );

    document
        .querySelectorAll(".nav-item")
        .forEach(n =>
            n.classList.remove("active")
        );

    const pane =
        document.getElementById(
            "tab-" + tab
        );

    if (pane) {
        pane.classList.add("active");
    }

    const navEl =
        document.getElementById(
            "nav-" + tab
        );

    if (navEl) {
        navEl.classList.add("active");
    }

    const title =
        document.getElementById(
            "topbar-title"
        );

    if (title) {
        title.textContent =
            TAB_TITLES[tab] ||
            "Dashboard";
    }

    if (
        tab === "complaints" ||
        tab === "dashboard" ||
        tab === "pending"
    ) {
        loadAdminComplaints();
    }
}


// ======================================================
// PROFILE
// ======================================================

function initialsFromName(name) {

    const parts =
        (name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!parts.length) return "AD";

    if (parts.length === 1) {
        return parts[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();
}


function loadAdminProfile() {

    try {

        const raw =
            localStorage.getItem(
                ADMIN_PROFILE_KEY
            );

        return raw
            ? JSON.parse(raw)
            : null;

    } catch {

        return null;
    }
}


function applyAdminProfileToUI() {

    const p =
        loadAdminProfile();

    const name =
        p?.name?.trim() ||
        "Administrator";

    const nameEl =
        document.getElementById(
            "sidebar-display-name"
        );

    const avatarEl =
        document.getElementById(
            "sidebar-avatar"
        );

    if (nameEl) {
        nameEl.textContent = name;
    }

    if (avatarEl) {
        avatarEl.textContent =
            initialsFromName(name);
    }

    const fields = {
        "adm-pf-name": p?.name || "",
        "adm-pf-phone": p?.phone || "",
        "adm-pf-role": p?.role || "",
        "adm-pf-email": p?.email || ""
    };

    Object.entries(fields).forEach(
        ([id, value]) => {

            const el =
                document.getElementById(id);

            if (el) {
                el.value = value;
            }
        }
    );
}


function saveAdminProfile() {

    const data = {

        name:
            document
                .getElementById("adm-pf-name")
                .value
                .trim(),

        phone:
            document
                .getElementById("adm-pf-phone")
                .value
                .trim(),

        role:
            document
                .getElementById("adm-pf-role")
                .value
                .trim(),

        email:
            document
                .getElementById("adm-pf-email")
                .value
                .trim()
    };

    if (!data.name) {

        showToast(
            "Please enter your name.",
            "error"
        );

        return;
    }

    localStorage.setItem(
        ADMIN_PROFILE_KEY,
        JSON.stringify(data)
    );

    applyAdminProfileToUI();

    showToast(
        "Profile saved.",
        "success"
    );
}


// ======================================================
// NOTIFICATIONS
// ======================================================

function getAdminNotifMuted() {

    return localStorage.getItem(
        ADMIN_NOTIF_MUTE_KEY
    ) === "1";
}


function setAdminNotifMutedUI(muted) {

    const list =
        document.getElementById(
            "admin-notif-list"
        );

    const banner =
        document.getElementById(
            "notif-muted-banner"
        );

    const btn =
        document.getElementById(
            "btn-mute-notif"
        );

    const dot =
        document.getElementById(
            "topbar-notif-dot"
        );

    if (list) {
        list.classList.toggle(
            "notif-muted",
            muted
        );
    }

    if (banner) {
        banner.classList.toggle(
            "show",
            muted
        );
    }

    if (btn) {
        btn.textContent =
            muted
                ? "Unmute notifications"
                : "Mute notifications";
    }

    if (dot) {
        dot.style.opacity =
            muted ? "0.25" : "";
    }
}


function toggleMuteNotifications() {

    const next =
        !getAdminNotifMuted();

    localStorage.setItem(
        ADMIN_NOTIF_MUTE_KEY,
        next ? "1" : "0"
    );

    setAdminNotifMutedUI(next);

    showToast(
        next
            ? "Notifications muted."
            : "Notifications on.",
        "info"
    );
}


// ======================================================
// MODALS
// ======================================================

const STATUS_CLASS = {
    IN_PROGRESS: "b-progress",
    SUBMITTED: "b-submitted",
    CLOSED: "b-closed",
    REOPENED: "b-reopened",
    RESOLVED: "b-resolved",
    DELAYED: "b-delayed"
};

const PRI_CLASS = {
    HIGH: "p-high",
    MEDIUM: "p-medium",
    LOW: "p-low",
    URGENT: "p-high"
};


function openDetailModal(
    id,
    title,
    cat,
    status,
    priority,
    date,
    desc,
    block,
    floor,
    room
) {

    document.getElementById(
        "dm-title"
    ).textContent = title;

    document.getElementById(
        "dm-id"
    ).textContent =
        id + " · Reported " + date;

    document.getElementById(
        "dm-status"
    ).innerHTML = `
        <span class="badge ${STATUS_CLASS[status] ||
        "b-submitted"
        }">
            ${status.replace(/_/g, " ")}
        </span>
    `;

    document.getElementById(
        "dm-priority"
    ).innerHTML = `
        <span class="pri-dot ${PRI_CLASS[priority] ||
        "p-medium"
        }">
            ${priority}
        </span>
    `;

    document.getElementById(
        "dm-cat"
    ).textContent = cat;

    document.getElementById(
        "dm-loc"
    ).textContent =
        `Block ${block}, Floor ${floor}, Room ${room}`;

    document.getElementById(
        "dm-desc"
    ).textContent = desc;

    document.getElementById(
        "dm-timeline"
    ).innerHTML = `
        <div class="tstep">

            <div class="tstep-dot active">
                1
            </div>

            <div class="tstep-info">

                <div class="ts-title">
                    ${status.replace(/_/g, " ")}
                    <span
                        style="font-size:11px;color:var(--muted);margin-left:8px;">
                        by ${status === "SUBMITTED"
            ? "Faculty"
            : "Admin"
        }
                    </span>
                </div>

                <div class="ts-time">
                    ${date}
                </div>

                <div class="ts-remark">
                    Complaint status:
                    ${status.replace(/_/g, " ")}
                </div>

            </div>
        </div>
    `;

    const footer =
        document.getElementById(
            "dm-footer"
        );

    footer.innerHTML = `
        <button
            class="btn-sm btn-outline"
            onclick="closeModal('detail-modal')">
            Close
        </button>
    `;

    if (
        status === "SUBMITTED" ||
        status === "REOPENED"
    ) {

        footer.innerHTML += `
            <button
                class="btn-sm"
                style="background:var(--accent);color:white;border:none;"
                onclick="closeModal('detail-modal');openUpdateModal('${id}')">
                Update Status
            </button>
        `;
    }

    if (status === "IN_PROGRESS") {

        footer.innerHTML += `
            <button
                class="btn-sm"
                style="background:rgba(34,197,94,0.2);color:var(--green);border:none;"
                onclick="closeModal('detail-modal');openResolveModal('${id}')">
                Mark Resolved
            </button>
        `;
    }

    document
        .getElementById("detail-modal")
        .classList.add("open");
}


function openUpdateModal(id) {
    document.getElementById('um-id').textContent = id;
    document.getElementById('update-modal').classList.add('open');
}


function openResolveModal(id) {

    document.getElementById(
        "rm-id"
    ).textContent = id;

    document
        .getElementById("resolve-modal")
        .classList.add("open");
}


function openDelayModal(id) {

    document.getElementById(
        "dlm-id"
    ).textContent = id;

    document
        .getElementById("delay-modal")
        .classList.add("open");
}


function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {
        modal.classList.remove("open");
    }
}


// ======================================================
// LOGOUT
// ======================================================

function doLogout() {

    showToast(
        "Signed out successfully",
        "info"
    );

    setTimeout(() => {

        window.location.href =
            "/login.html";

    }, 700);
}


// ======================================================
// CONTACT
// ======================================================

function openContact() {

    window.open(
        "https://www.niet.co.in/contact-us",
        "_blank",
        "noopener,noreferrer"
    );
}


// ======================================================
// TOAST
// ======================================================

function showToast(
    msg,
    type = "info"
) {

    const t =
        document.getElementById("toast");

    if (!t) return;

    t.textContent = msg;

    t.className =
        "toast " + type + " show";

    setTimeout(
        () =>
            t.classList.remove("show"),
        3200
    );
}


// ======================================================
// INITIAL LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        applyAdminProfileToUI();

        setAdminNotifMutedUI(
            getAdminNotifMuted()
        );

        loadAdminComplaints();
    }
);
async function updateComplaintStatus() {
    const complaintId = document.getElementById('um-id').textContent.trim();

    const status = document.getElementById('um-status').value;

    if (!complaintId || !status) {
        showToast('Please select a status.', 'error');
        return;
    }

    try {
        const response = await fetch(
            `/api/complaints/${complaintId}/status`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: status
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || 'Unable to update status'
            );
        }

        showToast(
            'Complaint status updated successfully!',
            'success'
        );

        closeModal('update-modal');

        // Reload complaints from MongoDB
        await loadAdminComplaints();

    } catch (error) {
        console.error('Status update error:', error);

        showToast(
            error.message || 'Unable to update complaint status.',
            'error'
        );
    }
}
async function updateComplaintStatus() {
    const complaintId = document.getElementById('um-id').textContent.trim();
    const status = document.getElementById('um-status').value;

    console.log("Updating:", complaintId, status);

    if (!complaintId || !status) {
        showToast('Please select a status.', 'error');
        return;
    }

    try {
        const response = await fetch(
            `/api/complaints/${complaintId}/status`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: status
                })
            }
        );

        const data = await response.json();

        console.log("Server response:", data);

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Unable to update status');
        }

        closeModal('update-modal');

        showToast(
            'Complaint status updated successfully!',
            'success'
        );

        await loadAdminComplaints();

    } catch (error) {
        console.error('Status update error:', error);

        showToast(
            error.message || 'Unable to update complaint status.',
            'error'
        );
    }
}
async function resolveComplaint() {
    const complaintId = document.getElementById('rm-id').textContent.trim();

    if (!complaintId) {
        showToast('Complaint ID not found.', 'error');
        return;
    }

    try {
        const response = await fetch(
            `/api/complaints/${complaintId}/status`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'RESOLVED'
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || 'Unable to resolve complaint'
            );
        }

        closeModal('resolve-modal');

        showToast(
            'Complaint marked as resolved!',
            'success'
        );

        await loadAdminComplaints();

    } catch (error) {
        console.error('Resolve complaint error:', error);

        showToast(
            error.message || 'Unable to resolve complaint.',
            'error'
        );
    }
}
async function downloadAnalyticsPdf() {
    try {
        if (!allComplaints || allComplaints.length === 0) {
            await loadAdminComplaints();
        }

        if (!allComplaints || allComplaints.length === 0) {
            showToast('No complaint data available.', 'error');
            return;
        }

        const fromDateValue = document.getElementById('analytics-from-date')?.value;
        const toDateValue = document.getElementById('analytics-to-date')?.value;

        let filteredComplaints = [...allComplaints];

        if (fromDateValue) {
            const fromDate = new Date(`${fromDateValue}T00:00:00`);

            filteredComplaints = filteredComplaints.filter(complaint => {
                return new Date(complaint.createdAt) >= fromDate;
            });
        }

        if (toDateValue) {
            const toDate = new Date(`${toDateValue}T23:59:59`);

            filteredComplaints = filteredComplaints.filter(complaint => {
                return new Date(complaint.createdAt) <= toDate;
            });
        }

        if (fromDateValue && toDateValue) {
            const fromDate = new Date(`${fromDateValue}T00:00:00`);
            const toDate = new Date(`${toDateValue}T23:59:59`);

            if (fromDate > toDate) {
                showToast('From date cannot be after To date.', 'error');
                return;
            }
        }

        if (filteredComplaints.length === 0) {
            showToast('No complaints found for the selected date range.', 'error');
            return;
        }

        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            showToast('Please allow pop-ups to download the report.', 'error');
            return;
        }

        const formatDate = (dateValue) => {
            if (!dateValue) {
                return 'All dates';
            }

            return new Date(`${dateValue}T00:00:00`)
                .toLocaleDateString('en-IN');
        };

        const dateRange = fromDateValue || toDateValue
            ? `${formatDate(fromDateValue)} - ${formatDate(toDateValue)}`
            : 'All dates';

        const rows = filteredComplaints.map(complaint => `
            <tr>
                <td>${complaint.complaintId}</td>
                <td>${complaint.title}</td>
                <td>${complaint.category}</td>
                <td>${complaint.priority}</td>
                <td>${complaint.block}</td>
                <td>${complaint.floor || '-'}</td>
                <td>${complaint.room || '-'}</td>
                <td>${complaint.faculty?.name || '-'}</td>
                <td>${complaint.status.replace(/_/g, ' ')}</td>
                <td>${new Date(complaint.createdAt).toLocaleDateString('en-IN')}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Intelli-NIET Complaint Report</title>

                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 30px;
                        color: #222;
                    }

                    h1 {
                        margin-bottom: 5px;
                    }

                    .subtitle {
                        color: #666;
                        margin-bottom: 10px;
                    }

                    .date-range {
                        color: #333;
                        font-weight: bold;
                        margin-bottom: 25px;
                    }

                    .summary {
                        display: flex;
                        gap: 30px;
                        margin-bottom: 25px;
                    }

                    .summary-box {
                        border: 1px solid #ddd;
                        padding: 12px 18px;
                        border-radius: 6px;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 10px;
                    }

                    th {
                        background: #f2f2f2;
                        font-weight: bold;
                    }

                    th, td {
                        border: 1px solid #ccc;
                        padding: 7px;
                        text-align: left;
                    }

                    @media print {
                        body {
                            padding: 10px;
                        }

                        button {
                            display: none;
                        }
                    }
                </style>
            </head>

            <body>

                <h1>Intelli-NIET Complaint Report</h1>

                <div class="subtitle">
                    Generated on ${new Date().toLocaleString('en-IN')}
                </div>

                <div class="date-range">
                    Report Date Range: ${dateRange}
                </div>

                <div class="summary">

                    <div class="summary-box">
                        <strong>Total Complaints</strong><br>
                        ${filteredComplaints.length}
                    </div>

                    <div class="summary-box">
                        <strong>Submitted</strong><br>
                        ${filteredComplaints.filter(c => c.status === 'SUBMITTED').length}
                    </div>

                    <div class="summary-box">
                        <strong>In Progress</strong><br>
                        ${filteredComplaints.filter(c => c.status === 'IN_PROGRESS').length}
                    </div>

                    <div class="summary-box">
                        <strong>Resolved</strong><br>
                        ${filteredComplaints.filter(c => c.status === 'RESOLVED').length}
                    </div>

                </div>

                <table>

                    <thead>
                        <tr>
                            <th>Complaint ID</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Block</th>
                            <th>Floor</th>
                            <th>Room</th>
                            <th>Faculty</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>

                <br>

                <button onclick="window.print()">
                    Print / Save as PDF
                </button>

            </body>
            </html>
        `);

        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };

    } catch (error) {
        console.error('PDF download error:', error);

        showToast(
            'Unable to generate PDF report.',
            'error'
        );
    }
}