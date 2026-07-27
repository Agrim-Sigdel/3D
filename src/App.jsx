import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './screens/Home.jsx';
import { ROUTES } from './templates.js';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {ROUTES.map(({ key, path, component: Template, props }) => (
          <Route key={key} path={path} element={<Template {...props} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
