import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './screens/Home.jsx';
import { TEMPLATES } from './templates.js';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {TEMPLATES.map(({ slug, component: Template, props }) => (
          <Route key={slug} path={`/t/${slug}`} element={<Template {...props} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
