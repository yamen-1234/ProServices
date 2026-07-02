/**
 * form.js — Custom form controls (select, datalist) & submission handling
 * Replaces native unstylable dropdowns with fully themed ones.
 */

document.addEventListener('DOMContentLoaded', function () {
  initCustomSelects();
  initCustomDatalists();
  initFormSubmission();
});

/* ───────── Custom Select ───────── */

function initCustomSelects() {
  const selects = document.querySelectorAll('select');
  if (!selects.length) return;

  selects.forEach(function (select) {
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';

    // Hide the native select
    select.style.display = 'none';

    // Trigger button
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.textContent = getDisplayText(select);

    // Options panel
    const panel = document.createElement('div');
    panel.className = 'custom-select-options';
    panel.style.display = 'none';

    Array.from(select.options).forEach(function (option) {
      const item = document.createElement('div');
      item.className = 'custom-select-option';
      item.textContent = option.value;
      item.dataset.value = option.value;

      if (option.selected) item.classList.add('selected');

      item.addEventListener('click', function (e) {
        e.stopPropagation();
        select.value = option.value;
        trigger.textContent = option.value;

        panel.querySelectorAll('.custom-select-option').forEach(function (el) {
          el.classList.remove('selected');
        });
        item.classList.add('selected');

        closeAllDropdowns();
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });

      panel.appendChild(item);
    });

    // Toggle
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = panel.style.display === 'block';
      closeAllDropdowns();
      if (!isOpen) {
        panel.style.display = 'block';
        trigger.classList.add('open');
      }
    });

    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    wrapper.appendChild(trigger);
    wrapper.appendChild(panel);
  });

  // Close on outside click
  document.addEventListener('click', function () {
    closeAllDropdowns();
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.custom-select-options').forEach(function (p) {
    p.style.display = 'none';
  });
  document.querySelectorAll('.custom-select-trigger').forEach(function (t) {
    t.classList.remove('open');
  });
}

function getDisplayText(select) {
  const idx = select.selectedIndex;
  if (idx >= 0 && select.options[idx]) return select.options[idx].value;
  return 'Select…';
}

/* ───────── Custom Datalist / Autocomplete ───────── */

function initCustomDatalists() {
  const inputs = document.querySelectorAll('input[list]');
  if (!inputs.length) return;

  inputs.forEach(function (input) {
    const datalistId = input.getAttribute('list');
    const datalist = document.getElementById(datalistId);
    if (!datalist) return;

    // Wrap
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-datalist-wrapper';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    // Dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'custom-datalist-dropdown';
    dropdown.style.display = 'none';
    wrapper.appendChild(dropdown);

    function render(filter) {
      dropdown.innerHTML = '';
      let count = 0;

      Array.from(datalist.options).forEach(function (opt) {
        const val = opt.value;
        if (!filter || val.toLowerCase().includes(filter.toLowerCase())) {
          const item = document.createElement('div');
          item.className = 'custom-datalist-item';
          item.textContent = val;

          item.addEventListener('mousedown', function (e) {
            e.preventDefault(); // prevent blur before click
          });
          item.addEventListener('click', function () {
            input.value = val;
            dropdown.style.display = 'none';
            input.dispatchEvent(new Event('input', { bubbles: true }));
          });

          dropdown.appendChild(item);
          count++;
        }
      });

      dropdown.style.display = count > 0 ? 'block' : 'none';
    }

    input.addEventListener('focus', function () {
      render(input.value);
    });
    input.addEventListener('input', function () {
      render(this.value);
    });
    input.addEventListener('blur', function () {
      setTimeout(function () { dropdown.style.display = 'none'; }, 200);
    });
  });
}

/* ───────── Form Submission & Validation ───────── */

function initFormSubmission() {
  const form = document.querySelector('form');
  if (!form) return;

  // Status message container
  const status = document.createElement('div');
  status.className = 'form-status';
  status.setAttribute('aria-live', 'polite');
  // Insert status message just before the submit button
  const submitBtn = form.querySelector('input[type="submit"]');
  form.insertBefore(status, submitBtn);

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Clear previous errors
    form.querySelectorAll('.error').forEach(function (el) {
      el.classList.remove('error');
    });

    // Validate required fields
    const required = form.querySelectorAll('[required]');
    let valid = true;

    required.forEach(function (field) {
      if (!field.value.trim()) {
        field.classList.add('error');
        valid = false;
      }
    });

    // Validate email
    const email = form.querySelector('#email');
    if (email && email.value.trim() && !isValidEmail(email.value.trim())) {
      email.classList.add('error');
      valid = false;
    }

    // Validate phone (basic — at least digits)
    const phone = form.querySelector('#phone');
    if (phone && phone.value.trim() && !/\d/.test(phone.value.trim())) {
      phone.classList.add('error');
      valid = false;
    }

    if (!valid) {
      showStatus(status, 'error', 'Please fill in all required fields correctly.');
      return;
    }

    // Success
    showStatus(status, 'success', 'Your request has been submitted successfully! We will contact you shortly.');

    // Reset everything after a short delay
    setTimeout(function () {
      form.reset();
      status.textContent = '';
      status.className = 'form-status';
      resetCustomSelects();
      resetCustomDatalists();
    }, 2500);
  });
}

/* ───────── Helpers ───────── */

function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function showStatus(el, type, msg) {
  el.className = 'form-status ' + type;
  el.textContent = msg;
}

function resetCustomSelects() {
  document.querySelectorAll('.custom-select-wrapper').forEach(function (w) {
    const select = w.querySelector('select');
    if (select) {
      select.selectedIndex = 0;
      const trigger = w.querySelector('.custom-select-trigger');
      if (trigger) trigger.textContent = getDisplayText(select);
      const panel = w.querySelector('.custom-select-options');
      panel.querySelectorAll('.custom-select-option').forEach(function (item, i) {
        item.classList.toggle('selected', i === 0);
      });
    }
  });
}

function resetCustomDatalists() {
  const wrappers = document.querySelectorAll('.custom-datalist-dropdown');
  wrappers.forEach(function (w) { w.style.display = 'none'; });
}
