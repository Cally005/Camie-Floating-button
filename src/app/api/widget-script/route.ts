import { NextResponse } from 'next/server';

export async function GET() {
  const script = `
(function() {
  if (window.embedCamieButton) return;

  window.embedCamieButton = function(config) {
    const script = document.createElement('script');
    script.src = '/_next/static/chunks/camie-floating-button.js';
    script.onload = function() {
      if (window.initCamieFloatingButton) {
        window.initCamieFloatingButton(config || {});
      }
    };
    document.body.appendChild(script);
  };
})();
`;
  
  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    }
  });
}