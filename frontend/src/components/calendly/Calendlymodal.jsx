import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import '../calendly/Calendlymodal.css'; // Ensure path is correct

const CalendlyModal = ({ isOpen, onClose, calendlyUrl }) => {
  const [isLoading, setIsLoading] = useState(true);

  // We construct the themed URL to match your Landing Page colors
  const getThemedUrl = (url) => {
    if (!url) return "";
    const separator = url.includes("?") ? "&" : "?";
    // background_color=020617 (Your --dark-bg)
    // text_color=ffffff (White)
    // primary_color=10b981 (Your --primary)
    return `${url}${separator}background_color=020617&text_color=ffffff&primary_color=10b981&hide_event_type_details=1`;
  };

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      document.body.style.overflow = 'hidden';

      // Load Calendly script if not present
      const scriptSrc = 'https://assets.calendly.com/assets/external/widget.js';
      if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
        const script = document.createElement('script');
        script.src = scriptSrc;
        script.async = true;
        document.body.appendChild(script);
      }

      // Artificial delay to smooth out the transition while iframe loads
      const timer = setTimeout(() => setIsLoading(false), 1500);
      return () => {
        document.body.style.overflow = 'unset';
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="calendly-modal-overlay" onClick={onClose}>
      <div className="calendly-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header / Close Button */}
        <div className="calendly-modal-header">
           <span className="modal-title">Book a Demo</span>
           <button className="calendly-close-btn" onClick={onClose}>
             <X size={20} />
           </button>
        </div>
        
        {/* Loading Spinner */}
        {isLoading && (
          <div className="calendly-loading">
            <Loader2 className="calendly-spinner" size={48} />
            <p>Syncing with DeepMind...</p>
          </div>
        )}
        
        {/* Calendly Widget */}
        <div className="calendly-widget-wrapper">
            <div
            className="calendly-inline-widget"
            data-url={getThemedUrl(calendlyUrl)}
            style={{ 
                minWidth: '320px', 
                height: '700px',
                width: '100%'
            }}
            ></div>
        </div>
      </div>
    </div>
  );
};

export default CalendlyModal;