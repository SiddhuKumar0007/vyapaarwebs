// Lead Capture Popup Modal & Automatic Delivery System for VyapaarWebs

const STORAGE_SUBMITTED_KEY = 'vyapaarwebs_lead_done';
const STORAGE_SNOOZE_KEY = 'vyapaarwebs_popup_snooze';

// Owner's FormSubmit endpoint token (linked directly to siddhujha2006@gmail.com)
export const FORMSUBMIT_TOKEN = '28d87903e0efec836ded60e37fc57eee';

// Auto-trigger delay: 10 seconds
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

  // Handle Form Submission (Instant 100% non-blocking feedback)
  form.addEventListener('submit', (e) => {
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

    // Quick visual button state
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

    // 1. Immediately backup to localStorage (instant, cannot fail)
    try {
      const localLeads = JSON.parse(localStorage.getItem('vyapaarwebs_all_leads') || '[]');
      localLeads.push(leadData);
      localStorage.setItem('vyapaarwebs_all_leads', JSON.stringify(localLeads));
    } catch (e) {}

    sessionStorage.setItem(STORAGE_SUBMITTED_KEY, 'true');

    // 2. Dispatch network sync in background with AbortController timeout (Never blocks UI!)
    dispatchBackgroundLeads(leadData);

    // 3. Instant UI Transition (after 500ms smooth visual feedback, NEVER stuck!)
    setTimeout(() => {
      form.style.display = 'none';
      resultBox.innerHTML = `
        <div class="lead-success-content">
          <div class="lead-success-icon">✓</div>
          <h3>Shukriya, ${escapeHtml(name)}!</h3>
          <p>Aapki request successfully receive ho gayi hai.</p>
          <div class="lead-summary-card">
            <div><strong>Phone:</strong> ${escapeHtml(phone)}</div>
            <div><strong>Email:</strong> ${escapeHtml(email)}</div>
          </div>
          <p class="lead-timing-note">⚡ Humari team agle <strong>15 minute</strong> mein aapse contact karegi.</p>
          <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px;">
            <a href="https://wa.me/917838956429?text=${encodeURIComponent('Hello VyapaarWebs, I just submitted an enquiry on your website.\n\nName: ' + name + '\nPhone: ' + phone + '\nEmail: ' + email)}" target="_blank" rel="noopener" class="button ghost" style="font-size:12px;padding:10px;justify-content:center;">
              <span>💬 Direct WhatsApp Par Baat Karein ↗</span>
            </a>
            <button class="button small primary" id="lead-done-btn" type="button">Close</button>
          </div>
        </div>
      `;
      resultBox.style.display = 'block';

      const doneBtn = document.getElementById('lead-done-btn');
      if (doneBtn) doneBtn.onclick = closePopup;

      setTimeout(() => {
        if (dialog.open) closePopup();
      }, 7000);
    }, 550);
  });

  checkAndScheduleAutoOpen();
}

// Background network dispatcher with fast timeout (Never hangs the user)
function dispatchBackgroundLeads(leadData) {
  // A. Local API endpoint (if running locally on server.mjs)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
      signal: controller.signal
    }).finally(() => clearTimeout(timer));
  } catch (e) {}

  // B. Email dispatch to FormSubmit (with 4-second timeout)
  try {
    const controller2 = new AbortController();
    const timer2 = setTimeout(() => controller2.abort(), 4000);
    fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `🔥 New Lead Alert: ${leadData.name} (${leadData.phone}) - VyapaarWebs`,
        'Client Name': leadData.name,
        'Phone / WhatsApp': leadData.phone,
        'Email': leadData.email,
        'Requirement': leadData.requirement,
        'Submission Date & Time': leadData.submittedAt,
        'Website Page': leadData.pageUrl,
        _template: 'table',
        _captcha: 'false'
      }),
      signal: controller2.signal
    }).finally(() => clearTimeout(timer2));
  } catch (e) {}
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
