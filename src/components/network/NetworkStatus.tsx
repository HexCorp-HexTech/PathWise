/* ============================================
   VIDYA AI — Network Status Indicator
   ============================================ */
import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Signal } from 'lucide-react';
import { networkManager } from '../../lib/network';
import type { NetworkState } from '../../types';
import './NetworkStatus.css';

export const NetworkStatusPill: React.FC = () => {
  const [state, setState] = useState<NetworkState>(networkManager.getState());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsub = networkManager.subscribe((newState) => {
      setState(newState);
      if (newState !== 'online') {
        setVisible(true);
      } else {
        // Show "back online" briefly then hide
        setVisible(true);
        setTimeout(() => setVisible(false), 3000);
      }
    });

    // Initial: only show if not online
    if (networkManager.getState() !== 'online') {
      setVisible(true);
    }

    return unsub;
  }, []);

  if (!visible) return null;

  const config = {
    online: { icon: <Wifi size={14} />, label: 'Back Online', className: 'network-pill--online' },
    offline: { icon: <WifiOff size={14} />, label: 'Offline Mode', className: 'network-pill--offline' },
    syncing: { icon: <RefreshCw size={14} className="network-pill__spin" />, label: 'Syncing...', className: 'network-pill--syncing' },
    poor: { icon: <Signal size={14} />, label: 'Poor Connection', className: 'network-pill--poor' },
  };

  const { icon, label, className } = config[state];

  return (
    <div className={`network-pill ${className}`} role="status" aria-live="polite">
      {icon}
      <span>{label}</span>
    </div>
  );
};
