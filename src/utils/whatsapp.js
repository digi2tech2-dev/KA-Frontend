const SUPPORT_CONTACTS = Object.freeze([
  { name: 'AHMED CARD', number: '01012286661', icon: 'male' },
  { name: 'DARREN CARD', number: '01013669339', icon: 'female' },
  { name: 'خدمة العملاء', number: '01112121289', icon: 'support' },
]);

const ENV_ADMIN_WHATSAPP_NUMBER =
  import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER
  || import.meta.env.ADMIN_WHATSAPP_NUMBER
  || '';

export const normalizeWhatsAppNumber = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';

  // Support local numbers like 010xxxxxxxx by defaulting to Egypt country code.
  if (digits.startsWith('0') && digits.length >= 10) {
    return `20${digits.replace(/^0+/, '')}`;
  }

  return digits;
};

export const buildWhatsAppLink = ({ number, message = '' }) => {
  const normalizedNumber = normalizeWhatsAppNumber(number);
  if (!normalizedNumber) return null;
  const text = String(message || '').trim();
  const suffix = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${normalizedNumber}${suffix}`;
};

export const getDefaultWhatsAppNumber = () => normalizeWhatsAppNumber(ENV_ADMIN_WHATSAPP_NUMBER || SUPPORT_CONTACTS[0].number);
export const getAdminWhatsAppNumber = () => normalizeWhatsAppNumber(ENV_ADMIN_WHATSAPP_NUMBER || SUPPORT_CONTACTS[0].number);
export const getSupportContacts = () => SUPPORT_CONTACTS;

// An explicitly saved empty list means there are no public contacts.
export const resolveSupportContacts = (value, isArabic = true) => {
  if (!value) return [];
  if (Array.isArray(value?.entries)) return value.entries;
  if (value?.owner || value?.support) return [
    ...(value.owner ? [{ id: 'legacy-owner', name: isArabic ? 'صاحب الموقع' : 'Site owner', role: isArabic ? 'الإدارة' : 'Management', number: value.owner }] : []),
    ...(value.support ? [{ id: 'legacy-support', name: isArabic ? 'خدمة العملاء' : 'Customer support', role: isArabic ? 'الدعم' : 'Support', number: value.support }] : []),
  ];
  return SUPPORT_CONTACTS.map((contact, index) => ({ id: `default-${index}`, name: contact.name,
    role: isArabic ? 'خدمة العملاء' : 'Customer support', number: `+${normalizeWhatsAppNumber(contact.number)}` }));
};
