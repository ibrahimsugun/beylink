import { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const empty = {
  firstName: '', lastName: '', role: '', company: '',
  phone: '', email: '', website: '',
  address: { country: '', city: '', street: '', zip: '' },
  hours: '',
};

export function ContactModal({ open, onClose, block, onSave }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(block?.title || t('contact.cardTitlePlaceholder'));
  const [c, setC] = useState({ ...empty, ...(block?.config || {}), address: { ...empty.address, ...(block?.config?.address || {}) } });

  const set = (k) => (e) => setC((p) => ({ ...p, [k]: e.target.value }));
  const setAddr = (k) => (e) => setC((p) => ({ ...p, address: { ...p.address, [k]: e.target.value } }));

  const save = () => {
    onSave({ title: title.trim() || t('contact.fallbackTitle'), config: c });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('contact.modalTitle')}
      maxWidth="max-w-xl"
      footer={<>
        <button onClick={onClose} className="btn-ghost">{t('common.cancel')}</button>
        <button onClick={save} className="btn-brand">{t('common.save')}</button>
      </>}
    >
      <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1 thin-scroll">
        <div>
          <label className="label">{t('contact.cardTitleLabel')}</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('contact.cardTitlePlaceholder')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">{t('contact.firstName')}</label><input className="input" value={c.firstName} onChange={set('firstName')} /></div>
          <div><label className="label">{t('contact.lastName')}</label><input className="input" value={c.lastName} onChange={set('lastName')} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">{t('contact.role')}</label><input className="input" value={c.role} onChange={set('role')} placeholder={t('contact.rolePlaceholder')} /></div>
          <div><label className="label">{t('contact.company')}</label><input className="input" value={c.company} onChange={set('company')} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">{t('contact.phone')}</label><input className="input" value={c.phone} onChange={set('phone')} placeholder={t('contact.phonePlaceholder')} /></div>
          <div><label className="label">{t('contact.email')}</label><input className="input" value={c.email} onChange={set('email')} placeholder={t('contact.emailPlaceholder')} /></div>
        </div>
        <div><label className="label">{t('contact.website')}</label><input className="input" value={c.website} onChange={set('website')} placeholder={t('contact.websitePlaceholder')} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">{t('contact.country')}</label><input className="input" value={c.address.country} onChange={setAddr('country')} /></div>
          <div><label className="label">{t('contact.city')}</label><input className="input" value={c.address.city} onChange={setAddr('city')} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">{t('contact.address')}</label><input className="input" value={c.address.street} onChange={setAddr('street')} /></div>
          <div><label className="label">{t('contact.zip')}</label><input className="input" value={c.address.zip} onChange={setAddr('zip')} /></div>
        </div>
        <div><label className="label">{t('contact.hours')}</label><input className="input" value={c.hours} onChange={set('hours')} placeholder={t('contact.hoursPlaceholder')} /></div>
      </div>
    </Modal>
  );
}
