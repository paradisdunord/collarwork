const assert = require('node:assert');
const { test, describe, beforeEach } = require('node:test');

// Mock browser globals
global.document = {
  addEventListener: () => {},
  getElementById: () => null
};

const { validationRules, validateField } = require('../contact-form.js');

describe('Contact Form Validation (Unit)', () => {
  let mockField;
  let mockGroup;
  let mockErrorEl;

  beforeEach(() => {
    mockErrorEl = { textContent: '' };
    mockGroup = {
      classList: {
        add: (cls) => mockGroup.classes.add(cls),
        remove: (cls) => mockGroup.classes.delete(cls)
      },
      classes: new Set()
    };
    mockField = {
      id: '',
      value: '',
      classList: {
        add: (cls) => mockField.classes.add(cls),
        remove: (cls) => mockField.classes.delete(cls)
      },
      classes: new Set(),
      closest: () => mockGroup
    };
  });

  describe('Name Validation', () => {
    test('should fail if name is empty', () => {
      mockField.id = 'client-name';
      mockField.value = '';
      const isValid = validateField(mockField, { 'client-name': mockGroup }, { 'client-name': mockErrorEl });
      assert.strictEqual(isValid, false);
      assert.ok(mockGroup.classes.has('has-error'));
      assert.ok(mockField.classes.has('has-error'));
    });

    test('should fail if name is too short', () => {
      mockField.id = 'client-name';
      mockField.value = 'A';
      const isValid = validateField(mockField, { 'client-name': mockGroup }, { 'client-name': mockErrorEl });
      assert.strictEqual(isValid, false);
      assert.strictEqual(mockErrorEl.textContent, validationRules['client-name'].errorMessage);
    });

    test('should pass with valid name', () => {
      mockField.id = 'client-name';
      mockField.value = 'John Doe';
      const isValid = validateField(mockField, { 'client-name': mockGroup }, { 'client-name': mockErrorEl });
      assert.strictEqual(isValid, true);
      assert.ok(mockField.classes.has('is-valid'));
      assert.ok(!mockGroup.classes.has('has-error'));
    });
  });

  describe('Email Validation', () => {
    test('should fail if email is empty', () => {
      mockField.id = 'client-email';
      mockField.value = '';
      const isValid = validateField(mockField, { 'client-email': mockGroup }, { 'client-email': mockErrorEl });
      assert.strictEqual(isValid, false);
    });

    test('should fail with invalid email format', () => {
      mockField.id = 'client-email';
      mockField.value = 'invalid-email';
      const isValid = validateField(mockField, { 'client-email': mockGroup }, { 'client-email': mockErrorEl });
      assert.strictEqual(isValid, false);
    });

    test('should pass with valid email', () => {
      mockField.id = 'client-email';
      mockField.value = 'test@example.com';
      const isValid = validateField(mockField, { 'client-email': mockGroup }, { 'client-email': mockErrorEl });
      assert.strictEqual(isValid, true);
    });
  });

  describe('Project Details Validation', () => {
    test('should fail if project type is not selected', () => {
      mockField.id = 'project-type';
      mockField.value = '';
      const isValid = validateField(mockField, { 'project-type': mockGroup }, { 'project-type': mockErrorEl });
      assert.strictEqual(isValid, false);
    });

    test('should fail if project title is too short', () => {
      mockField.id = 'project-title';
      mockField.value = 'Ab';
      const isValid = validateField(mockField, { 'project-title': mockGroup }, { 'project-title': mockErrorEl });
      assert.strictEqual(isValid, false);
    });

    test('should fail if project goals are too short', () => {
      mockField.id = 'project-goals';
      mockField.value = 'Too short'; // < 20
      const isValid = validateField(mockField, { 'project-goals': mockGroup }, { 'project-goals': mockErrorEl });
      assert.strictEqual(isValid, false);
    });

    test('should pass with valid project goals', () => {
      mockField.id = 'project-goals';
      mockField.value = 'This is a long enough project description that should pass the validation rule.';
      const isValid = validateField(mockField, { 'project-goals': mockGroup }, { 'project-goals': mockErrorEl });
      assert.strictEqual(isValid, true);
    });
  });

  describe('Budget and Urgency Validation', () => {
    test('should fail if urgency is empty', () => {
      mockField.id = 'project-urgency';
      mockField.value = '';
      const isValid = validateField(mockField, { 'project-urgency': mockGroup }, { 'project-urgency': mockErrorEl });
      assert.strictEqual(isValid, false);
    });

    test('should fail if budget is empty', () => {
      mockField.id = 'project-budget';
      mockField.value = '';
      const isValid = validateField(mockField, { 'project-budget': mockGroup }, { 'project-budget': mockErrorEl });
      assert.strictEqual(isValid, false);
    });
  });

  describe('Non-validated fields', () => {
    test('should return true for fields without rules', () => {
      mockField.id = 'client-company';
      mockField.value = '';
      const isValid = validateField(mockField);
      assert.strictEqual(isValid, true);
    });
  });
});
