import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * `top`/`left` let a screen nudge the control out from under its own chrome.
 * `fixed` keeps it pinned on the templates that scroll internally — `absolute`
 * would let it scroll away with the content.
 */
export default function BackButton({
  to = -1,
  label = 'Back',
  top = 20,
  left = 20,
  fixed = false,
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      style={{
        position: fixed ? 'fixed' : 'absolute',
        top,
        left,
        zIndex: 1000,
        padding: '8px 18px',
        background: '#222',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        fontWeight: 700,
        fontSize: 16,
        cursor: 'pointer',
        boxShadow: '0 2px 8px #0006',
        opacity: 0.85
      }}
    >
      {label}
    </button>
  );
}
