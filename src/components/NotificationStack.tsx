// ============================================================
// NotificationToast
// Fixed top-right notification stack.
// Each toast auto-dismisses after 2.8s with a GSAP fade out.
// ============================================================

import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import type { NotificationItem } from '../types';

interface ToastProps {
  item: NotificationItem;
  onDismiss: (id: string) => void;
}

function Toast({ item, onDismiss }: ToastProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Slide in from right
    gsap.fromTo(ref.current, {
      opacity: 0,
      x: 30,
    }, {
      opacity: 1,
      x: 0,
      duration: 0.38,
      ease: 'power3.out',
    });
  }, { scope: ref });

  useEffect(() => {
    const timer = setTimeout(() => {
      gsap.to(ref.current, {
        opacity: 0,
        x: 20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => onDismiss(item.id),
      });
    }, 2800);
    return () => clearTimeout(timer);
  }, [item.id, onDismiss]);

  return (
    <div
      ref={ref}
      className={`notif-toast ${item.type === 'red' ? 'red' : ''}`}
      style={{ padding: '10px 18px' }}
    >
      {item.message}
    </div>
  );
}

interface Props {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}

export function NotificationStack({ notifications, onDismiss }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 80,
        right: 20,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {notifications.map(n => (
        <Toast key={n.id} item={n} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
