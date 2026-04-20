/**
 * Contact Form - Collarwork Design
 * Handles validation, submission, loading states, and feedback
 */

// Validation rules for required fields
const validationRules = {
  'client-name': {
    required: true,
    minLength: 2,
    errorId: 'name-error',
    errorMessage: 'Please enter your name (at least 2 characters)'
  },
  'client-email': {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorId: 'email-error',
    errorMessage: 'Please enter a valid email address'
  },
  'project-type': {
    required: true,
    errorId: 'type-error',
    errorMessage: 'Please select a project type'
  },
  'project-title': {
    required: true,
    minLength: 3,
    errorId: 'title-error',
    errorMessage: 'Please give your project a name'
  },
  'project-goals': {
    required: true,
    minLength: 20,
    errorId: 'goals-error',
    errorMessage: 'Please describe your project goals (at least 20 characters)'
  },
  'project-urgency': {
    required: true,
    errorId: 'urgency-error',
    errorMessage: 'Please select a timeline'
  },
  'project-budget': {
    required: true,
    errorId: 'budget-error',
    errorMessage: 'Please select a budget range'
  }
};

/**
 * Validate a single field
 */
function validateField(field, cachedGroups = {}, cachedErrorEls = {}) {
  const rules = validationRules[field.id];
  if (!rules) return true;

  const value = field.value ? field.value.trim() : '';
  const group = cachedGroups[field.id] || (field.closest && field.closest('.floating-group'));
  let isValid = true;
  let errorMessage = rules.errorMessage;

  // Check required
  if (rules.required && !value) {
    isValid = false;
  }

  // Check minimum length
  if (isValid && rules.minLength && value.length < rules.minLength) {
    isValid = false;
  }

  // Check pattern (email)
  if (isValid && rules.pattern && !rules.pattern.test(value)) {
    isValid = false;
  }

  // Update UI
  if (group && field) {
    if (!isValid) {
      group.classList.add('has-error');
      field.classList.add('has-error');
      field.classList.remove('is-valid');

      const errorEl = cachedErrorEls[field.id] || (typeof document !== 'undefined' && document.getElementById(rules.errorId));
      if (errorEl) {
        errorEl.textContent = errorMessage;
      }
    } else {
      group.classList.remove('has-error');
      field.classList.remove('has-error');
      if (value) {
        field.classList.add('is-valid');
      }
    }
  }

  return isValid;
}

// Expose for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validationRules, validateField };
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('project-form');
  const submitBtn = document.getElementById('submit-btn');
  const successMessage = document.getElementById('form-success');
  const errorMessage = document.getElementById('form-error');
  const resetBtn = document.getElementById('reset-form');
  const retryBtn = document.getElementById('retry-form');

  if (!form) return;

  // Cache DOM elements
  const cachedFields = {};
  const cachedErrorEls = {};
  const cachedGroups = {};

  Object.keys(validationRules).forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      cachedFields[fieldId] = field;
      cachedGroups[fieldId] = field.closest('.floating-group');
      const errorEl = document.getElementById(validationRules[fieldId].errorId);
      if (errorEl) {
        cachedErrorEls[fieldId] = errorEl;
      }
    }
  });

  /**
   * Validate all required fields
   */
  function validateForm() {
    let isValid = true;
    let firstInvalidField = null;

    Object.keys(validationRules).forEach(fieldId => {
      const field = cachedFields[fieldId];
      if (field) {
        const fieldValid = validateField(field, cachedGroups, cachedErrorEls);
        if (!fieldValid && !firstInvalidField) {
          firstInvalidField = field;
        }
        if (!fieldValid) {
          isValid = false;
        }
      }
    });

    // Scroll to first invalid field with shake animation
    if (firstInvalidField) {
      const group = firstInvalidField.closest('.floating-group');
      group.classList.add('shake');
      setTimeout(() => group.classList.remove('shake'), 400);

      firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalidField.focus();
    }

    return isValid;
  }

  /**
   * Show loading state
   */
  function setLoading(loading) {
    if (loading) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
    } else {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  }

  /**
   * Show success state
   */
  function showSuccess() {
    form.classList.add('is-hidden');
    successMessage.classList.add('is-visible');
    errorMessage.classList.remove('is-visible');

    // Scroll to top of form container
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Show error state
   */
  function showError(message) {
    form.classList.add('is-hidden');
    errorMessage.classList.add('is-visible');
    successMessage.classList.remove('is-visible');

    const errorMsgEl = document.getElementById('error-message');
    if (errorMsgEl && message) {
      errorMsgEl.textContent = message;
    }

    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Reset form to initial state
   */
  function resetForm() {
    form.reset();
    form.classList.remove('is-hidden');
    successMessage.classList.remove('is-visible');
    errorMessage.classList.remove('is-visible');

    // Clear all validation states
    form.querySelectorAll('.floating-input').forEach(input => {
      input.classList.remove('has-error', 'is-valid');
    });
    form.querySelectorAll('.floating-group').forEach(group => {
      group.classList.remove('has-error');
    });

    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Real-time validation on blur
  Object.keys(validationRules).forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('blur', () => validateField(field, cachedGroups, cachedErrorEls));

      // Clear error on input
      field.addEventListener('input', () => {
        const group = field.closest('.floating-group');
        if (group.classList.contains('has-error')) {
          group.classList.remove('has-error');
          field.classList.remove('has-error');
        }
      });
    }
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Set loading state
    setLoading(true);

    // 🛡️ Sentinel: Add timeout to external API calls to prevent UI hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      // Collect form data
      const formData = new FormData(form);

      // Submit to FormSubmit
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      if (response.ok) {
        showSuccess();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      showError('There was an error sending your message. Please try again or email us directly at hello@collarworkdesign.com');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  });

  // Reset button handlers
  [resetBtn, retryBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', resetForm);
    }
  });

  // Enhance date input - set min date to today
  const deadlineInput = document.getElementById('project-deadline');
  if (deadlineInput) {
    const today = new Date().toISOString().split('T')[0];
    deadlineInput.setAttribute('min', today);
  }

  // Add character counter for textarea fields
  const textareas = form.querySelectorAll('textarea[maxlength]');
  textareas.forEach(textarea => {
    const maxLength = textarea.getAttribute('maxlength');
    const hint = textarea.parentElement.querySelector('.input-hint');

    if (hint && maxLength) {
      const originalHint = hint.textContent;

      textarea.addEventListener('input', () => {
        const remaining = maxLength - textarea.value.length;
        if (remaining < 200) {
          hint.textContent = `${originalHint} (${remaining} characters remaining)`;
        } else {
          hint.textContent = originalHint;
        }
      });
    }
  });
});
