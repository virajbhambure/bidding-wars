import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import reducer from "./reducers/index.js";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const root = createRoot(document.getElementById("root"));

const store = configureStore({ reducer });

root.render(
  <BrowserRouter>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <Provider store={store}>
        <App />
      </Provider>
    </ClerkProvider>
  </BrowserRouter>
);
