import { BrowserRouter as Router } from "react-router-dom"; // Keep Router here
import Header from "./components/Header";
import AnimatedRoutes from "./components/AnimatedRoutes.jsx"; // Import the new AnimatedRoutes component
import Ceramic from "./pages/ceramic";

function App() {
  return (
    <Router>
      <Header />
      <AnimatedRoutes /> {/* Use the AnimatedRoutes component here */}
    </Router>
  );
}

export default App;

