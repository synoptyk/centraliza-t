/**
 * Simple in-memory Rate Limiter Middleware
 * Limits requests per IP within a given time window.
 * For production at scale, replace with express-rate-limit + Redis store.
 */

const rateLimitStore = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore) {
        if (now > data.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Creates a rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 min)
 * @param {number} options.max - Max requests per window (default: 100)
 * @param {string} options.message - Error message
 */
const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 100, message = 'Demasiadas solicitudes. Intente nuevamente más tarde.' } = {}) => {
    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        if (!rateLimitStore.has(key)) {
            rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }

        const record = rateLimitStore.get(key);

        // Reset if window expired
        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + windowMs;
            return next();
        }

        record.count++;

        if (record.count > max) {
            res.set('Retry-After', Math.ceil((record.resetTime - now) / 1000));
            return res.status(429).json({
                message,
                retryAfter: Math.ceil((record.resetTime - now) / 1000)
            });
        }

        next();
    };
};

// Pre-configured limiters
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }); // 500 req/15min
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: 'Demasiados intentos de autenticación. Espere 15 minutos.' }); // 30 login attempts/15min
const apiLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 60 }); // 60 req/min for API

module.exports = { rateLimit, globalLimiter, authLimiter, apiLimiter };
