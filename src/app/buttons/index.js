"use client";

import { FloatingButton } from "./FloatingButton"; // Adjust import path
import React from 'react';

// Embedding Function for global access
const embedFloatingButton = (config = {}) => {
  // Ensure React and ReactDOM are available
  if (typeof window === 'undefined' || !window.React || !window.ReactDOM) {
    console.error('Required libraries not loaded');
    return;
  }

  // Create a container for the button
  const container = document.createElement('div');
  container.id = 'floating-button-container';
  document.body.appendChild(container);

  // Render the button
  window.ReactDOM.render(
    <React.StrictMode>
      <FloatingButton {...config} />
    </React.StrictMode>,
    container
  );
};

// Expose the embedding function globally
if (typeof window !== 'undefined') {
  window.embedFloatingButton = embedFloatingButton;
}

