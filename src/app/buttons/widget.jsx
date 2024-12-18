"use client";

import React from 'react';
import FloatingButton from './FloatingButton';


export function initCamieFloatingButton(config = {}) {
  if (typeof window !== 'undefined') {
    const container = document.createElement('div');
    container.id = 'camie-floating-button-container';
    document.body.appendChild(container);

    import('react-dom/client').then((ReactDOM) => {
      const root = ReactDOM.createRoot(container);
      root.render(
        <React.StrictMode>
          <FloatingButton {...config} />
        </React.StrictMode>
      );
    });
  }
}

if (typeof window !== 'undefined') {
  (window ).initCamieFloatingButton = initCamieFloatingButton;
}