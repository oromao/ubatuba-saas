# Migration Versioning Guide

**Status**: Implemented with versioned tracking
**Pattern**: Flyway-style V001__name.ts format

---

## Quick Start

Run migrations automatically on startup (Docker):

```bash
docker compose up -d migrate
```

Or manually:

```bash
npm run migrate
```

---

## Migration System

### Architecture

```
apps/api/src/migrations/
├── runner.ts          ← Migration executor
├── 001-create-indexes.ts
├── 002-seed-demo.ts
└── ...
```

### How It Works

1. **Version Tracking**: `_migrations` collection stores applied migrations
2. **Checksum**: Detects if migration file was modified
3. **Idempotent**: Safe to re-run (uses upsert)
4. **Rollback**: Each migration has up/down (when implemented)

---

## Creating a New Migration

### File Naming

```
V{VERSION}__{DESCRIPTION}.ts

Examples:
V001__initial_setup.ts
V002__add_parcel_audit.ts
V003__index_optimization.ts
```

### Template

```typescript
import { Db } from 'mongodb';

/**
 * V003__add_parcel_audit.ts
 *
 * Purpose: Create audit log collection for parcels
 * Impact: Creates new collection, adds indexes
 * Rollback: Drops collection (data loss!)
 */

export async function up(db: Db): Promise<void> {
  const collection = db.collection('parcel_audit_logs');

  // Create collection with validation
  await db.createCollection('parcel_audit_logs', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['parcelId', 'action', 'userId', 'timestamp'],
        properties: {
          parcelId: { bsonType: 'objectId' },
          action: { enum: ['CREATE', 'UPDATE', 'DELETE'] },
          userId: { bsonType: 'string' },
          timestamp: { bsonType: 'date' },
          diff: { bsonType: 'object' },
        },
      },
    },
  });

  // Create indexes for fast lookup
  await collection.createIndex({ parcelId: 1, timestamp: -1 });
  await collection.createIndex({ userId: 1, timestamp: -1 });

  console.log('✓ Created parcel_audit_logs collection');
}

export async function down(db: Db): Promise<void> {
  // Rollback: drop collection (destructive!)
  await db.collection('parcel_audit_logs').drop();
  console.log('✓ Dropped parcel_audit_logs collection');
}
```

### Best Practices

1. **Idempotent**: Use `createIndex` safely (ignores if exists)
2. **Atomic**: One logical unit per migration
3. **Small**: Each migration should be small (~100 lines max)
4. **Documented**: Add comments explaining why
5. **Reversible**: Implement `down()` for critical migrations

---

## Current Migrations

| Version | Name | Status | Purpose |
|---------|------|--------|---------|
| 001 | create-indexes | ✅ Applied | Core indexes (tenants, users, locations) |
| 002 | seed-demo | ✅ Applied | Demo tenant, users, test data |
| 003 | add-reurb-audit | ✅ Applied | REURB audit logging |
| 004 | add-mobile-sync | ✅ Applied | Mobile field records |

---

## Running Migrations

### Automatic (Docker)

```bash
docker compose up -d migrate
```

The `migrate` service runs on startup, applies pending migrations, then exits.

### Manual

```bash
# Apply all pending migrations
npm run migrate

# Rollback last migration (if implemented)
npm run migrate rollback
```

### Check Status

```bash
mongosh mongodb://localhost:27017/flydea --eval "db._migrations.find().pretty()"
```

Output:

```json
{
  "_id": ObjectId(...),
  "version": 1,
  "name": "create-indexes",
  "checksum": "abc123def456",
  "executedAt": ISODate("2026-03-31T14:00:00Z"),
  "executionTime": 245,
  "success": true
}
```

---

## Troubleshooting

### Migration Failed: Can't Rollback

If a migration fails partway through:

1. **Check logs**:
   ```bash
   docker logs flydea-migrate
   ```

2. **Manual fix**: Connect to MongoDB and undo the partial migration
   ```bash
   mongosh mongodb://localhost:27017/flydea
   # Remove partial changes
   db._migrations.deleteOne({ version: 5 })
   ```

3. **Retry**: Fix the migration file and re-run
   ```bash
   npm run migrate
   ```

### Checksum Mismatch: "Migration file modified"

**Never modify applied migrations!** If you did:

```bash
# Option 1: Revert file to original
git checkout apps/api/src/migrations/V001__xxx.ts

# Option 2: Delete and re-apply (only if reversible)
mongosh mongodb://localhost:27017/flydea
db._migrations.deleteOne({ version: 1 })
npm run migrate
```

### Stuck in Applied State

If database shows migration applied but it actually failed:

```bash
mongosh mongodb://localhost:27017/flydea --eval "
db._migrations.deleteOne({ version: 5 });
// Re-run migration
"
```

---

## Migration Checklist

Before creating a migration:

- [ ] **Naming**: Follow V{N}__description.ts format
- [ ] **Idempotent**: Safe to re-run
- [ ] **Documented**: Comments explain why
- [ ] **Tested locally**: Run with full dataset
- [ ] **Reversible**: Implement down() function
- [ ] **No breaking changes**: If possible
- [ ] **Estimate duration**: Add comment with expected runtime

Before committing:

- [ ] Migration tested against production data
- [ ] No hardcoded values (use env vars)
- [ ] Rollback tested (if critical)
- [ ] Performance impact assessed
- [ ] Updated this guide with summary

---

## Examples

### Add a Field to Existing Collection

```typescript
export async function up(db: Db): Promise<void> {
  const collection = db.collection('parcels');

  // Add field to all existing documents
  await collection.updateMany(
    {},
    { $set: { pendingIssues: [] } },
  );
}
```

### Create an Index

```typescript
export async function up(db: Db): Promise<void> {
  await db.collection('parcels').createIndex(
    { tenantId: 1, workflowStatus: 1, createdAt: -1 },
    { name: 'idx_pending_parcels' },
  );
}
```

### Rename a Field

```typescript
export async function up(db: Db): Promise<void> {
  await db.collection('users').updateMany(
    {},
    { $rename: { 'phone': 'phoneNumber' } },
  );
}
```

### Data Transformation

```typescript
export async function up(db: Db): Promise<void> {
  const collection = db.collection('pgv_zones');

  // Migrate old format to new format
  const docs = await collection.find({ baseValue: { $exists: true } }).toArray();

  for (const doc of docs) {
    await collection.updateOne(
      { _id: doc._id },
      {
        $set: { baseValuePerSqm: doc.baseValue },
        $unset: { baseValue: '' },
      },
    );
  }
}
```

---

## References

- [Flyway Documentation](https://flywaydb.org/documentation/concepts/migrations)
- [MongoDB Schema Validation](https://docs.mongodb.com/manual/core/schema-validation/)
- [MongoDB Indexes](https://docs.mongodb.com/manual/indexes/)
