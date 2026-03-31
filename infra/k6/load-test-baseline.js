import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

/**
 * K6 Load Testing Baseline for FlyDea API
 *
 * Purpose: Establish performance baseline
 * - Target: 50 concurrent users
 * - Duration: 5 minutes
 * - Ramp-up: 1 minute
 * - Ramp-down: 1 minute
 *
 * Run locally:
 *   npm install -g k6
 *   k6 run infra/k6/load-test-baseline.js
 *
 * Run with custom settings:
 *   k6 run -u 100 -d 10m infra/k6/load-test-baseline.js
 *
 * Environment variables:
 *   BASE_URL=http://localhost:4000
 *   ACCESS_TOKEN=your-jwt-token
 *   TENANT_ID=tenant-001
 *   PROJECT_ID=project-001
 */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const ACCESS_TOKEN = __ENV.ACCESS_TOKEN || 'test-token';
const TENANT_ID = __ENV.TENANT_ID || 'tenant-001';
const PROJECT_ID = __ENV.PROJECT_ID || 'project-001';

// Custom metrics
const apiLatency = new Trend('api_latency');
const errorRate = new Rate('api_errors');

export const options = {
  stages: [
    // Ramp up 1 min (0 → 50 users)
    { duration: '1m', target: 50 },
    // Sustain for 3 min (50 users constant)
    { duration: '3m', target: 50 },
    // Ramp down 1 min (50 → 0 users)
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    // API latency: 95% of requests < 500ms
    'api_latency': ['p(95) < 500'],
    // Error rate: < 1%
    'api_errors': ['rate < 0.01'],
    // HTTP errors
    'http_req_failed': ['rate < 0.05'],
    'http_req_duration': ['p(95) < 1000'],
  },
};

const headers = {
  'Authorization': `Bearer ${ACCESS_TOKEN}`,
  'x-tenant-id': TENANT_ID,
  'Content-Type': 'application/json',
};

export default function () {
  // Test 1: Health check (lightweight)
  group('Health & Status', () => {
    const res = http.get(`${BASE_URL}/health`);
    check(res, {
      'health check 200': (r) => r.status === 200,
      'health latency < 100ms': (r) => r.timings.duration < 100,
    });
    errorRate.add(res.status !== 200);
    apiLatency.add(res.timings.duration);
  });

  sleep(0.5);

  // Test 2: List projects (authenticated, cached)
  group('Projects List', () => {
    const res = http.get(`${BASE_URL}/projects`, { headers });
    check(res, {
      'list projects 200': (r) => r.status === 200,
      'list projects latency < 300ms': (r) => r.timings.duration < 300,
      'response is valid JSON': (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch {
          return false;
        }
      },
    });
    errorRate.add(res.status !== 200);
    apiLatency.add(res.timings.duration);
  });

  sleep(0.5);

  // Test 3: Get specific project
  group('Project Detail', () => {
    const res = http.get(`${BASE_URL}/projects/${PROJECT_ID}`, { headers });
    check(res, {
      'get project 200 or 404': (r) => r.status === 200 || r.status === 404,
      'get project latency < 300ms': (r) => r.timings.duration < 300,
    });
    errorRate.add(res.status !== 200 && res.status !== 404);
    apiLatency.add(res.timings.duration);
  });

  sleep(0.5);

  // Test 4: List CTM parcels (pagination test)
  group('CTM Parcels List', () => {
    const res = http.get(`${BASE_URL}/ctm/parcels?limit=10`, { headers });
    check(res, {
      'list parcels 200 or 400': (r) => r.status === 200 || r.status === 400,
      'list parcels latency < 500ms': (r) => r.timings.duration < 500,
    });
    errorRate.add(res.status !== 200 && res.status !== 400);
    apiLatency.add(res.timings.duration);
  });

  sleep(0.5);

  // Test 5: Get parcels GeoJSON (spatial query)
  group('GeoJSON Spatial', () => {
    const bbox = '-46.31,-23.56,-46.30,-23.55';
    const res = http.get(
      `${BASE_URL}/ctm/parcels/geojson?bbox=${encodeURIComponent(bbox)}`,
      { headers },
    );
    check(res, {
      'geojson 200 or 400': (r) => r.status === 200 || r.status === 400,
      'geojson latency < 800ms': (r) => r.timings.duration < 800,
    });
    errorRate.add(res.status !== 200 && res.status !== 400);
    apiLatency.add(res.timings.duration);
  });

  sleep(0.5);

  // Test 6: Get map layers
  group('Map Layers', () => {
    const res = http.get(`${BASE_URL}/layers`, { headers });
    check(res, {
      'list layers 200': (r) => r.status === 200,
      'list layers latency < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(res.status !== 200);
    apiLatency.add(res.timings.duration);
  });

  sleep(0.5);

  // Test 7: List PGV zones
  group('PGV Zones', () => {
    const res = http.get(`${BASE_URL}/pgv/zones`, { headers });
    check(res, {
      'list zones 200 or 400': (r) => r.status === 200 || r.status === 400,
      'list zones latency < 300ms': (r) => r.timings.duration < 300,
    });
    errorRate.add(res.status !== 200 && res.status !== 400);
    apiLatency.add(res.timings.duration);
  });

  sleep(0.5);

  // Test 8: Get dashboard data
  group('Dashboard', () => {
    const res = http.get(`${BASE_URL}/dashboard`, { headers });
    check(res, {
      'dashboard 200 or 400': (r) => r.status === 200 || r.status === 400,
      'dashboard latency < 1000ms': (r) => r.timings.duration < 1000,
    });
    errorRate.add(res.status !== 200 && res.status !== 400);
    apiLatency.add(res.timings.duration);
  });

  sleep(0.5);

  // Test 9: Compliance status
  group('Compliance', () => {
    const res = http.get(`${BASE_URL}/compliance`, { headers });
    check(res, {
      'compliance 200 or 400': (r) => r.status === 200 || r.status === 400,
      'compliance latency < 300ms': (r) => r.timings.duration < 300,
    });
    errorRate.add(res.status !== 200 && res.status !== 400);
    apiLatency.add(res.timings.duration);
  });

  sleep(0.5);

  // Test 10: REURB projects
  group('REURB', () => {
    const res = http.get(`${BASE_URL}/reurb`, { headers });
    check(res, {
      'list reurb 200 or 400': (r) => r.status === 200 || r.status === 400,
      'list reurb latency < 500ms': (r) => r.timings.duration < 500,
    });
    errorRate.add(res.status !== 200 && res.status !== 400);
    apiLatency.add(res.timings.duration);
  });

  sleep(1);
}

/**
 * Setup & Teardown
 */
export function setup() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('FlyDea API Load Test - Baseline');
  console.log(`${'='.repeat(60)}`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Tenant: ${TENANT_ID}`);
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`${'='.repeat(60)}\n`);

  // Warm-up
  http.get(`${BASE_URL}/health`);
}

export function teardown(data) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('Test Complete');
  console.log(`${'='.repeat(60)}\n`);
}

/**
 * Handling summary:
 *
 * k6 run will output:
 * - api_latency: 95th percentile latency (should be < 500ms)
 * - api_errors: error rate (should be < 1%)
 * - http_req_duration: request duration distribution
 * - http_req_failed: failed requests count
 *
 * Baseline target: 50 concurrent users, all endpoints < 500ms latency
 */
