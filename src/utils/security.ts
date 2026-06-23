/**
 * TakaHub Pro Advanced Security Shield
 * Anti-Hack, Anti-Scrape, Anti-Reverse Engineering, and Input Sanitization Module
 */

import { ref, push, set } from 'firebase/database';
import { db } from '../firebase';

// Simple in-memory rate limiter for client actions
const actionTimestamps: Record<string, number[]> = {};

/**
 * Client-Side Action Rate Limiter (to prevent automated script spamming / macro tools)
 * Returns true if action is allowed, false if rate limit is exceeded
 */
export function isActionAllowed(actionKey: string, maxActionsPerMinute = 20): boolean {
  const now = Date.now();
  if (!actionTimestamps[actionKey]) {
    actionTimestamps[actionKey] = [];
  }
  
  // Clean timestamps older than 60 seconds
  actionTimestamps[actionKey] = actionTimestamps[actionKey].filter(t => now - t < 60000);
  
  if (actionTimestamps[actionKey].length >= maxActionsPerMinute) {
    return false;
  }
  
  actionTimestamps[actionKey].push(now);
  return true;
}

/**
 * Sanitizes user inputs to prevent XSS (Cross-Site Scripting) and HTML Injections.
 * Highly robust regex filters out tags, inline JavaScript, event listeners, and hazardous protocols.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  let cleaned = input.trim();
  
  // 1. Remove script tags and style tags recursively
  cleaned = cleaned.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
  
  // 2. Remove standard HTML tags entirely to prevent DOM manipulation
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // 3. Strip Javascript event handlers (e.g. onload, onerror, onclick, onmouseover)
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*(['"][^'"]*['"]|[^>\s]+)/gi, '');
  
  // 4. Clean javascript: and data: URLs
  cleaned = cleaned.replace(/href\s*=\s*(['"]\s*(javascript|data):[^'"]*['"]|[^>\s]+)/gi, '');
  
  // 5. Escape HTML special characters for redundant safety inside context-sensitive blocks
  cleaned = cleaned
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return cleaned;
}

/**
 * Scans string for malicious payload injections (SQL/XSS patterns)
 * Returns true if input looks suspicious
 */
export function isMaliciousInput(input: string): boolean {
  if (!input) return false;
  const decoded = decodeURIComponent(input).toLowerCase();
  
  const suspiciousSignals = [
    '<script', 'javascript:', 'document.cookie', 'window.location',
    'onclick', 'onerror', 'onload', '<iframe', 'union select',
    'select * from', 'insert into', 'delete from', 'drop table',
    'or 1=1', 'or \'1\'=\'1\'', 'eval(', 'alert(', 'prompt('
  ];
  
  return suspiciousSignals.some(signal => decoded.includes(signal));
}

/**
 * Submits security alerts to Firebase when hacking attempts or system tampering is detected
 */
export async function logSecurityAlert(userId: string | null, userEmail: string | null, alertType: string, details: string) {
  try {
    const alertRef = ref(db, 'security_alerts');
    const newAlertRef = push(alertRef);
    
    await set(newAlertRef, {
      id: newAlertRef.key,
      userId: userId || 'anonymous',
      userEmail: userEmail || 'anonymous',
      alertType,
      details,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      referrer: document.referrer || 'direct'
    });
  } catch (err) {
    console.error('Failed to report security violation:', err);
  }
}

/**
 * Blocks common developer tools shortcuts, right-clicks, and scrapers.
 * Triggers a security alert if the user attempts multiple inspections.
 */
export function initializeSecurityShield(userId: string | null, userEmail: string | null, showToast: (msg: string, type: 'success' | 'err') => void) {
  let violationCount = 0;

  const triggerViolation = (type: string, desc: string) => {
    violationCount++;
    showToast('⚠️ Security Warning: Unauthorised Action Prevented!', 'err');
    
    // Log the attempt to database for admin review if they repeatedly try
    if (violationCount >= 2) {
      logSecurityAlert(userId, userEmail, `Inspect Attempt (${type})`, desc);
    }
  };

  // 1. Disable Right Click Menu (Context Menu)
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    triggerViolation('Right-Click', 'User tried to open developer context menu.');
  };
  document.addEventListener('contextmenu', handleContextMenu);

  // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J, Ctrl+U)
  const handleKeyDown = (e: KeyboardEvent) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      triggerViolation('F12 Press', 'User pressed F12 Key.');
      return;
    }

    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      triggerViolation('DevTools Shortcut', `User pressed Ctrl+Shift+${e.key.toUpperCase()}`);
      return;
    }

    // Ctrl+U / Cmd+U (View Source Code code)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      triggerViolation('View Source Shortcut', 'User pressed View Source (Ctrl+U)');
      return;
    }

    // Ctrl+S / Cmd+S (Save page offline)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      triggerViolation('Save Offline Shortcut', 'User pressed Save Page (Ctrl+S)');
      return;
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  // 3. DevTools inspection logs
  // No-op to avoid CSP / unsafe-eval errors under strict iframe security policies
  const devtoolsTrapInterval = setInterval(() => {
    // Avoid console.clear or debugger statements to remain compliant with CSP
  }, 10000);

  // Return clean-up function
  return () => {
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('keydown', handleKeyDown);
    clearInterval(devtoolsTrapInterval);
  };
}
