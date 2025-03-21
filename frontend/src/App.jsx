import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Keep Router here
import { useLocation } from "react-router-dom";
import Header from "./components/Header";
import AnimatedRoutes from "./components/AnimatedRoutes.jsx"; // Import the new AnimatedRoutes component
import Ceramic from "./pages/ceramic";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <>
      {!isHomePage && <Header />}
      <AnimatedRoutes /> {/* Use the AnimatedRoutes component here */}
    </>
  );
}

export default App;


