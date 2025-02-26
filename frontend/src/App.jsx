import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Ticket from './pages/Ticket';
import Home from './pages/Home';
import AdminHome from './pages/staff/AdminHome'; 

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home page for root route */}
        <Route path="/tickets" element={<Ticket />} />
        <Route path="/admin" element={<AdminHome />} />
      </Routes>
    </Router>
  );
}

export default App;



