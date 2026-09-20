/* ── Role Selection ── */
let currentRole = 'faculty';

function setRole(role) {
    currentRole = role;

    document.getElementById('tab-faculty')
        .classList.toggle('active', role === 'faculty');

    document.getElementById('tab-admin')
        .classList.toggle('active', role === 'admin');

    hideError();
}

/* ── Login Logic ── */
async function doLogin() {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    if (!user || !pass) {
        showError('Please enter both username and password.');
        return;
    }

    hideError();
    showToast('Signing in…', 'info');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: user,
                password: pass
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            showError(data.message || 'Invalid email or password.');
            return;
        }

        // Make sure selected role matches the actual account role
        if (data.user.role !== currentRole) {
            showError('Incorrect account type selected.');
            return;
        }

        // Store logged-in user information temporarily
        sessionStorage.setItem('user', JSON.stringify(data.user));

        showToast('Login successful!', 'success');

        setTimeout(() => {
            if (data.user.role === 'admin') {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/faculty.html';
            }
        }, 500);

    } catch (error) {
        console.error('Login error:', error);
        showError('Unable to connect to the server.');
    }
}

/* ── Forgot Password Modal ── */
function openForgotModal() {
    document.getElementById('fp-modal').classList.add('open');
}

function closeForgotModal() {
    document.getElementById('fp-modal').classList.remove('open');
}

function sendReset() {
    const email = document.getElementById('fp-email').value.trim();

    if (!email) {
        showToast('Please enter your email address.', 'error');
        return;
    }

    closeForgotModal();
    showToast('Reset link sent to ' + email, 'success');
}

/* ── Helpers ── */
function showError(msg) {
    const el = document.getElementById('error-msg');
    el.textContent = msg;
    el.classList.add('show');
}

function hideError() {
    document.getElementById('error-msg').classList.remove('show');
}

function showToast(msg, type = 'info') {
    const t = document.getElementById('toast');

    t.textContent = msg;
    t.className = 'toast ' + type + ' show';

    setTimeout(() => t.classList.remove('show'), 3200);
}

/* ── Close modal on backdrop click / Escape ── */
document.getElementById('fp-modal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeForgotModal();
    }
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeForgotModal();
    }
});