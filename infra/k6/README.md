# K6 Load Testing

Performance baseline testing for FlyDea API.

## Install K6

```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Windows
chocolatey install k6
```

## Run Baseline Test

```bash
# Local (requires API running on :4000)
k6 run infra/k6/load-test-baseline.js

# With custom config
BASE_URL=http://staging.api.flydea.dev k6 run infra/k6/load-test-baseline.js

# With 100 concurrent users for 10 minutes
k6 run -u 100 -d 10m infra/k6/load-test-baseline.js
```

## Expected Baseline (50 users, 5 min)

- **p95 latency**: < 500ms
- **Error rate**: < 1%
- **Failed requests**: < 5%
- **Throughput**: ~500 req/s

## Output

Results printed to console + JSON:
```
k6 run -o json=results.json infra/k6/load-test-baseline.js
```

View report:
```bash
k6 run --out=influxdb=http://localhost:8086/k6 infra/k6/load-test-baseline.js
```
