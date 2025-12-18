import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AdminAuthProvider } from "../src/contexts/AdminAuthContext.tsx";

createRoot(document.getElementById("root")!).render(
<AdminAuthProvider>
  <App />
</AdminAuthProvider>
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // console.log("SW registrado", registration.scope);
        })
        .catch((err) => {
          console.error("SW error", err);
        });
    });
  }