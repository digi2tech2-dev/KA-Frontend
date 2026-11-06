import React, { useEffect } from 'react';
import { Headphones, MessageCircle, UserRound, Venus } from 'lucide-react';
import Modal from './Modal';
import { buildWhatsAppLink, resolveSupportContacts } from '../../utils/whatsapp';
import useSystemStore from '../../store/useSystemStore';

const WhatsAppContactChooser = ({ isOpen, onClose, onSelected, message = '', isArabic = true }) => {
  const paymentSettings = useSystemStore((state) => state.paymentSettings);
  const loadPaymentSettings = useSystemStore((state) => state.loadPaymentSettings);
  useEffect(() => { if (isOpen) void loadPaymentSettings({ force: true }); }, [isOpen, loadPaymentSettings]);
  const savedContacts = paymentSettings?.supportContacts;
  const contacts = resolveSupportContacts(savedContacts, isArabic);

  const openWhatsApp = (contact) => {
    const whatsappLink = buildWhatsAppLink({ number: contact.number, message });
    if (!whatsappLink) return;
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
    onSelected?.();
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xxs"
      title={isArabic ? 'تواصل مع فريق AD CARD' : 'Contact the AD CARD team'}
    >
      <div dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="rounded-3xl border border-cyan-300/20 bg-[radial-gradient(circle_at_top,#123a5b,transparent_68%),linear-gradient(145deg,#0a1727,#102b42)] p-5 text-center text-white shadow-[0_20px_42px_-28px_rgba(8,127,155,0.9)]">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-cyan-200/20 bg-cyan-400/10 text-cyan-100">
            <Headphones className="h-8 w-8" />
          </span>
          <strong className="mt-3 block text-lg font-black tracking-wide">AD</strong>
          <span className="block text-[10px] font-black tracking-[0.22em] text-cyan-200">WHATSAPP</span>
          <p className="mt-3 text-sm font-bold leading-6 text-slate-200">
            {isArabic ? 'اختر جهة التواصل المناسبة لبدء المحادثة.' : 'Choose a contact to start a conversation.'}
          </p>
          <div className="mt-4 grid gap-2 text-start">
            {contacts.map((contact) => {
              const ContactIcon = contact.icon === 'female' ? Venus : contact.icon === 'support' ? Headphones : UserRound;
              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => openWhatsApp(contact)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.08] p-3 transition hover:-translate-y-0.5 hover:border-cyan-200/50 hover:bg-white/[0.14]"
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${contact.icon === 'female' ? 'border-pink-200/30 bg-pink-400/15 text-pink-100' : 'border-cyan-200/30 bg-cyan-400/15 text-cyan-100'}`}>
                    <ContactIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-sm font-black tracking-wide text-white">{contact.name}</strong>
                    {contact.role && <span className="block text-xs text-cyan-100">{contact.role}</span>}
                    <span dir="ltr" className="mt-0.5 block text-xs font-bold text-slate-300">{contact.number}</span>
                  </span>
                  <MessageCircle className="h-4 w-4 shrink-0 text-emerald-300 transition group-hover:scale-110" />
                </button>
              );
            })}
            {contacts.length === 0 && <p className="text-center text-sm text-slate-300">{isArabic ? 'لا توجد جهات تواصل متاحة حاليًا.' : 'No contacts are available right now.'}</p>}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WhatsAppContactChooser;
