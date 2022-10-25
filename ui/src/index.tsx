import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { MetaMaskProvider } from "metamask-react";

import App from "./App";
import theme from "./theme";

import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <MetaMaskProvider>
        <App />
      </MetaMaskProvider>
    </ChakraProvider>
  </React.StrictMode>
);
