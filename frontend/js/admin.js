/**
 * ACE Montessori Admin Panel Logic - Professional Edition
 * Handles: Security, Admissions, Messages, Gallery, and PDF Exports.
 */

const API_BASE = 'http://localhost:8080/api';
const TOKEN_KEY = 'aceToken';

// --- 1. UTILITY: GLOBAL FETCH WRAPPER ---
// This handles tokens, JSON parsing, and error alerts in one place.
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);
    const defaultHeaders = {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': options.body instanceof FormData ? undefined : 'application/json'
    };

    // If it's FormData (for images), let the browser set the Content-Type automatically
    if (options.body instanceof FormData) delete defaultHeaders['Content-Type'];

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: { ...defaultHeaders, ...options.headers }
        });

        if (response.status === 401) {
            logout();
            return;
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Server Error');
        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// --- 2. SESSION & SECURITY ---
function checkAuth() {
    const token = localStorage.getItem(TOKEN_KEY);
    const isLoginPage = window.location.pathname.includes('login.html');

    if (!token && !isLoginPage) window.location.href = 'login.html';
    if (token && isLoginPage) window.location.href = 'dashboard.html';
}

// --- 3. LOGIN HANDLER ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = loginForm.querySelector('button');
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Verifying...';

        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            if (data.success || data.token) {
                localStorage.setItem(TOKEN_KEY, data.token);
                window.location.href = 'dashboard.html';
            }
        } catch (err) {
            alert("❌ Login Failed: " + err.message);
        } finally {
            btn.disabled = false;
            btn.innerText = 'LOGIN';
        }
    });
}

// --- 4. ADMISSIONS MANAGEMENT ---
async function fetchAdmissions() {
    const tableBody = document.getElementById('admissionTableBody');
    const countBadge = document.getElementById('admissionCount');
    if (!tableBody) return;

    try {
        const students = await apiRequest('/admissions/all');
        if (countBadge) countBadge.innerText = students.length;

        tableBody.innerHTML = students.map(student => {
            const date = new Date(student.createdAt).toLocaleDateString();
            return `
                <tr class="admission-row" data-student="${student.studentName}" data-parent="${student.parentName}" data-grade="${student.gradeApplyingFor}">
                    <td class="ps-4">
                        <div class="d-flex align-items-center">
                            <div class="avatar-circle me-3">${student.studentName.charAt(0)}</div>
                            <div>
                                <div class="fw-bold text-dark">${student.studentName}</div>
                                <div class="text-muted small">Applied: ${date}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="small fw-semibold">${student.parentName}</div>
                        <div class="small text-muted">${student.phone}</div>
                    </td>
                    <td><span class="badge rounded-pill bg-info text-dark px-3">${student.gradeApplyingFor}</span></td>
                    <td><span class="badge ${student.isReviewed ? 'bg-success' : 'bg-warning'} bg-opacity-10 ${student.isReviewed ? 'text-success' : 'text-warning'}">
                        ${student.isReviewed ? 'Reviewed' : 'Pending'}</span>
                    </td>
                    <td class="text-end pe-4">
                        <div class="dropdown">
                            <button class="btn btn-light btn-sm rounded-circle" data-bs-toggle="dropdown"><i class="bi bi-three-dots-vertical"></i></button>
                            <ul class="dropdown-menu shadow border-0">
                                <li><a class="dropdown-item" href="mailto:${student.email}"><i class="bi bi-reply me-2"></i>Email Parent</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="deleteAdmission('${student._id}')"><i class="bi bi-trash me-2"></i>Delete</a></li>
                            </ul>
                        </div>
                    </td>
                </tr>`;
        }).join('') || '<tr><td colspan="5" class="text-center py-4">No applications yet.</td></tr>';
    } catch (err) { console.error(err); }
}

async function deleteAdmission(id) {
    if (!confirm("Permanently delete this application?")) return;
    try {
        await apiRequest(`/admissions/${id}`, { method: 'DELETE' });
        fetchAdmissions();
    } catch (err) { alert("Delete failed"); }
}

// --- 5. VISITOR MESSAGES ---
async function fetchMessages() {
    const container = document.getElementById('messageContainer');
    const countBadge = document.getElementById('messageCount');
    if (!container) return;

    try {
        const messages = await apiRequest('/contact/all');
        if (countBadge) countBadge.innerText = messages.length;

        container.innerHTML = messages.map(msg => `
            <div class="col-md-6 mb-3">
                <div class="card border-0 shadow-sm p-3 rounded-4 h-100 border-start border-primary border-4">
                    <div class="d-flex justify-content-between mb-2">
                        <h6 class="fw-bold text-primary mb-0">${msg.name}</h6>
                        <small class="text-muted">${new Date(msg.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p class="small text-muted mb-2">${msg.email}</p>
                    <div class="bg-light p-2 rounded-3 mb-3">
                        <strong class="d-block small">${msg.subject}</strong>
                        <p class="mb-0 small text-secondary">${msg.message}</p>
                    </div>
                    <div class="d-flex gap-2">
                        <a href="mailto:${msg.email}" class="btn btn-sm btn-outline-primary flex-grow-1">Reply</a>
                        <button onclick="deleteMessage('${msg._id}')" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
            </div>
        `).join('') || '<p class="text-center py-4 text-muted">No messages found.</p>';
    } catch (err) { console.error(err); }
}

async function deleteMessage(id) {
    if (!confirm("Delete this message?")) return;
    try {
        await apiRequest(`/contact/${id}`, { method: 'DELETE' });
        fetchMessages();
    } catch (err) { alert("Delete failed"); }
}

// --- 6. GALLERY MANAGEMENT ---
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('image', document.getElementById('imageFile').files[0]);
        formData.append('caption', document.getElementById('imageCaption').value);
        formData.append('category', document.getElementById('imageCategory').value);

        const btn = uploadForm.querySelector('button');
        btn.disabled = true;
        btn.innerText = "Uploading...";

        try {
            await apiRequest('/gallery/upload', { method: 'POST', body: formData });
            uploadForm.reset();
            fetchGalleryPreview();
            alert("Image Published!");
        } catch (err) { alert("Upload failed"); } 
        finally {
            btn.disabled = false;
            btn.innerText = "PUBLISH PHOTO";
        }
    });
}

async function fetchGalleryPreview() {
    const preview = document.getElementById('galleryPreview');
    const countBadge = document.getElementById('photoCount');
    if (!preview) return;

    try {
        const images = await apiRequest('/gallery/all'); // Corrected endpoint
        if (countBadge) countBadge.innerText = images.length;

        preview.innerHTML = images.map(img => `
            <div class="col-md-4 mb-3">
                <div class="card gallery-card-admin h-100 shadow-sm border-0">
                    <img src="http://localhost:8080/uploads${img.imageUrl}" class="card-img-top" style="height:150px; object-fit:cover;">
                    <div class="p-2 d-flex justify-content-between align-items-center">
                        <span class="badge bg-light text-dark border">${img.category}</span>
                        <button onclick="deleteImage('${img._id}')" class="btn btn-link text-danger p-0"><i class="bi bi-trash-fill"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

async function deleteImage(id) {
    if (!confirm("Delete photo?")) return;
    try {
        await apiRequest(`/gallery/${id}`, { method: 'DELETE' });
        fetchGalleryPreview();
    } catch (err) { console.error(err); }
}

// --- 7. EXPORTS & LOGOUT ---
function downloadAdmissionsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("ACE Montessori Admissions Report", 14, 20);
    doc.autoTable({ 
        html: '#admissionTable', 
        startY: 30,
        headStyles: { fillStyle: [73, 55, 125] }
    });
    doc.save(`Admissions_${new Date().toISOString().slice(0,10)}.pdf`);
}

function logout() {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = 'login.html';
}

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    if (document.getElementById('overviewSection')) {
        fetchAdmissions();
        fetchMessages();
        fetchGalleryPreview();
    }
});