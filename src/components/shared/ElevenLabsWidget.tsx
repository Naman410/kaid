
import { useEffect } from 'react';

// Configuration
const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
const SCRIPT_ID = 'elevenlabs-widget-script';
const WIDGET_ID = 'elevenlabs-widget-container';
const SCRIPT_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';

const ElevenLabsWidget = () => {
  useEffect(() => {
    if (!AGENT_ID) {
      console.error('ElevenLabs Agent ID is not configured in .env.local');
      return;
    }

    // Check if script already exists
    if (document.getElementById(SCRIPT_ID)) {
      return;
    }

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = WIDGET_ID;
    widgetContainer.style.position = 'fixed';
    widgetContainer.style.zIndex = '9999';

    // Create the elevenlabs-convai element
    const convaiElement = document.createElement('elevenlabs-convai');
    convaiElement.setAttribute('agent-id', AGENT_ID);
    convaiElement.setAttribute('widget-mode', 'floating');
    convaiElement.setAttribute('widget-position', 'bottom-right');
    convaiElement.setAttribute('primary-color', '#A78BFA'); // Purple to match theme

    widgetContainer.appendChild(convaiElement);
    document.body.appendChild(widgetContainer);

    // Load the ElevenLabs script
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      const existingScript = document.getElementById(SCRIPT_ID);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }

      const existingWidget = document.getElementById(WIDGET_ID);
      if (existingWidget) {
        document.body.removeChild(existingWidget);
      }
    };
  }, []);

  return null; // This component doesn't render anything in React
};

export default ElevenLabsWidget;
