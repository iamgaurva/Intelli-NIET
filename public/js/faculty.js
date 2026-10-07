
/* ══════════════════════════════════════
   TAB NAVIGATION
══════════════════════════════════════ */
const TAB_TITLES = {
    home: 'Dashboard Overview',
    report: 'Report New Issue',
    complaints: 'My Complaints',
    notifications: 'Notifications',
    profile: 'Profile',
};

const PROFILE_STORAGE_KEY = 'intell_niet_profile_faculty';
const NOTIF_MUTE_KEY = 'intell_niet_notif_mute_faculty';

function initialsFromName(name) {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function loadFacultyProfile() {
    try {
        const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function applyFacultyProfileToUI() {
    const p = loadFacultyProfile();

    // Get the currently logged-in faculty user
    let loggedInUser = null;

    try {
        loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    } catch (error) {
        console.error('Unable to read logged-in user:', error);
    }

    // Use logged-in user's name
    const name =
        loggedInUser?.name ||
        p?.name ||
        'Faculty';

    // Decide greeting based on current time
    const hour = new Date().getHours();

    let greeting;

    if (hour < 12) {
        greeting = 'Good Morning';
    } else if (hour < 18) {
        greeting = 'Good Afternoon';
    } else {
        greeting = 'Good Evening';
    }

    // Sidebar name
    const sidebarName = document.getElementById('sidebar-display-name');

    if (sidebarName) {
        sidebarName.textContent = name;
    }

    // Welcome name
    const welcomeName = document.getElementById('welcome-display-name');

    if (welcomeName) {
        welcomeName.textContent = name;
    }

    // Greeting
    const greetingElement = document.getElementById('welcome-greeting');

    if (greetingElement) {
        greetingElement.textContent = greeting;
    }

    // Avatar initials
    const avatar = document.getElementById('sidebar-avatar');

    if (avatar) {
        avatar.textContent = initialsFromName(name);
    }

    // Profile fields
    const pfName = document.getElementById('pf-name');
    const pfPhone = document.getElementById('pf-phone');
    const pfDept = document.getElementById('pf-dept');
    const pfEmail = document.getElementById('pf-email');

    if (pfName) {
        pfName.value = p?.name || loggedInUser?.name || '';
    }

    if (pfPhone) {
        pfPhone.value = p?.phone || '';
    }

    if (pfDept) {
        pfDept.value = p?.dept || '';
    }

    if (pfEmail) {
        pfEmail.value = p?.email || loggedInUser?.email || '';
    }
}

function saveFacultyProfile() {
    const data = {
        name: document.getElementById('pf-name').value.trim(),
        phone: document.getElementById('pf-phone').value.trim(),
        dept: document.getElementById('pf-dept').value.trim(),
        email: document.getElementById('pf-email').value.trim(),
    };
    if (!data.name) {
        showToast('Please enter your name.', 'error');
        return;
    }
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
    applyFacultyProfileToUI();
    showToast('Profile saved.', 'success');
}

function getNotifMuted() {
    return localStorage.getItem(NOTIF_MUTE_KEY) === '1';
}

function setNotifMutedUI(muted) {
    const list = document.getElementById('faculty-notif-list');
    const banner = document.getElementById('notif-muted-banner');
    const btn = document.getElementById('btn-mute-notif');
    const dot = document.getElementById('topbar-notif-dot');
    if (list) list.classList.toggle('notif-muted', muted);
    if (banner) banner.classList.toggle('show', muted);
    if (btn) btn.textContent = muted ? 'Unmute notifications' : 'Mute notifications';
    if (dot) dot.style.opacity = muted ? '0.25' : '';
}

function toggleMuteNotifications() {
    const next = !getNotifMuted();
    localStorage.setItem(NOTIF_MUTE_KEY, next ? '1' : '0');
    setNotifMutedUI(next);
    showToast(next ? 'Notifications muted.' : 'Notifications on.', 'info');
}

function switchTab(tab) {
    // hide all panes & deactivate all nav items
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById('tab-' + tab).classList.add('active');
    const navEl = document.getElementById('nav-' + tab);
    if (navEl) navEl.classList.add('active');
    document.getElementById('topbar-title').textContent = TAB_TITLES[tab] || 'Dashboard';
}

/* ══════════════════════════════════════
   REPORT FORM
══════════════════════════════════════ */
function checkCustomCat() {
    const v = document.getElementById('issue-category').value;
    document.getElementById('custom-cat-field').style.display = v === 'other' ? 'flex' : 'none';
}

function setPriority(el, level) {
    document.querySelectorAll('.pri-btn').forEach(b => b.classList.remove('sel'));
    el.classList.add('sel');
}

function resetForm() {
    document.querySelectorAll('#tab-report input, #tab-report select, #tab-report textarea').forEach(el => el.value = '');
    document.getElementById('preview-grid').innerHTML = '';
    uploadedImages = [];
    document.querySelectorAll('.pri-btn').forEach(b => b.classList.remove('sel'));
    document.querySelector('.pri-btn.medium').classList.add('sel');
    showToast('Form reset', 'info');
}

async function submitComplaint() {
    const title = document.getElementById('f-title').value.trim();
    const category = document.getElementById('issue-category').value;
    const description = document.getElementById('f-desc').value.trim();
    const block = document.getElementById('f-block').value;
    const floor = document.getElementById('f-floor').value;
    const room = document.getElementById('f-room').value.trim();

    // Get selected priority
    const selectedPriority = document.querySelector('.pri-btn.sel');

    let priority = 'MEDIUM';

    if (selectedPriority) {
        if (selectedPriority.classList.contains('low')) {
            priority = 'LOW';
        } else if (selectedPriority.classList.contains('medium')) {
            priority = 'MEDIUM';
        } else if (selectedPriority.classList.contains('high')) {
            priority = 'HIGH';
        }
    }

    if (!title || !category || !description || !block) {
        showToast('Please fill in the required fields.', 'error');
        return;
    }

    try {
        showToast('Submitting complaint...', 'info');

        const response = await fetch('/api/complaints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                category,
                priority,
                block,
                floor,
                room,
                description
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            showToast(data.message || 'Unable to submit complaint.', 'error');
            return;
        }

        showToast(
            `Complaint submitted! ID: ${data.complaint.complaintId}`,
            'success'
        );

        resetForm();

        setTimeout(() => {
            switchTab('complaints');
        }, 1400);

    } catch (error) {
        console.error('Complaint submission error:', error);
        showToast('Unable to connect to the server.', 'error');
    }
}

/* ══════════════════════════════════════
   IMAGE / CAMERA
══════════════════════════════════════ */
let uploadedImages = [];
let cameraStream = null;

function handleFileUpload(e) {
    Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = ev => addPreview(ev.target.result);
        reader.readAsDataURL(file);
    });
}

function addPreview(src) {
    uploadedImages.push(src);
    const grid = document.getElementById('preview-grid');
    const idx = uploadedImages.length - 1;
    const div = document.createElement('div');
    div.className = 'preview-item';
    div.innerHTML = `<img src="${src}" alt="preview"><button onclick="removePreview(this,${idx})">×</button>`;
    grid.appendChild(div);
}

function removePreview(btn, idx) {
    uploadedImages.splice(idx, 1);
    btn.parentElement.remove();
}

async function startCamera() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const vid = document.getElementById('camera-feed');
        vid.srcObject = cameraStream;
        vid.style.display = 'block';
        document.getElementById('camera-controls').style.display = 'flex';
    } catch (e) {
        showToast('Camera access denied or unavailable.', 'error');
    }
}

function capturePhoto() {
    const vid = document.getElementById('camera-feed');
    const canvas = document.getElementById('snap-canvas');
    canvas.width = vid.videoWidth;
    canvas.height = vid.videoHeight;
    canvas.getContext('2d').drawImage(vid, 0, 0);
    addPreview(canvas.toDataURL('image/jpeg'));
    stopCamera();
    showToast('Photo captured!', 'success');
}

function stopCamera() {
    if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
    document.getElementById('camera-feed').style.display = 'none';
    document.getElementById('camera-controls').style.display = 'none';
    cameraStream = null;
}

/* ══════════════════════════════════════
   LOAD REAL COMPLAINTS FROM BACKEND
══════════════════════════════════════ */
function getComplaintFilterStatus(status) {
    const map = {
        SUBMITTED: 'submitted',
        IN_PROGRESS: 'progress',
        RESOLVED: 'resolved',
        CLOSED: 'closed',
        REOPENED: 'reopened',
        DELAYED: 'delayed'
    };

    return map[status] || 'submitted';
}

function formatComplaintDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function formatCategory(category) {
    const labels = {
        water: 'Water / Plumbing',
        electrical: 'Electrical / Power',
        furniture: 'Furniture / Fixtures',
        ac: 'Air Conditioning / Fan',
        network: 'Network / Internet',
        projector: 'Projector / Mic',
        cleaning: 'Cleanliness / Sanitation',
        security: 'Security / Lock Issue',
        pest: 'Pest / Infestation',
        structural: 'Structural / Civil',
        fire: 'Fire Safety Equipment',
        other: 'Other'
    };
    return labels[category] || category || '-';
}

function statusBadgeClass(status) {
    const classes = {
        SUBMITTED: 'b-submitted',
        IN_PROGRESS: 'b-progress',
        RESOLVED: 'b-resolved',
        CLOSED: 'b-closed',
        REOPENED: 'b-reopened',
        DELAYED: 'b-delayed'
    };
    return classes[status] || 'b-submitted';
}

function priorityClass(priority) {
    const classes = {
        HIGH: 'p-high',
        MEDIUM: 'p-medium',
        LOW: 'p-low',
        URGENT: 'p-high'
    };
    return classes[priority] || 'p-medium';
}

function buildComplaintHistory(complaint) {
    return [
        {
            s: complaint.status,
            by: 'Faculty',
            time: formatComplaintDate(complaint.createdAt),
            r: 'Complaint submitted'
        }
    ];
}

function createComplaintRow(complaint) {
    const row = document.createElement('tr');
    const filterStatus = getComplaintFilterStatus(complaint.status);
    row.dataset.status = filterStatus;
    row.style.cursor = 'pointer';

    const location = [complaint.block, complaint.room ? `R-${complaint.room}` : '']
        .filter(Boolean)
        .join(', ');

    const cells = [
        { text: complaint.complaintId || '-', className: 'muted-small' },
        { text: complaint.title || '-' },
        { text: formatCategory(complaint.category), className: 'muted' },
        { text: location || '-', className: 'location-cell' },
        null,
        null,
        { text: formatComplaintDate(complaint.createdAt), className: 'date-cell' },
        null
    ];

    cells.forEach((cell, index) => {
        const td = document.createElement('td');

        if (cell) {
            td.textContent = cell.text;
            if (cell.className === 'muted-small') {
                td.style.color = 'var(--muted)';
                td.style.fontSize = '12px';
            } else if (cell.className === 'muted') {
                td.style.color = 'var(--muted)';
            } else if (cell.className === 'location-cell') {
                td.style.fontSize = '12px';
                td.style.color = 'var(--muted)';
            } else if (cell.className === 'date-cell') {
                td.style.color = 'var(--muted)';
                td.style.fontSize = '13px';
            }
        } else if (index === 4) {
            const badge = document.createElement('span');
            badge.className = `badge ${statusBadgeClass(complaint.status)}`;
            badge.textContent = (complaint.status || 'SUBMITTED').replace(/_/g, ' ');
            td.appendChild(badge);
        } else if (index === 5) {
            const priority = document.createElement('span');
            priority.className = `pri-dot ${priorityClass(complaint.priority)}`;
            priority.textContent = (complaint.priority || 'MEDIUM').toLowerCase();
            priority.textContent = priority.textContent.charAt(0).toUpperCase() + priority.textContent.slice(1);
            td.appendChild(priority);
        } else if (index === 7) {
            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.gap = '8px';
            actions.style.alignItems = 'center';

            const viewButton = document.createElement('button');
            viewButton.className = 'action-btn ab-view';
            viewButton.textContent = 'View';

            viewButton.addEventListener('click', (event) => {
                event.stopPropagation();

                openComplaintDetail({
                    id: complaint.complaintId,
                    title: complaint.title,
                    cat: formatCategory(complaint.category),
                    status: complaint.status,
                    priority: complaint.priority,
                    date: formatComplaintDate(complaint.createdAt),
                    desc: complaint.description,
                    block: complaint.block,
                    floor: complaint.floor || '-',
                    room: complaint.room || '-',
                    history: buildComplaintHistory(complaint)
                });
            });

            const deleteButton = document.createElement('button');
            deleteButton.className = 'action-btn';
            deleteButton.textContent = 'Delete';
            deleteButton.style.color = 'var(--accent)';

            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteComplaint(complaint.complaintId);
            });

            actions.appendChild(viewButton);
            actions.appendChild(deleteButton);

            td.appendChild(actions);
        }

        row.appendChild(td);
    });

    row.addEventListener('click', () => {
        row.querySelector('.ab-view')?.click();
    });

    return row;
}

async function loadFacultyComplaints() {
    const tbody = document.getElementById('faculty-complaints-body');
    if (!tbody) return;

    try {
        const response = await fetch('/api/complaints/my');
        const data = await response.json();

        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Unable to fetch complaints');
        }

        const complaints = Array.isArray(data.complaints) ? data.complaints : [];
        tbody.innerHTML = '';

        if (!complaints.length) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="8" style="text-align:center;color:var(--muted);padding:30px;">No complaints found.</td>';
            tbody.appendChild(row);
        } else {
            complaints.forEach(complaint => {
                tbody.appendChild(createComplaintRow(complaint));
            });
        }

        const allButton = document.querySelector('#tab-complaints .filter-btn[data-filter="all"]');
        if (allButton) allButton.textContent = `All (${complaints.length})`;

        updateFacultyStats(complaints);
    } catch (error) {
        console.error('Loading faculty complaints error:', error);
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--accent);padding:30px;">Unable to load complaints. Please refresh the page.</td></tr>';
    }
}
async function deleteComplaint(complaintId) {
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

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Unable to delete complaint');
        }

        showToast('Complaint deleted successfully.', 'success');

        await loadFacultyComplaints();

    } catch (error) {
        console.error('Delete complaint error:', error);
        showToast(
            error.message || 'Unable to delete complaint.',
            'error'
        );
    }
}

function updateFacultyStats(complaints) {
    const total = complaints.length;
    const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'DELAYED').length;
    const resolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const reopened = complaints.filter(c => c.status === 'REOPENED').length;

    const statNumbers = document.querySelectorAll('#tab-home .stats-grid .sc-num');
    if (statNumbers[0]) statNumbers[0].textContent = total;
    if (statNumbers[1]) statNumbers[1].textContent = inProgress;
    if (statNumbers[2]) statNumbers[2].textContent = resolved;
    if (statNumbers[3]) statNumbers[3].textContent = reopened;

    const welcomeText = document.querySelector('#tab-home .welcome-banner p');
    if (welcomeText) {
        welcomeText.textContent = `You have ${inProgress} complaint${inProgress === 1 ? '' : 's'} currently in progress. Track all your reported issues from the complaints section.`;
    }
}

/* ══════════════════════════════════════
   COMPLAINTS FILTER
══════════════════════════════════════ */
function filterComplaints(btn, type) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('#f-complaints-table tbody tr').forEach(r => {
        r.style.display = (type === 'all' || r.dataset.status === type) ? '' : 'none';
    });
}

/* ══════════════════════════════════════
   COMPLAINT DETAIL MODAL
══════════════════════════════════════ */
const STATUS_CLASS = {
    IN_PROGRESS: 'b-progress', SUBMITTED: 'b-submitted', CLOSED: 'b-closed',
    REOPENED: 'b-reopened', RESOLVED: 'b-resolved', DELAYED: 'b-delayed',
};

const PRI_CLASS = { HIGH: 'p-high', MEDIUM: 'p-medium', LOW: 'p-low' };

function openComplaintDetail(c) {
    document.getElementById('cd-title').textContent = c.title;
    document.getElementById('cd-id').textContent = c.id + ' · Reported ' + c.date;

    document.getElementById('cd-status').innerHTML = `<span class="badge ${STATUS_CLASS[c.status] || 'b-submitted'}">${c.status.replace(/_/g, ' ')}</span>`;
    document.getElementById('cd-priority').innerHTML = `<span class="pri-dot ${PRI_CLASS[c.priority] || 'p-medium'}">${c.priority}</span>`;
    document.getElementById('cd-cat').textContent = c.cat;
    document.getElementById('cd-loc').textContent = `Block ${c.block}, Floor ${c.floor}, Room ${c.room}`;
    document.getElementById('cd-desc').textContent = c.desc;

    const tl = document.getElementById('cd-timeline');
    tl.innerHTML = '';
    c.history.forEach((h, i) => {
        const cls = i === c.history.length - 1 ? 'active' : 'done';
        tl.innerHTML += `
      <div class="tstep">
        <div class="tstep-dot ${cls}">${i + 1}</div>
        <div class="tstep-info">
          <div class="ts-title">${h.s.replace(/_/g, ' ')} <span style="font-size:11px;color:var(--muted);margin-left:8px;">by ${h.by}</span></div>
          <div class="ts-time">${h.time}</div>
          ${h.r ? `<div class="ts-remark">"${h.r}"</div>` : ''}
        </div>
      </div>`;
    });

    document.getElementById('cd-reopen-section').style.display = c.status === 'RESOLVED' ? 'block' : 'none';
    document.getElementById('complaint-detail-modal').classList.add('open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

/* backdrop click */
document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', function (e) { if (e.target === this) this.classList.remove('open'); });
});

/* ══════════════════════════════════════
   LOGOUT
══════════════════════════════════════ */
function doLogout() {
    showToast('Signed out successfully', 'info');
    setTimeout(() => { window.location.href = 'login.html'; }, 700);
}

function openContact() {
    window.open('https://www.niet.co.in/contact-us', '_blank', 'noopener,noreferrer');
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function showToast(msg, type = 'info') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast ' + type + ' show';
    setTimeout(() => t.classList.remove('show'), 3200);
}

/* Escape key */
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
});

document.addEventListener('DOMContentLoaded', () => {
    applyFacultyProfileToUI();
    setNotifMutedUI(getNotifMuted());
    loadFacultyComplaints();
});
