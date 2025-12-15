import NodeCache from 'node-cache';

// Create cache instance with 2 minute TTL
const cache = new NodeCache({
  stdTTL: 120, // 2 minutes
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false
});

export default cache;
