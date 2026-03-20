import api from './api.js';

const form = document.getElementById('accept-invite-form');
const emailInput = document.getElementById('invite-email');
const roleInput = document.getElementById('invite-role');
const nameInput = document.getElementById('invite-name');
const passwordInput = document.getElementById('invite-password');
const confirmPasswordInput = document.getElementById('invite-confirm-password');
const submitButton = document.getElementById('accept-submit-button');
const submitLabel = submitButton?.querySelector('.submit-label');
const statusRegion = document.getElementById('form-status');
const nameError = document.getElementById('name-error');
const passwordError = document.getElementById('password-error');
const confirmPasswordError = document.getElementById('confirm-password-error');

const params = new URLSearchParams(window.location.search);
const inviteToken = params.get('token') || '';

const setStatus = (message, type = '') => {
  statusRegion.textContent = message;
  statusRegion.classList.remove('is-error', 'is-success');
  if (type) statusRegion.classList.add(type);
};

const setFieldError = (input, node, message) => {
  node.textContent = message;
  input.setAttribute('aria-invalid', 'true');
};

const clearFieldError = (input, node) => {
  node.textContent = '';
  input.removeAttribute('aria-invalid');
};

const setSubmitState = (loading) => {
  submitButton.disabled = loading;
  submitButton.classList.toggle('is-loading', loading);
  if (submitLabel) submitLabel.textContent = loading ? 'Activating...' : 'Activate account';
};

const validate = () => {
  let isValid = true;

  const name = nameInput.value.trim();
  if (name.length < 2) {
    setFieldError(nameInput, nameError, 'Please enter your full name.');
    isValid = false;
  } else {
    clearFieldError(nameInput, nameError);
  }

  const password = passwordInput.value;
  if (password.length < 8) {
    setFieldError(passwordInput, passwordError, 'Password must be at least 8 characters.');
    isValid = false;
  } else {
    clearFieldError(passwordInput, passwordError);
  }

  if (confirmPasswordInput.value !== password) {
    setFieldError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match.');
    isValid = false;
  } else {
    clearFieldError(confirmPasswordInput, confirmPasswordError);
  }

  return isValid;
};

const roleLabel = (role) => {
  if (role === 'superadmin') return 'Super Admin';
  if (role === 'editor') return 'Content Editor';
  return 'Moderator';
};

const loadInvite = async () => {
  if (!inviteToken) {
    setStatus('Invite token is missing from this link.', 'is-error');
    form.querySelectorAll('input, button').forEach((el) => {
      el.disabled = true;
    });
    return;
  }

  try {
    const response = await api.get(`/api/v1/auth/invite/${encodeURIComponent(inviteToken)}`);
    emailInput.value = response?.data?.email || '';
    roleInput.value = roleLabel(response?.data?.role);
  } catch (error) {
    setStatus(error?.message || 'Invite link is invalid or expired.', 'is-error');
    form.querySelectorAll('input, button').forEach((el) => {
      el.disabled = true;
    });
  }
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('');

  if (!validate()) {
    setStatus('Please fix highlighted fields and try again.', 'is-error');
    return;
  }

  setSubmitState(true);

  try {
    const response = await api.post('/api/v1/auth/accept-invite', {
      token: inviteToken,
      name: nameInput.value.trim(),
      password: passwordInput.value,
      confirmPassword: confirmPasswordInput.value,
    });

    if (response?.user) {
      sessionStorage.setItem('adminUser', JSON.stringify(response.user));
    }
    if (response?.token) {
      sessionStorage.setItem('adminToken', response.token);
    }

    setStatus(response?.message || 'Account activated successfully.', 'is-success');
    setTimeout(() => {
      window.location.assign('/client/pages/settings.html');
    }, 900);
  } catch (error) {
    setStatus(error?.message || 'Could not activate account.', 'is-error');
  } finally {
    setSubmitState(false);
  }
});

loadInvite();
