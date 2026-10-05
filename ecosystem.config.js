module.exports = {
  apps: [
    {
      name: 'force-ui',
      script: 'npm',
      args: 'run preview -- --host 0.0.0.0 --port 4173',
      cwd: __dirname,
      interpreter: 'none',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
