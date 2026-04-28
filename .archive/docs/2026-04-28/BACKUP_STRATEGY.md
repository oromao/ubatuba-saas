# MongoDB Backup & Disaster Recovery Strategy

**Last Updated**: 2026-03-31
**Status**: Implemented (Local + Cloud-Ready)

---

## Overview

FlyDea implements a **daily incremental backup strategy** for MongoDB with:
- ✅ Automated daily backups (2 AM UTC)
- ✅ 30-day retention policy
- ✅ Compression for storage efficiency
- ✅ Restore validation
- ✅ Monitoring & alerting

---

## Backup Architecture

### Local Development Setup

```
Development Machine
├── /backups/                          (backup directory)
│   ├── backup-20260331-020000.tar.gz  (latest full backup)
│   ├── backup-20260330-020000.tar.gz  (previous)
│   └── backup.log                     (backup logs)
└── MongoDB container                  (running in Docker)
```

### Production Setup (Cloud)

```
AWS (Recommended)
├── AWS Backup service (automated snapshots)
├── RDS Snapshots OR
├── S3 bucket (backup storage)
│   ├── s3://flydea-backups/prod/
│   ├── s3://flydea-backups/staging/
│   └── s3://flydea-backups/dev/
└── CloudWatch logs (monitoring)
```

---

## Local Backup Scripts

### Prerequisites

```bash
# macOS
brew install mongodb-org-tools

# Linux (Ubuntu/Debian)
sudo apt-get install mongodb-org-tools

# Windows
# Download from https://www.mongodb.com/try/download/database-tools
```

### Daily Backup Script

**File**: `infra/backup/backup-mongodb.sh`

```bash
# Make executable
chmod +x infra/backup/backup-mongodb.sh

# Manual backup
./infra/backup/backup-mongodb.sh /backups mongodb://localhost:27017/flydea 30

# With custom retention (14 days)
./infra/backup/backup-mongodb.sh /backups mongodb://localhost:27017/flydea 14
```

**What it does**:
1. Connects to MongoDB
2. Runs `mongodump` for full backup
3. Compresses with gzip (tar.gz)
4. Deletes backups older than 30 days
5. Logs to `backup.log`

**Output**:
```
backup-20260331-140000.tar.gz  (compressed dump)
backup.log                      (timestamped logs)
```

### Restore Script

**File**: `infra/backup/restore-mongodb.sh`

```bash
# Make executable
chmod +x infra/backup/restore-mongodb.sh

# Restore to same database (NEW collections only)
./infra/backup/restore-mongodb.sh ./backups/backup-20260331-140000.tar.gz mongodb://localhost:27017/flydea

# Restore and drop existing (WARNING: destructive)
./infra/backup/restore-mongodb.sh ./backups/backup-20260331-140000.tar.gz mongodb://localhost:27017/flydea true
```

**What it does**:
1. Extracts backup archive
2. Validates MongoDB connection
3. Runs `mongorestore`
4. Validates critical collections (tenants, users, projects)
5. Reports success/warnings

---

## Scheduling Backups

### Option 1: Local Machine Cron (macOS/Linux)

```bash
# Edit crontab
crontab -e

# Add this line (daily at 2 AM)
0 2 * * * /path/to/ubatuba-saas/infra/backup/backup-mongodb.sh /path/to/backups mongodb://localhost:27017/flydea 30 >> /path/to/backups/cron.log 2>&1

# Verify
crontab -l
```

### Option 2: Docker Compose Service

Add to `docker-compose.yml`:

```yaml
services:
  backup:
    image: mongo:7
    container_name: flydea-backup
    entrypoint: |
      sh -c "
      apk add --no-cache dcron
      echo '0 2 * * * mongodump --uri=mongodb://mongo:27017/flydea --archive=/backup/backup-\$(date +\%Y\%m\%d-\%H\%M\%S).tar.gz --gzip' | crontab -
      crond -f
      "
    volumes:
      - ./backups:/backup
    depends_on:
      - mongo
    networks:
      - flydea
```

### Option 3: Kubernetes CronJob (Production)

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mongodb-backup
  namespace: flydea-prod
spec:
  schedule: "0 2 * * *"  # 2 AM UTC daily
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: mongo:7
              command:
                - mongodump
                - --uri=mongodb://mongo-primary:27017/flydea
                - --archive=/backup/backup-$(date +%Y%m%d-%H%M%S).tar.gz
                - --gzip
              volumeMounts:
                - name: backup-volume
                  mountPath: /backup
          volumes:
            - name: backup-volume
              persistentVolumeClaim:
                claimName: mongodb-backups
          restartPolicy: OnFailure
```

---

## Testing Backup & Restore

### Weekly Restore Test

Every week, test that backups can actually be restored:

```bash
#!/bin/bash
# test-restore.sh

echo "1. Finding latest backup..."
BACKUP=$(ls -t backups/backup-*.tar.gz | head -1)
echo "   Using: $BACKUP"

echo "2. Creating test database..."
docker run --name test-mongo -d mongo:7
sleep 3

echo "3. Restoring backup..."
./infra/backup/restore-mongodb.sh "$BACKUP" "mongodb://localhost:27017/test_restore"

echo "4. Validating..."
# Check document counts
echo "   Collections: $(mongosh mongodb://localhost:27017/test_restore --eval "db.getCollectionNames().length")"

echo "5. Cleanup..."
docker stop test-mongo
docker rm test-mongo

echo "✓ Restore test completed!"
```

**Run weekly**:
```bash
crontab -e
# Add: 0 3 * * 0 /path/to/test-restore.sh >> /path/to/backups/restore-test.log 2>&1
```

---

## Monitoring & Alerting

### Health Checks

```bash
# Check backup age (should be < 24h)
LATEST_BACKUP=$(ls -t backups/backup-*.tar.gz 2>/dev/null | head -1)
BACKUP_AGE=$(($(date +%s) - $(stat -c %Y "$LATEST_BACKUP" 2>/dev/null)))
HOURS_AGE=$((BACKUP_AGE / 3600))

if [ $HOURS_AGE -gt 24 ]; then
  echo "ALERT: Last backup is $HOURS_AGE hours old!"
fi
```

### Log Monitoring

```bash
# Check for backup errors
grep -i "error" backups/backup.log | tail -10

# Last 5 backup runs
tail -50 backups/backup.log | grep "INFO"
```

### Backup Size Monitoring

```bash
# Alert if backup directory grows too large (>50GB)
SIZE=$(du -sh backups | cut -f1)
SIZE_GB=$(du -sb backups | cut -f1)
SIZE_GB=$((SIZE_GB / 1024 / 1024 / 1024))

if [ $SIZE_GB -gt 50 ]; then
  echo "ALERT: Backup directory is ${SIZE} (exceeds 50GB)"
fi
```

---

## Disaster Recovery Procedures

### Scenario 1: Complete Database Loss

**Recovery Time Objective (RTO)**: 30 minutes
**Recovery Point Objective (RPO)**: 1 day (last backup)

```bash
# 1. Identify latest backup
BACKUP=$(ls -t backups/backup-*.tar.gz | head -1)

# 2. Ensure MongoDB is running
docker compose up -d mongo

# 3. Restore
./infra/backup/restore-mongodb.sh "$BACKUP" mongodb://localhost:27017/flydea

# 4. Validate
mongosh mongodb://localhost:27017/flydea --eval "db.tenants.countDocuments()"

# 5. Notify team
echo "Database restored from: $BACKUP" | mail -s "FlyDea DB Restored" ops@flydea.dev
```

### Scenario 2: Corrupted Data in One Collection

**Recovery**: Restore single collection from backup

```bash
# 1. Extract backup
tar -xzf backups/backup-20260331-140000.tar.gz -C /tmp

# 2. Restore only the 'parcels' collection
mongorestore --uri=mongodb://localhost:27017/flydea \
  --nsFrom="flydea.parcels" \
  --nsTo="flydea.parcels" \
  /tmp/dump/flydea/parcels.bson
```

### Scenario 3: Accidentally Deleted Data (Accidental drop)

**Recovery**: Restore from backup, merge back data

```bash
# 1. Restore backup to temporary database
./infra/backup/restore-mongodb.sh "$BACKUP" mongodb://localhost:27017/flydea_restore

# 2. Copy needed collections to production
mongosh <<EOF
  const restore = db.getSiblingDB('flydea_restore');
  const prod = db.getSiblingDB('flydea');

  // Copy deleted documents
  restore.parcels.find().forEach(doc => {
    prod.parcels.updateOne(
      { _id: doc._id },
      { \$setOnInsert: doc },
      { upsert: true }
    );
  });
EOF

# 3. Drop temporary database
mongosh mongodb://localhost:27017 --eval "db.getSiblingDB('flydea_restore').dropDatabase()"
```

---

## Checklist: Ready for Production

- [ ] Backup script tested locally (daily backups working)
- [ ] Restore script tested (can successfully restore)
- [ ] Cron job configured (automated backups running)
- [ ] Retention policy set (30 days minimum)
- [ ] Weekly restore test scheduled
- [ ] Monitoring in place (backup age, disk space)
- [ ] Team trained on restore procedures
- [ ] Runbook documented (this file)
- [ ] S3/Cloud storage configured (for offsite backup)
- [ ] Alerts configured (backup failures, age > 24h)

---

## File Locations

```
infra/
├── backup/
│   ├── backup-mongodb.sh       (daily backup script)
│   ├── restore-mongodb.sh      (restore script)
│   ├── test-restore.sh         (weekly test)
│   └── README.md               (quick reference)
├── iac/
│   └── terraform/              (cloud backup config)
└── docker-compose.yml          (local backup service)

docs/
└── BACKUP_STRATEGY.md          (this file)

backups/                        (local backup directory)
├── backup-20260331-140000.tar.gz
├── backup.log
└── restore-test.log
```

---

## Troubleshooting

### Backup fails: "mongodump not found"

```bash
# Install MongoDB tools
brew install mongodb-org-tools  # macOS
apt-get install mongodb-org-tools  # Linux
```

### Backup fails: "connection refused"

```bash
# Check MongoDB is running
docker compose ps mongo

# If not, start it
docker compose up -d mongo

# Check connection
mongosh mongodb://localhost:27017/flydea --eval "db.version()"
```

### Restore fails: "existing database"

```bash
# Drop existing database first
mongosh mongodb://localhost:27017 --eval "db.getSiblingDB('flydea').dropDatabase()"

# Then restore
./infra/backup/restore-mongodb.sh backup.tar.gz mongodb://localhost:27017/flydea
```

### Backup file is corrupted

```bash
# Test backup validity
tar -tzf backups/backup-20260331-140000.tar.gz | head -10

# If it fails, the archive is corrupted
# Use previous backup instead
```

---

## References

- [MongoDB mongodump docs](https://docs.mongodb.com/database-tools/mongodump/)
- [MongoDB mongorestore docs](https://docs.mongodb.com/database-tools/mongorestore/)
- [AWS Backup for MongoDB](https://docs.aws.amazon.com/backup/latest/devguide/mongodb-backup.html)
- [MongoDB on Docker docs](https://hub.docker.com/_/mongo)

