# 11b — Licitacao Quick Reference

> **Purpose**: One-page summary for Paulo to make quick decisions on bidding
> **Date**: 2026-04-28

---

## DECISION MATRIX

### Can we bid on this RFP?

| RFP Size | Municipality Size | Current State | Decision |
|----------|-------------------|---------------|----------|
| Small (<10k parcels) | <50k population | Partial CRS, partial workflows | ⚠️ **CONDITIONAL** - Only if CRS not required |
| Medium (10k-50k parcels) | 50k-500k population | Cannot handle scale | ❌ **NO** - Cannot import real data |
| Large (50k+ parcels) | 500k+ population | No CRS, no scaling proof | ❌ **NO** - Would fail immediately |
| capital | 1M+ population | Everything missing | ❌ **NO** - Not competitive |

**BID DECISION RULE**: Do NOT bid on any municipal contract requiring **real data import** until T1-CRS-TRANSFORM is complete.

---

## COMPETITIVE SNAPSHOT

### FlyDea vs GeoPixel

| Category | FlyDea | GeoPixel | Gap |
|----------|--------|----------|-----|
| **Architecture** | Modern (Nest/Next) | Modern (similar) | ✅ Equal |
| **GIS Foundation** | MapLibre GL JS | Mapbox/Proprietary | ✅ Equal (open-source advantage) |
| **CRS Support** | WGS84 only | Full CRS transform | ❌ **CRITICAL** - Cannot import UTM |
| **Parcel Model** | Comprehensive | Comprehensive | ✅ Equal |
| **Import Capability** | Batch GeoJSON | Batch + streaming | ⚠️ Partial |
| **Scale Proof** | 1k tested | 100k+ proven | ❌ **CRITICAL** - 50k+ unproven |
| **Workflows** | Basic CRUD | Full state machine | ❌ **CRITICAL** - Stub only |
| **Offline Mobile** | None | Full offline | ❌ **CRITICAL** - Required for field |
| **Documents** | Basic PDF | Legal templates | ❌ **CRITICAL** - Not legally valid |
| **Tax Integration** | Partial | Full IPTU ledger | ⚠️ Weak |
| **Citizen Portal** | Basic | Full self-service | ⚠️ Weak |
| **Dashboards** | Basic KPIs | Executive analytics | ⚠️ Weak |
| **Compliance** | Minimal | Full audit | ⚠️ Weak |
| **References** | 0 live municipalities | 50+ live | ❌ **CRITICAL** - No proof |

**COMPETITIVE SCORE: FlyDea 35% | GeoPixel 100%**

---

## CRITICAL PATH TO WIN

### Phase 1: Stop The Bleeding (4-6 weeks)
Fix critical blockers that cause immediate disqualification:

1. **T1-CRS-TRANSFORM** (Week 1-2)
   - Add proj4js for coordinate transformation
   - Support UTM 23S (EPSG:31983) → WGS84 (EPSG:4326)
   - Auto-detect CRS from GeoSampa data
   - Test with real São Paulo datasets

2. **T1-GIS-SCALE-PROOF** (Week 2-4)
   - Import 50k+ GeoSampa parcels
   - Prove rendering <5s
   - Prove query <1s
   - Prove no browser crash
   - Document performance benchmarks

3. **T1-WORKFLOW-ENGINE** (Week 3-6)
   - Build state machine for approvals
   - Implement role-based transitions
   - Add full audit trail
   - Test end-to-end workflow

4. **T1-DOC-GENERATION** (Week 4-6)
   - Create official certificate templates
   - Add digital signature support
   - Add QR code verification
   - Municipal legal review

5. **T1-MOBILE-OFFLINE** (Week 5-8)
   - Implement offline queue
   - Add local form storage
   - Sync on reconnect
   - Conflict resolution

### Phase 2: Build Credibility (6-10 weeks)
Complete competitive features:

6. **T2-TAX-INTEG** - Full IPTU/PGV integration
7. **T2-CITIZEN-PORTAL** - Complete service catalog
8. **T2-NOTIFICATION-BULK** - Bulk letter generation
9. **T2-DASHBOARD-EXEC** - Executive analytics
10. **T2-REPORTS-BUILDER** - Custom reports

### Phase 3: Pilot & Scale (10-16 weeks)
- Deploy with small municipality (pilot)
- Validate all workflows in production
- Gather references and testimonials
- Refine based on feedback

### Phase 4: Win (16-24 weeks)
- Bid on medium-sized municipalities
- Use pilot references as proof
- Scale to larger contracts
- Add differentiation features

---

## PRICE COMPARISON

### FlyDea Pricing (Assumptions)
- Development to date: ~$500k
- Current state: 60% complete
- To reach competitive: +$800k (12-16 weeks, 4-6 engineers)
- **Total investment: $1.3M**

### GeoPixel Pricing (Market)
- Subscription: $50-200k/year per municipality
- Implementation: $200-500k (one-time)
- **5-year TCO: $500k-2.5M per municipality**

### Market Opportunity
- 5,570 municipalities in Brazil
- Top 500 municipalities: avg 100k population = 50k parcels
- **Target market: 500 municipalities × $200k = $100M/year**
- **Capture 1%: $1M/year recurring**
- **Capture 5%: $5M/year recurring**

**ROI**: $800k investment → $1-5M annual recurring revenue

---

## RISK ASSESSMENT

### Technical Risks (HIGH)
1. **CRS Transformation Complexity** - Proj4js may have edge cases
2. **Performance at Scale** - MongoDB may struggle with 50k+ polygons
3. **Workflow Engine** - State machine complexity
4. **Offline Sync** - Conflict resolution is hard
5. **Legal Compliance** - Document formatting must be perfect

### Market Risks (MEDIUM)
1. **GeoPixel Incumbency** - 50+ live customers, strong references
2. **Switching Costs** - Municipalities reluctant to change
3. **Procurement Complexity** - Licitation cycles are 6-12 months
4. **Customization Requirements** - Every municipality has unique needs

### Financial Risks (MEDIUM)
1. **Cash Flow** - 6-12 month sales cycle
2. **Support Costs** - Municipal IT departments need hand-holding
3. **Hosting Costs** - Multi-tenant infrastructure at scale
4. **Liability** - Municipal contracts have high penalties

### Mitigation
- **Technical**: Hire experienced GIS engineer, performance specialist
- **Market**: Focus on dissatified GeoPixel customers, offer migration tools
- **Financial**: Raise $500-1000k bridge round, target 3 pilot customers

---

## IMMEDIATE ACTION ITEMS (Next 7 Days)

1. **Day 1-2**: Finalize CRS transformation design
   - Research proj4js vs custom transformation
   - Define CRS support matrix (EPSG:4326, 31983, SIRGAS2000)
   - Estimate effort, identify dependencies

2. **Day 3-4**: Secure GeoSampa test data
   - Obtain official SP dataset in UTM format
   - Verify data structure and quality
   - Identify conversion requirements

3. **Day 5-6**: Build CRS transformation POC
   - Implement basic coordinate conversion
   - Test with sample SP data
   - Validate coordinates after transformation

4. **Day 7**: Decision point
   - POC successful? → Proceed to full implementation
   - POC failed? → Research alternatives (GDAL, PostGIS)

---

## WINNING STRATEGY

### Positioning
**"FlyDea: The modern, open-source alternative to legacy municipal GIS platforms"**

### Value Proposition
1. **Open Source GIS** - No vendor lock-in, MapLibre GL JS
2. **Modern Architecture** - React, TypeScript, microservices
3. **Lower TCO** - Subscription model vs perpetual licenses
4. **Flexibility** - Customizable workflows and integrations
5. **Transparency** - Full audit trail, open data export

### Competitive Advantages
- ✅ Modern tech stack (attracts technical evaluators)
- ✅ Open-source GIS (no license costs)
- ✅ Parcel-centric model (best practice)
- ✅ Multi-tenant native (GeoPixel often single-tenant)

### Competitive Disadvantages
- ❌ No production references
- ❌ Immature workflows
- ❌ Limited ecosystem/integrations

### Target Customers
1. **Small municipalities** (10k-100k parcels) - Quick wins
2. **Dissatisfied GeoPixel customers** - Switching opportunity
3. **New digital transformation projects** - Greenfield advantage
4. **State-level projects** - Multiple municipalities together

---

## SUCCESS CRITERIA

### Minimum Viable Product (MVP)
- [ ] CRS transformation working
- [ ] 50k parcel performance validated
- [ ] Basic workflows functional
- [ ] 1 live municipality reference

### Competitive Product
- [ ] Overall maturity: 4.0/5.0
- [ ] All core modules at 4+/5.0
- [ ] 3+ live municipality references
- [ ] $2M ARR pipeline

### Market Leader
- [ ] Overall maturity: 4.5+/5.0
- [ ] 10+ live municipality references
- [ ] $10M ARR pipeline
- [ ] ISO 27001 certified

---

## CONTACTS & RESOURCES

### Internal
- **Paulo** - Engineering/DevOps, Catanduva-SP (Final decision maker)
- **AI Agents** - execution team
- **Current Team** - 

### External Required
- **GIS Consultant** - CRS transformation expertise
- **Municipal Expert** - Brazilian municipal processes
- **Legal Counsel** - LGPD compliance, contract review
- **Sales Lead** - Municipal sales experience

### Technology Partners
- **MapLibre GL JS** - Primary GIS library
- **NestJS** - Backend framework
- **Next.js** - Frontend framework
- **MongoDB** - Database (consider PostGIS for spatial index)

---

**FINAL RECOMMENDATION**: 
**DO NOT BID until T1-CRS-TRANSFORM + T1-GIS-SCALE-PROOF are complete.**
**Invest 12-16 weeks to reach competitive parity.**
**Target first live municipality by end of Q3 2026.**
**Realistically compete for bids in Q1 2027.**
