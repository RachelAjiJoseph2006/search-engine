import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";

import {
  BrowserRouter,
} from "react-router-dom";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <GoogleOAuthProvider
    clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
  >
  <BrowserRouter>
    <App />
  </BrowserRouter>
  </GoogleOAuthProvider>
);