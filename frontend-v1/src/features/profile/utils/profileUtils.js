export const formatRole = (role) =>
  role.charAt(0).toUpperCase() + role.slice(1);

export const formatDateRange = (startDate, endDate, current) => {
  const format = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const start = format(startDate);
  const end = current ? 'Present' : format(endDate);
  return [start, end].filter(Boolean).join(' – ');
};
