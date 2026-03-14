const form = document.getElementById("admin-login-form");
const emailInput = document.getElementById("admin-email");
const passwordInput = document.getElementById("admin-password");
const passwordToggle = document.getElementById("password-toggle");
const passwordToggleText = document.querySelector(".password-toggle-text");
const submitButton = document.getElementById("submit-button");
const submitLabel = submitButton?.querySelector(".submit-label");
const statusRegion = document.getElementById("form-status");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const setStatus = (message, type = "") => {
  statusRegion.textContent = message;
  statusRegion.classList.remove("is-error", "is-success");
  if (type) {
    statusRegion.classList.add(type);
  }
};

const setFieldError = (input, errorNode, message) => {
  errorNode.textContent = message;
  input.setAttribute("aria-invalid", "true");
};

const clearFieldError = (input, errorNode) => {
  errorNode.textContent = "";
  input.removeAttribute("aria-invalid");
};

const validateEmail = () => {
  const value = emailInput.value.trim();
  if (!value) {
    setFieldError(emailInput, emailError, "Email is required.");
    return false;
  }
  if (!EMAIL_PATTERN.test(value)) {
    setFieldError(
      emailInput,
      emailError,
      "Enter a valid email address (for example, name@domain.com)."
    );
    return false;
  }
  clearFieldError(emailInput, emailError);
  return true;
};

const validatePassword = () => {
  const value = passwordInput.value;
  if (!value) {
    setFieldError(passwordInput, passwordError, "Password is required.");
    return false;
  }
  if (value.length < MIN_PASSWORD_LENGTH) {
    setFieldError(
      passwordInput,
      passwordError,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    );
    return false;
  }
  clearFieldError(passwordInput, passwordError);
  return true;
};

const validateForm = () => {
  const emailValid = validateEmail();
  const passwordValid = validatePassword();
  return emailValid && passwordValid;
};

const setSubmitState = (isLoading) => {
  submitButton.disabled = isLoading;
  submitButton.classList.toggle("is-loading", isLoading);
  submitLabel.textContent = isLoading ? "Signing in..." : "Sign in";
};

const resolveLoginPreview = async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return true;
};

passwordToggle.addEventListener("click", () => {
  const revealPassword = passwordInput.type === "password";
  passwordInput.type = revealPassword ? "text" : "password";
  passwordToggle.setAttribute("aria-pressed", String(revealPassword));
  passwordToggle.setAttribute(
    "aria-label",
    revealPassword ? "Hide password" : "Show password"
  );
  passwordToggle.classList.toggle("is-visible", revealPassword);
  passwordToggleText.textContent = revealPassword ? "Hide password" : "Show password";
});

[emailInput, passwordInput].forEach((input) => {
  input.addEventListener("input", () => {
    if (statusRegion.textContent) {
      setStatus("");
    }
    if (input === emailInput && emailError.textContent) {
      validateEmail();
    }
    if (input === passwordInput && passwordError.textContent) {
      validatePassword();
    }
  });

  input.addEventListener("blur", () => {
    if (input === emailInput) {
      validateEmail();
      return;
    }
    validatePassword();
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("");

  const isValid = validateForm();
  if (!isValid) {
    setStatus("Please correct the highlighted fields and try again.", "is-error");
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
    return;
  }

  setSubmitState(true);
  await resolveLoginPreview();
  setSubmitState(false);
});
