import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Screen1 from './screens/1.jsx';
import Home from './screens/Home.jsx';
import Screen2 from './screens/2.jsx';
import Screen3 from './screens/3.jsx';
import Screen4 from './screens/4.jsx';
import Screen5 from './screens/5.jsx';
import Screen6 from './screens/6.jsx';
import Screen7 from './screens/7.jsx';
import Screen8 from './screens/8.jsx';
import Screen9 from './screens/9.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/screen/1" element={<Screen1 />} />
        <Route path="/screen/2" element={<Screen2 />} />
        <Route path="/screen/3" element={<Screen3 />} />
        <Route path="/screen/4" element={<Screen4 />} />
        <Route path="/screen/5" element={<Screen5 />} />
        <Route path="/screen/6" element={<Screen6 />} />
        <Route path="/screen/7" element={<Screen7 />} />
        <Route path="/screen/8" element={<Screen8 />} />
        <Route path="/screen/9" element={<Screen9 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
