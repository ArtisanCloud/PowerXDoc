# Primary Use Case: AI Coaching & Playbook Enhancement

## Background Overview

Training new sales and customer service staff often consumes significant time and is difficult to simulate realistic scenarios. Through AIGC, intelligent coaching can be created to simulate customer conversations, evaluate scripts, and provide suggestions. This primary use case focuses on AI coaching system applications: scenario construction, interactive drills, scoring feedback, and knowledge retention to help teams grow rapidly.

## Goals & Value
- **Scenario Simulation**: Automatically construct dialogue scenarios based on industries and products.
- **Real-time Feedback**: AI scoring, identify shortcomings, provide improvement suggestions.
- **Knowledge Retention**: Excellent scripts compiled into playbooks with continuous iteration.
- **Training Metrics**: Quantify learning outcomes and guide coaching plans.

## Participating Roles
- **Sales/Customer Service Staff**: Participate in training, improve skills.
- **Training & Enablement Teams**: Design courses and assessments.
- **Product/Experts**: Provide standard answers and cases.
- **Data Science Team**: Optimize coaching models and scoring algorithms.
- **Management**: View training effectiveness and team capability assessments.

## Primary Scenario User Story
> **As a** training leader, **I want** to use AI coaching to simulate realistic customer scenarios and output scores, **so that** I can improve team script levels and adaptability.

## Sub-scenario Details

### Sub-scenario A: Coaching Scenario Design
- **Roles & Triggers**: Training team releases new courses.
- **Main Process**:
  1. Select business scenarios (price negotiation, after-sales comfort, technical consultation).
  2. Write basic scripts, standard answers, scoring dimensions.
  3. AIGC extends multi-turn dialogue possibilities based on industry knowledge.
  4. Test scenarios and open to designated employees.
- **Success Criteria**: Realistic scenarios; clear scoring standards; smooth experience.
- **Exceptions & Risk Control**: Scenario errors can be rolled back; sensitive information redacted; version management.
- **Metric Suggestions**: Scenario launch cycle, usage rate, feedback scores.

### Sub-scenario B: Employee Training & Real-time Feedback
- **Roles & Triggers**: Employees start coaching.
- **Main Process**:
  1. Employees dialogue with AI, handle problems or objections.
  2. System evaluates speech speed, emotion, scripts, logic in real-time.
  3. Attach suggestions, priority improvements, reference scripts.
  4. Employees can practice repeatedly until reaching target score.
- **Success Criteria**: Timely feedback; specific suggestions; high employee recognition.
- **Exceptions & Risk Control**: AI misjudgments can be appealed; provide manual review channels; record practice logs.
- **Metric Suggestions**: Practice times, average score improvement, feedback satisfaction.

### Sub-scenario C: Result Evaluation & Advancement
- **Roles & Triggers**: Need to evaluate training effectiveness.
- **Main Process**:
  1. Summarize employee training results, generate leaderboards and capability maps.
  2. Set advancement standards (qualifying scores, practice times).
  3. Arrange coaching courses for low-scoring employees.
  4. Sync results to performance or learning systems.
- **Success Criteria**: Fair and transparent evaluation; clear advancement; effective coaching.
- **Exceptions & Risk Control**: Abnormal scores require review; capability tags need protection; support report export.
- **Metric Suggestions**: Qualification rate, coaching completion rate, capability improvement amplitude.

### Sub-scenario D: Script Library Optimization & Sharing
- **Roles & Triggers**: Collect excellent answers and practical experience.
- **Main Process**:
  1. Add high-scoring scripts to knowledge base, tag scenarios and effects.
  2. Push to sales/customer service daily application tools.
  3. Continuously collect feedback and update scripts.
  4. Evaluate script effectiveness with practical data.
- **Success Criteria**: Timely script updates; high team usage rate; significant effectiveness.
- **Exceptions & Risk Control**: Outdated scripts automatically go offline; sensitive content review; record modification history.
- **Metric Suggestions**: Script reuse rate, practical conversion improvement, update frequency.

## Scenario-level Test Case Examples

> Test Preparation: Build coaching platform, scoring models, script library, leaderboards, feedback collection mechanisms.

### Test Case A-1: Price Negotiation Coaching (Positive)
- **Prerequisites**: Scenario includes common objections.
- **Steps**:
  1. Employee conducts a coaching session.
  2. View scores and suggestions.
- **Expected Results**:
  - System evaluates script logic, empathy, closing guidance, and gives 0-100 score.
  - Suggests improvements and reference scripts.
  - Practice records written to employee learning files.

### Test Case B-1: AI Misjudgment Appeal (Negative)
- **Prerequisites**: Intentionally state standard answer but AI gives low score.
- **Steps**:
  1. Submit appeal.
  2. Observe handling process.
- **Expected Results**:
  - QA staff receives appeal, can view conversation and scoring details.
  - After review approval, adjust score and optimize model.
  - Logs record this appeal for model training.

---
