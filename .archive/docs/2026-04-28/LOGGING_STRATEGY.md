# Logging & Log Rotation Strategy

**Status**: Implemented with Pino logger
**Rotation**: File size + time-based (production)

---

## Overview

FlyDea uses **Pino** for structured JSON logging with automatic rotation:

- ✅ Structured JSON logs (machine-parseable)
- ✅ Log levels: debug, info, warn, error
- ✅ Correlation IDs for request tracing
- ✅ Performance metrics (latency, duration)
- ✅ Auto-rotation (size + time based)
- ✅ CloudWatch integration (production)

---

## Logger Configuration

### Local Development

```typescript
// apps/api/src/common/logger/logger.service.ts
const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: { service: 'flydea-api' },
});
```

**Environment Variables**:
```bash
LOG_LEVEL=debug        # Logging level (debug, info, warn, error)
LOG_HTTP_ALL=false     # Log all HTTP requests (true) or only errors (false)
```

### Production with Rotation

Using **pino-rolling-file**:

```bash
npm install pino-rolling-file
```

```typescript
import pinoRollingFile from 'pino-rolling-file';

const transport = pinoRollingFile({
  file: '/var/log/flydea/api.log',
  frequency: 'daily',  // Rotate daily
  size: '100m',        // OR rotate at 100MB
  mkdir: true,
});

const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? 'info',
    base: { service: 'flydea-api', environment: 'production' },
  },
  transport,
);
```

---

## Log Levels & Usage

| Level | Usage | Example |
|-------|-------|---------|
| **debug** | Low-level debugging | DB queries, function entry/exit |
| **info** | General information | Startup messages, successful operations |
| **warn** | Warning conditions | Rate limits, deprecated API usage |
| **error** | Error conditions | Exceptions, failed operations |

### Examples

```typescript
// Info: Normal operation
logger.info({ projectId: '123' }, 'Project created');

// Warn: Potential issue
logger.warn({ attemptsRemaining: 2 }, 'Password reset attempts remaining');

// Error: Exception occurred
logger.error({ error: err.message, stack: err.stack }, 'Database connection failed');

// Debug: Low-level info (only in development)
logger.debug({ sql: 'SELECT * FROM users' }, 'Executing query');
```

---

## HTTP Request Logging

Every request is logged with:

```json
{
  "http": {
    "method": "GET",
    "path": "/ctm/parcels",
    "statusCode": 200,
    "durationMs": 145,
    "correlationId": "abc-123-def",
    "tenantId": "tenant-001",
    "userId": "user-001"
  },
  "level": "info",
  "time": "2026-03-31T14:30:00.000Z"
}
```

**Only logs**:
- All errors (4xx, 5xx)
- Slow requests (> 1s by default)
- Sample of successful requests (configurable)

---

## Correlation IDs for Tracing

Every request gets a unique `correlationId` for end-to-end tracing:

```
Request → API → Database → Response
 │
 └─ Correlation ID: abc-123-def-456
    └─ All logs tagged with this ID
```

**Usage**:
```bash
# Find all logs for a request
grep "abc-123-def-456" /var/log/flydea/api.log

# Or in structured format
grep -o '"correlationId":"abc-123-def-456"' /var/log/flydea/api.log | wc -l
```

---

## Structured Logging Examples

### Success Case
```json
{
  "time": "2026-03-31T14:30:00.000Z",
  "level": 20,
  "pid": 1234,
  "http": {
    "method": "POST",
    "path": "/reurb",
    "statusCode": 201,
    "durationMs": 234,
    "correlationId": "xyz-789"
  },
  "service": "flydea-api"
}
```

### Error Case
```json
{
  "time": "2026-03-31T14:31:00.000Z",
  "level": 50,
  "pid": 1234,
  "http_exception": {
    "method": "POST",
    "url": "/ctm/parcels",
    "status": 400,
    "detail": "Invalid geometry",
    "correlationId": "xyz-790",
    "trace": "Error: Invalid geometry\n  at..."
  },
  "service": "flydea-api"
}
```

---

## Log Rotation Configuration

### Strategy 1: File Size Based (Simple)

```bash
# Rotate when file reaches 100MB
logs/
├── api.log          (current, <100MB)
├── api.log.1        (rotated, 100MB)
├── api.log.2        (older, 100MB)
└── api.log.3        (oldest, 100MB)
```

### Strategy 2: Time Based (Recommended)

```bash
# Rotate daily at midnight
logs/
├── api-2026-03-31.log
├── api-2026-03-30.log
├── api-2026-03-29.log
└── ...
```

### Strategy 3: Hybrid (Best)

Rotate when:
- File size > 100MB, OR
- 24 hours have passed

---

## Local Development Setup

### Docker Logs

Logs are output to Docker:

```bash
docker logs flydea-api          # Real-time logs
docker logs -f flydea-api       # Follow logs
docker logs --tail 100 flydea-api  # Last 100 lines
docker logs --since 5m flydea-api  # Last 5 minutes
```

### File Output (Optional)

For local file logging:

```bash
# Set environment
export LOG_LEVEL=debug
export LOG_TO_FILE=true

# Start API
npm run dev

# View logs
tail -f logs/api.log
```

---

## Production Deployment

### Docker with Volume Mount

```yaml
services:
  api:
    image: flydea:latest
    volumes:
      - /var/log/flydea:/app/logs
    environment:
      LOG_LEVEL: info
      LOG_TO_FILE: 'true'
```

### CloudWatch Integration (AWS)

```yaml
services:
  api:
    image: flydea:latest
    logging:
      driver: awslogs
      options:
        awslogs-group: /ecs/flydea-api
        awslogs-region: us-east-1
        awslogs-stream-prefix: ecs
```

### Logrotate (Linux)

```bash
# /etc/logrotate.d/flydea
/var/log/flydea/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 0640 app app
    sharedscripts
    postrotate
        systemctl reload flydea-api
    endscript
}
```

---

## Monitoring & Alerting

### Track Log Size

```bash
#!/bin/bash
# Check if log directory is too large
SIZE=$(du -sh /var/log/flydea | cut -f1)
SIZE_MB=$(du -sm /var/log/flydea | cut -f1)

if [ $SIZE_MB -gt 10000 ]; then
  echo "ALERT: Logs directory is ${SIZE}, exceeds 10GB limit"
  # Trigger rotation
  logrotate -f /etc/logrotate.d/flydea
fi
```

### Monitor Error Rate

```bash
#!/bin/bash
# Count errors in last hour
ERROR_COUNT=$(grep '"level":50' /var/log/flydea/api.log | wc -l)

if [ $ERROR_COUNT -gt 100 ]; then
  echo "ALERT: ${ERROR_COUNT} errors in last hour"
  # Send notification
  mail -s "FlyDea API High Error Rate" ops@flydea.dev
fi
```

### Find Slow Requests

```bash
# Requests > 1 second
grep '"durationMs":' /var/log/flydea/api.log | \
  awk -F'"' '{for(i=1;i<=NF;i++) if($i=="durationMs") print $(i+2)}' | \
  awk '$1 > 1000' | wc -l
```

---

## Troubleshooting

### Logs Too Large

```bash
# Force rotation
logrotate -f /etc/logrotate.d/flydea

# Or clean up manually
find /var/log/flydea -name "*.log.*" -mtime +30 -delete
```

### Missing Logs

**Check permissions**:
```bash
ls -la /var/log/flydea/
# Should be readable by the app user
```

**Check disk space**:
```bash
df -h /var/log
# If full, rotate logs immediately
```

### Logs Not Rotating

**Check logrotate config**:
```bash
logrotate -d /etc/logrotate.d/flydea  # Dry run
logrotate -f /etc/logrotate.d/flydea  # Force
```

---

## Compliance

### Data Retention

- **Production**: Keep logs for 90 days (LGPD compliance)
- **Development**: Keep logs for 30 days
- **Archive**: Move old logs to S3/Glacier after retention

### PII Masking

Sensitive data (emails, SSN, etc.) should be masked:

```typescript
// Bad: Logs PII
logger.info({ email: user.email }, 'User created');

// Good: Mask PII
logger.info({
  email: maskEmail(user.email),  // → 'u***@example.com'
  userId: user.id,
}, 'User created');
```

---

## Checklist

- [ ] Log level configured (INFO for prod, DEBUG for dev)
- [ ] HTTP request logging enabled
- [ ] Correlation IDs implemented
- [ ] Log rotation configured
- [ ] Log directory permissions correct
- [ ] Disk space monitoring in place
- [ ] Error alerting configured
- [ ] Log retention policy documented
- [ ] PII masking implemented
- [ ] CloudWatch/ELK integration (production)

