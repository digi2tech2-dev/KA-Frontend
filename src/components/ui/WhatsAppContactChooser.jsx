import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import Modal from './Modal';
import { buildWhatsAppLink, getSupportContacts } from '../../utils/whatsapp';

const WhatsAppContactChooser = ({ isOpen, onClose, message = '', isArabic = true }) => {
  const contacts = getSupportContacts();

  const openContact = (contact) => {
    window.open(buildWhatsAppLink({ number: contact.number, message }), '_blank', 'noopener,noreferrer');
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xxs"
      title={isArabic ? 'تواصل مع فريق KA-CARD' : 'Contact the KA-CARD team'}
    >
      <div dir={isArabic ? 'rtl' : 'ltr'}>
        <p className="mb-4 text-sm font-bold leading-6 text-[var(--color-text-secondary)]">
          {isArabic ? 'اختر الشخص الذي تريد التواصل معه عبر واتساب' : 'Choose who you would like to contact on WhatsApp'}
        </p>
        <div className="grid gap-3">
          {contacts.map((contact) => (
            <button
              key={contact.number}
              type="button"
              onClick={() => openContact(contact)}
              className="group flex w-full items-center gap-3 rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.8)] bg-[color:rgb(var(--color-surface-rgb)/0.7)] p-3 text-start transition hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.55)] hover:shadow-[var(--shadow-subtle)]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                <MessageCircle className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block text-sm font-black text-[var(--color-text)]">
                  {isArabic ? contact.nameAr : contact.nameEn}
                </strong>
                <span dir="ltr" className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)]">
                  <Phone className="h-3.5 w-3.5" />
                  {contact.number}
                </span>
              </span>
              <span className="text-xs font-black text-emerald-500">
                {isArabic ? 'تواصل' : 'Chat'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default WhatsAppContactChooser;
