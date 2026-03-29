import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BackButton({ to = -1, label = 'Back' }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
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
