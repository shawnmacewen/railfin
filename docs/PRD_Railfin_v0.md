# Railfin — Product Requirements Document (PRD)

- **Version:** v0.1 (Draft)
- **Owner:** Rolly (Product)
- **COO/Orchestration:** railfin-coo
- **Contributors:** railfin-dev, railfin-ui, railfin-sec
- **Status:** Draft / Discovery
- **Last Updated:** 2026-02-27 (UTC)

---

## 1) Product Summary
Railfin is being built with a lane-based execution model (dev/ui/sec) coordinated by railfin-coo. This PRD defines what we are building, who it serves, why it matters, and how we ship it with low merge friction and high documentation quality.

## 2) Problem Statement
Teams and solo builders often lose momentum due to:
- unclear scope and priorities,
- fragmented implementation across UI/dev/security,
- merge conflicts from overlapping work,
- weak documentation and inconsistent status reporting.

Railfin aims to provide a structured, execution-first product workflow with clear ownership, documented progress, and predictable delivery.

## 3) Vision
Create a reliable project operating system where planning, implementation, security, and delivery move in sync—without chaos.

## 4) Goals (Phase 1)
1. Define a clear end-to-end MVP scope.
2. Establish lane ownership and branch hygiene to minimize conflicts.
3. Implement weekly status reporting (default) and daily reporting (as needed).
4. Maintain documentation-first execution (design notes, decisions, changelogs, release notes).
5. Build a repeatable QA/review checkpoint before merge.

## 5) Non-Goals (Phase 1)
- Full enterprise-scale automation from day one.
- Perfect process coverage before shipping MVP.
- Multi-product portfolio support (focus Railfin only).

## 6) Users & Stakeholders
- **Primary:** Rolly (project owner / decision maker)
- **Execution Team:**
  - railfin-dev (backend/core engineering)
  - railfin-ui (frontend/UX/accessibility)
  - railfin-sec (security hardening/risk)
- **Coordinator:** railfin-coo (routing, sequencing, merge readiness)

## 7) Success Metrics
### Delivery Metrics
- % of tasks shipped without cross-lane merge conflicts
- Lead time (Ready → Done)
- Review turnaround time

### Quality Metrics
- Defect escape rate after merge
- Security findings per release
- Documentation completeness per task (required refs + notes)

### Reporting Metrics
- Weekly update posted on schedule
- Daily update cadence activated during high-risk periods

## 8) Scope (MVP)
### 8.1 Workflow & Orchestration
- Intake all work through railfin-coo.
- Assign every task to one owner/lane.
- Require branch-per-task and refs (branch/PR/commit).
- Enforce merge queue and blocker escalation.

### 8.2 Documentation System
- Task-level notes: what changed, why, risk, rollback notes.
- Weekly summary: shipped, in-progress, blockers, next week plan.
- Daily summary (conditional): when risk, volume, or critical deadlines are active.

### 8.3 QA & Review
- Lightweight QA checklist per PR.
- Security touchpoint for sensitive changes.
- Release-readiness gate before merge-to-main.

## 9) Functional Requirements
1. **Task Intake:** New request logged with owner, lane, priority, status.
2. **Assignment Rules:** Single owner, explicit lane, explicit dependencies.
3. **Branch Strategy:** `feat/<lane>/<task-id>-<slug>` or `fix/<lane>/<task-id>-<slug>`.
4. **PR Requirements:** Description, testing notes, risk notes, linked task refs.
5. **Merge Sequencing:** Ordered by dependency graph and conflict risk.
6. **Status Reporting:** Weekly baseline + optional daily mode.
7. **Escalation:** Blocked tasks surfaced to railfin-coo and Rolly quickly.

## 10) Non-Functional Requirements
- Clear auditability of decisions and changes.
- Minimal process overhead for small tasks.
- Consistent communication format across lanes.
- Fast recovery path for hotfixes.

## 11) Risks & Mitigations
- **Risk:** Overlap across lanes → merge conflicts.
  - **Mitigation:** strict ownership boundaries + merge sequencing.
- **Risk:** Under-documentation.
  - **Mitigation:** PR template + required task notes.
- **Risk:** Security regressions.
  - **Mitigation:** railfin-sec checkpoint on sensitive areas.
- **Risk:** Throughput bottleneck in COO lane.
  - **Mitigation:** define delegation thresholds and add new specialist agents when sustained load exceeds capacity.

## 12) Milestones (Draft)
- **M0 — Setup:** Repo structure + branch/PR templates + definition of done.
- **M1 — MVP Core:** First end-to-end feature delivered through all lanes.
- **M2 — Process Hardening:** Weekly update cadence stable; QA gate enforced.
- **M3 — Scale Readiness:** Add/adjust specialist agents based on workload patterns.

## 13) Open Questions
1. What is Railfin’s exact user-facing product outcome for MVP (the first “must-wow” use case)?
2. What is the target release window for MVP?
3. What tech stack and deployment target are locked in?
4. What compliance/security constraints are required now vs later?
5. What level of test coverage is required for MVP merge gate?

## 14) Immediate Next Actions
1. Confirm MVP use case and target user persona.
2. Lock acceptance criteria for first 3 milestones.
3. Define PR/branch naming conventions in repo docs.
4. Create weekly update template and first reporting schedule.
5. Start backlog triage into Now / Next / Later.

---

## Appendix A — Weekly Update Template
- **Shipped this week:**
- **In progress:**
- **Blocked / risks:**
- **Security notes:**
- **Next week priorities:**
- **Decisions needed from Rolly:**

## Appendix B — Daily Update Template (When Active)
- **Today shipped:**
- **Current blockers:**
- **At-risk items (24–72h):**
- **Next actions by lane (dev/ui/sec):**
