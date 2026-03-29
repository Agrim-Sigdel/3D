import React from 'react';
import { Link } from 'react-router-dom';
import BackButton from './BackButton';

const screens = [
  { num: 1, label: 'Screen 1' },
  { num: 2, label: 'Screen 2' },
  { num: 3, label: 'Screen 3' },
  { num: 4, label: 'Screen 4' },
  { num: 5, label: 'Screen 5' },
  { num: 6, label: 'Screen 6' },
  { num: 7, label: 'Screen 7' },
  { num: 8, label: 'Screen 8' },
  { num: 9, label: 'Screen 9' },
];

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: 32, marginBottom: 32 }}>Choose a Screen</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 40 }}>
        {screens.map(s => (
          <Link
            key={s.num}
            to={`/screen/${s.num}`}
            style={{
              padding: '18px 36px',
              background: '#222',
              color: '#fff',
              borderRadius: 10,
              fontSize: 20,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 12px #0007',
              transition: 'background 0.2s',
              display: 'inline-block',
            }}
          >
            {s.label}
          </Link>
        ))}
      </div>
      <BackButton to={-1} label="Back" />
    </div>
  );
}
