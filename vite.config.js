import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode in the root directory
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    // Make all environment variables available to the app
    define: {
      'process.env': env
    }
  };
});