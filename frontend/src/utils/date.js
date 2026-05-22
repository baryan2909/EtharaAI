/**
 * Safe date formatting helper to prevent fatal rendering exceptions (e.g. RangeError)
 * on invalid, blank, or malformed dates.
 * 
 * @param {string|Date} dateString - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string or 'No date' fallback
 */
export const formatDate = (dateString, options = { month: 'short', day: 'numeric' }) => {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'No date';
  }
  try {
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('formatDate error:', error);
    return 'No date';
  }
};

/**
 * Safe conversion of date string to YYYY-MM-DD format for HTML5 inputs.
 * Prevents throwing RangeError: Invalid time value.
 * 
 * @param {string|Date} dateString - The date to format
 * @returns {string} Date string in YYYY-MM-DD format or empty string fallback
 */
export const formatInputDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return '';
  }
  try {
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('formatInputDate error:', error);
    return '';
  }
};

/**
 * Safe overdue date checker.
 * 
 * @param {string|Date} dateString - Due date
 * @param {string} status - Current status of task (e.g., 'Completed')
 * @returns {boolean} True if incomplete and overdue
 */
export const isDateOverdue = (dateString, status) => {
  if (!dateString || status === 'Completed') return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  return date < new Date();
};
