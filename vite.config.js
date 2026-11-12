import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const platform = 'http://localhost:8081';
const ppf = 'http://localhost:8082';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth': platform,
      '/api/users': platform,
      '/api/sols': platform,
      '/api/branches': platform,
      '/api/session': platform,
      '/api/admin-change-requests': platform,
      '/api/admin-change-candidates': platform,
      '/api/registration-approvals': platform,
      '/api/audit-logs': platform,
      '/api/ppf': ppf,
    },
  },
});
