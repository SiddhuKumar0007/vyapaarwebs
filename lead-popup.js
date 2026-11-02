// Lead Capture Popup Modal & Automatic Email Delivery System for VyapaarWebs

const STORAGE_SUBMITTED_KEY = 'vyapaarwebs_lead_done';
const STORAGE_SNOOZE_KEY = 'vyapaarwebs_popup_snooze';

// Owner's notification email where all leads are instantly delivered
export const OWNER_NOTIFICATION_EMAIL = 'siddhukumar2006@gmail.com';

// Auto-trigger delay: Exactly 10 seconds for everyone
const AUTO_POPUP_DELAY_MS = 10000;

export function initLeadPopup() {
  const dialog = document.getElementById('lead-capture-dialog');
  const form = document.getElementById('lead-capture-form');
  const closeBtn = document.getElementById('close-lead-dialog');
  const triggerBtn = document.getElementById('floating-lead-trigger');
  const resultBox = document.getElementById('lead-result-box');

  if (!dialog || !form) return;
  try { localStorage.removeItem(STORAGE_SUBMITTED_KEY); } catch(e){}

  function openPopup() {
    if (dialog.open) return;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    const firstInput = form.querySelector('input[name="name"]');
    if (firstInput) setTimeout(() => firstInput.focus(), 150);
  }

  function closePopup() {
    dialog.close();
    document.body.style.overflow = '';
    if (!localStorage.getItem(STORAGE_SUBMITTED_KEY)) {
      sessionStorage.setItem(STORAGE_SNOOZE_KEY, String(Date.now() + 15 * 60 * 1000));
    }
  }

  function checkAndScheduleAutoOpen() {
    const isSubmitted = sessionStorage.getItem(STORAGE_SUBMITTED_KEY);
    if (isSubmitted) return;

    setTimeout(() => {
      const alreadySubmitted = sessionStorage.getItem(STORAGE_SUBMITTED_KEY);
      if (!alreadySubmitted) {
        openPopup();
      }
    }, AUTO_POPUP_DELAY_MS);
  }

  if (closeBtn) closeBtn.onclick = closePopup;

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        closePopup();
      }
    }
  });

  if (triggerBtn) {
    triggerBtn.onclick = () => openPopup();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');

    const name = form.elements['name'].value.trim();
    const phone = form.elements['phone'].value.trim();
    const email = form.elements['email'].value.trim();
    const requirement = form.elements['requirement'] ? form.elements['requirement'].value.trim() : '';

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      alert('Kripya kam se kam 10-digit ka valid phone/WhatsApp number dalein.');
      form.elements['phone'].focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>⏳ Submitting...</span>`;

    const leadData = {
      name,
      phone,
      email,
      requirement: requirement || 'Website Consultation Request',
      source: 'Auto Timed Popup Modal',
      submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      pageUrl: window.location.href
    };

    // 1. Send instant email notification to Owner's Gmail via FormSubmit
    try {
      await fetch(`https://formsubmit.co/ajax/${OWNER_NOTIFICATION_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `🔥 New Lead Alert: ${name} (${phone}) - VyapaarWebs`,
          'Client Name': name,
          'Phone / WhatsApp': phone,
          'Email': email,
          'Requirement': requirement || 'Website Consultation Request',
          'Submission Date & Time': leadData.submittedAt,
          'Website Page': leadData.pageUrl,
          _template: 'table',
          _captcha: 'false'
        })
      });
    } catch (emailErr) {
      console.warn('Email dispatch warning:', emailErr);
    }

    // 2. Save locally to /api/lead (leads.csv & leads.json)
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
    } catch (err) {
      console.warn('Local storage warning:', err);
    }

    // 3. Keep local backup
    try {
      const localLeads = JSON.parse(localStorage.getItem('vyapaarwebs_all_leads') || '[]');
      localLeads.push(leadData);
      localStorage.setItem('vyapaarwebs_all_leads', JSON.stringify(localLeads));
    } catch (e) {}

    sessionStorage.setItem(STORAGE_SUBMITTED_KEY, 'true');

    // Show success view inside modal
    form.style.display = 'none';
    resultBox.innerHTML = `
      <div class="lead-success-content">
        <div class="lead-success-icon">✓</div>
        <h3>Shukriya, ${escapeHtml(name)}!</h3>
        <p>Aapki request receive ho gayi hai aur notification humari team ko send ho chuka hai.</p>
        <div class="lead-summary-card">
          <div><strong>Phone:</strong> ${escapeHtml(phone)}</div>
          <div><strong>Email:</strong> ${escapeHtml(email)}</div>
        </div>
        <p class="lead-timing-note">⚡ Humari team jald hi aapse contact karegi.</p>
        <button class="button small primary" id="lead-done-btn" type="button">Close</button>
      </div>
    `;
    resultBox.style.display = 'block';

    const doneBtn = document.getElementById('lead-done-btn');
    if (doneBtn) doneBtn.onclick = closePopup;

    setTimeout(() => {
      if (dialog.open) closePopup();
    }, 6000);
  });

  checkAndScheduleAutoOpen();
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
