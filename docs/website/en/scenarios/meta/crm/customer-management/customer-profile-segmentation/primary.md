# Customer Profile & Segmentation

## Background Overview

In B2B scenarios, customer information often involves multi-layer structures of enterprises, departments, and contacts, continuously evolving through deal closure, renewal, and service processes. PowerX CRM needs to provide a unified customer profile center supporting data collection, profiling, tiered management, and tag operations. This primary use case focuses on "Customer Profile & Segmentation," helping enterprises transform scattered customer data into operational structured assets.

## Objectives & Value
- **Unified Profile Model**: Integrate multi-dimensional information including enterprises, contacts, and business relationships to maintain data consistency
- **Automated Tiering**: Dynamically calculate customer tiers based on indicators such as revenue scale, activity level, and partnership depth
- **Profile Tag沉淀**: Generate tags through behavioral, transactional, and interaction data to support precise marketing and service
- **Reminder & Care Mechanisms**: Automatic alerts for key contacts and important dates to enhance customer stickiness
- **Cross-System Synchronization**: Tags and tiers synchronized to marketing automation, intelligent recommendation, and other systems for synergy

## Participating Roles
- **Customer Service Team**: Maintain customer basic information, ensuring profile completeness and accuracy
- **Sales Team**: Maintain key contacts, business relationships, and reminder items
- **Data Operations / Agent**: Analyze behavioral data to generate profile tags and tiering strategies
- **Administrator**: Configure tiering rules, batch update tags, and integrate with external systems

## Primary Scenario User Story
> **As a** Customer Operations Manager, **I want to** master customer profiles through standardized profiles and dynamic tiering, **so that** I can improve refined operational capabilities and support sales, service, and marketing collaboration.

## Sub-Scenario Details

### Sub-Scenario A: Auto-Scored Customer Tier Identification
- **Roles & Triggers**: After customer service enters enterprise information, the system automatically marks customer tiers based on revenue scale
- **Main Process**:
  1. Customer service fills in enterprise basic information in the customer profile (revenue, industry, employee count, region, etc.)
  2. The system invokes tiering rules to mark customers as strategic, core, or regular tiers based on thresholds
  3. If key fields are missing, the system prompts for supplementation and records pending status
  4. Tiering results are written to the customer profile and synchronized to the sales board
- **Success Criteria**: Accurate tiering rule execution; improved profile completeness; timely identification of high-value customers
- **Exceptions & Risk Control**: Field exceptions (such as sudden revenue increases) trigger approval; tiering rule updates require version management
- **Metrics Recommendation**: Profile completeness rate, tiering accuracy rate, strategic customer identification timeliness

### Sub-Scenario B: Behavioral Profile Tag Auto-Generation
- **Roles & Triggers**: Agent analyzes past customer transactions and interaction frequency to generate profile tags and potential needs alerts
- **Main Process**:
  1. Agent regularly aggregates orders, customer service, and marketing interaction data to calculate customer behavioral metrics
  2. Automatically tags based on rule engine, such as "highly active," "new product focused," or "price sensitive"
  3. Combines industry knowledge base to generate potential needs alerts, pushed to sales and customer success teams
  4. Tag changes form a timeline supporting review of customer interest evolution
- **Success Criteria**: Accurate tag generation; actionable alerts; improved sales feedback adoption rate
- **Exceptions & Risk Control**: Abnormal behavior triggers risk control tags; algorithmic iteration maintains explainability; redundant tags auto-merge
- **Metrics Recommendation**: Tag hit rate, alert adoption rate, behavioral data refresh frequency

### Sub-Scenario C: Key Contact Reminders & Care
- **Roles & Triggers**: Sales creates key contacts and sets reminders, system sends care notifications on birthdays or renewal nodes
- **Main Process**:
  1. Sales adds key contacts in the customer profile, recording role, decision-making authority, interests, etc.
  2. Set important dates (birthday, contract expiration, launch milestones) and reminder methods
  3. System pushes reminders at specified times, providing care templates or renewal alerts
  4. Sales executes care actions and records results, forming customer care logs
- **Success Criteria**: On-time reminders; care actions recorded; improved customer satisfaction
- **Exceptions & Risk Control**: Contact departure marking; duplicate reminder merging; sensitive information follows permission controls
- **Metrics Recommendation**: Reminder delivery rate, care execution rate, renewal/upsell conversion rate

### Sub-Scenario D: Tag Batch Maintenance & Synchronization
- **Roles & Triggers**: Administrator batch updates customer tags, system synchronizes to marketing automation and intelligent recommendation modules
- **Main Process**:
  1. Administrator filters customers in CRM and batch modifies tags based on campaigns or strategies
  2. System records change reasons, executors, and timestamps, supporting undo or rollback
  3. Tag updates synchronize in real-time to marketing, BI, recommendation, and other systems
  4. Downstream systems receive events to update segmented audiences or recommendation strategies
- **Success Criteria**: Safe and controllable batch operations; no sync delays; consistent tags across systems
- **Exceptions & Risk Control**: Sync failures auto-retry; sensitive tags require approval; generate audit reports
- **Metrics Recommendation**: Tag sync latency, batch operation success rate, tag conflict rate

## Scenario-Level Test Case Examples

> Test Preparation: Enable customer profile center, tag engine, and reminder services in sandbox environment. Pre-load 20 customer records with varying revenue, industries, and activity levels; import 6 months of orders and interaction logs; configure birthday/renewal reminder templates and batch tag task permissions.

### Use Case A-1: Auto-Tiering Hits Strategic Customer (Positive)
- **Prerequisites**: Customer "Xingchen Technology" with 500M revenue, manufacturing industry, system threshold set for strategic customer metrics
- **Operation Steps**:
  1. Customer service updates customer revenue field to 500M
  2. After saving profile, check customer tier
- **Expected Results**:
  - System immediately marks customer tier as "strategic"
  - Customer profile timeline adds tiering log showing trigger rules and calculation details
  - Sales board synchronizes "strategic customer attention reminder"

### Use Case B-1: Behavioral Profile Auto-Tagging (Positive)
- **Prerequisites**: Agent analysis task executes daily at midnight; customer "Huaguang Energy" completed 3 online training sessions and 2 renewal consultations in past 30 days
- **Operation Steps**:
  1. Manually trigger behavioral analysis task
  2. Check customer profile tag panel
- **Expected Results**:
  - New tags added: "high engagement," "strong training intent"
  - Potential needs alert generated and pushed to sales and CSM
  - Tag change timeline expandable to view source metrics

### Use Case C-1: Key Contact Reminder (Positive)
- **Prerequisites**: Contact "Li Mei" birthday field is May 20; reminder strategy triggers 7 days in advance
- **Operation Steps**:
  1. Sales sets birthday care reminder for Li Mei
  2. Wait for scheduled task to execute on May 13
- **Expected Results**:
  - Sales receives care reminder on desktop and mobile with recommended scripts
  - CRM auto-generates "birthday care task" requiring execution result entry
  - After care completion, recorded in customer care log

### Use Case D-1: Batch Tag Sync to Marketing Platform (Positive)
- **Prerequisites**: Administrator has batch operation permissions; marketing platform integration available
- **Operation Steps**:
  1. Filter "manufacturing + strategic customer" list in CRM, total 8 companies
  2. Execute batch operation, add tag "new product launch invitation"
  3. Verify marketing automation platform audience sync results
- **Expected Results**:
  - Batch operation generates operation log with approval number
  - 8 customers sync to marketing platform within 5 minutes and join corresponding audience packages
  - If any record fails sync, system retains retry log and alerts

### Use Case D-2: Sensitive Tag Approval Failure Rollback (Negative)
- **Prerequisites**: "Blacklist" tag requires security team approval
- **Operation Steps**:
  1. Administrator attempts to batch add "blacklist" tag
  2. Approver rejects request
- **Expected Results**:
  - Tag application status shows "rejected" with reason written to operation log
  - Customer profile does not show "blacklist" tag, no external sync
  - System prompts applicant to resubmit or adjust strategy

---

## Related Resources

- [Back to Customer & Lead Management](/en/scenarios/meta/crm/customer-management/)
- [CRM Scenarios Overview](/en/scenarios/meta/crm/)
- [Business Scenarios](/en/scenarios/meta/)
