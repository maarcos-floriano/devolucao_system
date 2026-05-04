module.exports = {
  apps: [
    {
      name: 'devolucao-system-api',
      cwd: './back',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      max_memory_restart: '512M',
    },
  ],
};
