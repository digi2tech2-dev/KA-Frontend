const SUPPORT_CONTACTS = Object.freeze([
  { nameAr: 'جاسر كارد', nameEn: 'Jaser Card', number: '01503222311' },
  { nameAr: 'أحمد كارد', nameEn: 'Ahmed Card', number: '01012286661' },
]);
const FALLBACK_WHATSAPP_NUMBER = SUPPORT_CONTACTS[0].number;
const ENV_ADMIN_WHATSAPP_NUMBER =
  import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER
  || import.meta.env.ADMIN_WHATSAPP_NUMBER
  || '';

export const normalizeWhatsAppNumber = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return FALLBACK_WHATSAPP_NUMBER;

  // Support local numbers like 010xxxxxxxx by defaulting to Egypt country code.
  if (digits.startsWith('0') && digits.length >= 10) {
    return `20${digits.replace(/^0+/, '')}`;
  }

  return digits;
};

export const buildWhatsAppLink = ({ number, message = '' }) => {
  const normalizedNumber = normalizeWhatsAppNumber(number);
  const text = String(message || '').trim();
  const suffix = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${normalizedNumber}${suffix}`;
};

export const getDefaultWhatsAppNumber = () => FALLBACK_WHATSAPP_NUMBER;
export const getAdminWhatsAppNumber = () => normalizeWhatsAppNumber(ENV_ADMIN_WHATSAPP_NUMBER || FALLBACK_WHATSAPP_NUMBER);
export const getSupportContacts = () => SUPPORT_CONTACTS;
