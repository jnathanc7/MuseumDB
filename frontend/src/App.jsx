import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Ticket from './pages/Ticket';
import Home from './pages/Home';
import Exhibitions from './pages/Exhibitions';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home page for root route */}
        <Route path="/tickets" element={<Ticket />} />
        <Route path="/Exhibitions" element={<Exhibitions/>}/>
      </Routes>
    </Router>
  );
}

export default App;



