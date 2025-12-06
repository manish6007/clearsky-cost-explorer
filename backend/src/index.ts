import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Cloud Cost Explorer API running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available:`);
    console.log(`   GET /api/domains`);
    console.log(`   GET /api/services`);
    console.log(`   GET /api/costs?from=&to=&domainIds=&serviceIds=&environments=`);
    console.log(`   GET /api/costs/summary`);
    console.log(`   GET /api/stats`);
});

export default app;
