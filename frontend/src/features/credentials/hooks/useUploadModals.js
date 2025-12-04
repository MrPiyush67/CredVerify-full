import { useState, useEffect } from 'react';

export default function useUploadModals() {
  const [activeModal, setActiveModal] = useState(null);

  // Check for DigiLocker callback on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const digilockerParam = params.get('digilocker');

    if (digilockerParam === 'connected') {
      console.log('DigiLocker callback detected - opening modal');
      setActiveModal('digilocker');
    }
  }, []);

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  return {
    activeModal,
    openModal,
    closeModal,
    modals: {
      isCertificateQrOpen: activeModal === 'certificateQr',
      isLinkVerificationOpen: activeModal === 'linkVerification',
      isPortfolioOpen: activeModal === 'portfolio',
      isValidantOpen: activeModal === 'validant',
      isExtensionOpen: activeModal === 'extension',
      isDigilockerOpen: activeModal === 'digilocker',
    },
  };
}
