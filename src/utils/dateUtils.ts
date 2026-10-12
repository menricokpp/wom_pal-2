// Utility functions for dynamic real-time dates and Indonesian locale formatting

const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Format full date in Indonesian, e.g. "Senin, 05 Oktober 2026"
 */
export function formatIndonesianFullDate(date: Date = new Date()): string {
  const dayName = INDONESIAN_DAYS[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const monthName = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${monthName} ${year}`;
}

/**
 * Format date in Indonesian without day name, e.g. "05 Oktober 2026"
 */
export function formatIndonesianDateShort(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const monthName = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${monthName} ${year}`;
}

/**
 * Format Month & Year in Indonesian, e.g. "Oktober 2026"
 */
export function formatIndonesianMonthYear(date: Date = new Date()): string {
  const monthName = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${monthName} ${year}`;
}

/**
 * Format live clock time with 2-digit seconds, e.g. "11:25:04"
 */
export function formatIndonesianTime(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Milestone status helper based on calendar day of month
 */
export function getMilestoneDetails(date: Date = new Date()) {
  const day = date.getDate();

  if (day <= 7) {
    return {
      activeWeek: 'W1',
      cutoffDay: 7,
      label: 'W1 (Cut-off Tgl 7)',
      daysRemaining: Math.max(0, 7 - day),
      description: 'Milestone W1 aktif berjalan menuju cut-off tanggal 7.',
    };
  } else if (day <= 14) {
    return {
      activeWeek: 'W2',
      cutoffDay: 14,
      label: 'W2 (Cut-off Tgl 14)',
      daysRemaining: Math.max(0, 14 - day),
      description: 'Milestone W2 aktif berjalan menuju cut-off tanggal 14.',
    };
  } else if (day <= 21) {
    return {
      activeWeek: 'W3',
      cutoffDay: 21,
      label: 'W3 (Cut-off Tgl 21)',
      daysRemaining: Math.max(0, 21 - day),
      description: 'Milestone W3 aktif berjalan menuju cut-off tanggal 21.',
    };
  } else {
    return {
      activeWeek: 'W4',
      cutoffDay: 28,
      label: 'W4 (Cut-off Tgl 28)',
      daysRemaining: Math.max(0, 28 - day),
      description: 'Milestone W4 aktif berjalan menuju cut-off tanggal 28.',
    };
  }
}
