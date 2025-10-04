import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Cache buster for mobile - v2

// Service worker temporarily disabled for debugging
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then((registration) => {
//         console.log('SW registered: ', registration);
//       })
//       .catch((registrationError) => {
//         console.log('SW registration failed: ', registrationError);
//       });
//   });
// }

createRoot(document.getElementById("root")!).render(<App />);
