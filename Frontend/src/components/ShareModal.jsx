import React, { useState } from 'react';
import { Copy, Check, Sparkles, MessageCircle, Mail, Globe, Share2, Download } from 'lucide-react';

export const ShareModal = ({ shareData, onClose, tripTitle }) => {
  const [copied, setCopied] = useState(false);

  if (!shareData) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be unavailable */
    }
  };

  const shareText = encodeURIComponent(`Check out my trip itinerary: ${tripTitle || 'My Trip'}`);
  const shareUrl = encodeURIComponent(shareData.shareUrl);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-2.5 bg-indigo-50 rounded-2xl text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Your trip is ready to share!</h3>
          <p className="text-xs text-slate-500">Anyone with this link can view your itinerary.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
          <input
            type="text"
            readOnly
            value={shareData.shareUrl}
            className="flex-1 bg-transparent text-indigo-600 text-xs font-mono px-2 focus:outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="btn-primary shrink-0 !px-3 !py-2"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {shareData.qrCodeDataUrl && (
          <div className="flex justify-center">
            <img
              src={shareData.qrCodeDataUrl}
              alt="QR Code"
              className="w-32 h-32 rounded-2xl border border-slate-200 p-2"
            />
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Share via</p>
          <div className="flex items-center justify-center gap-3">
            <a
              href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
              title="WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <a
              href={`mailto:?subject=${shareText}&body=${shareUrl}`}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              title="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="Facebook"
            >
              <Globe className="w-5 h-5" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
              title="X"
            >
              <Share2 className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs bg-slate-50 rounded-xl p-3 border border-slate-100">
          <span className="text-slate-600">Anyone with the link can view</span>
          <span className="text-indigo-600 font-semibold">Public</span>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => window.print()}
            className="btn-secondary flex-1 justify-center"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
          <button onClick={onClose} className="btn-primary flex-1 justify-center">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
