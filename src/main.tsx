import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import seed data functions for testing (DELETE BEFORE PRODUCTION)
import './data/seedData';

createRoot(document.getElementById("root")!).render(<App />);
