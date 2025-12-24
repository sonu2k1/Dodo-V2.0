const app = require('./src/app');
const config = require('./src/config/env');

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║           DoDo v2.0 API Server Started            ║
╠═══════════════════════════════════════════════════╣
║  Environment: ${config.env.padEnd(35)}║
║  Port: ${String(PORT).padEnd(42)}║
║  API: http://localhost:${PORT}${config.apiPrefix.padEnd(22)}║
╚═══════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
