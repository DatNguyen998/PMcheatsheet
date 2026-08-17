/**
 * scripts/seed.ts — One-time content loader.
 *
 * Pushes the PM knowledge content (previously hardcoded in the old
 * assets/js/data.js) into Supabase. Safe to re-run: it clears the five
 * content tables and re-inserts everything, so content always matches this
 * file exactly after a run.
 *
 * Usage:
 *   1. Copy .env.example to .env.local and fill in:
 *        SUPABASE_URL=...
 *        SUPABASE_SERVICE_ROLE_KEY=...   (Project Settings → API → service_role)
 *      The service role key bypasses Row Level Security — keep it out of the
 *      app and out of git. It is only ever used here, run locally by you.
 *   2. pnpm seed
 *
 * After this runs once, all further content changes happen directly in
 * Supabase Studio's table editor — this script does not need to run again
 * unless you want to reset content back to this baseline.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Copy .env.example to .env.local and fill in your project's values, then re-run `pnpm seed`."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ============================================================================
// Content — identical to the former assets/js/data.js, just reshaped for
// insertion. This is the ONE place this data is typed out; from here on it
// lives in the database.
// ============================================================================

const PROCESS_GROUPS = ["Initiating", "Planning", "Executing", "Monitoring & Controlling", "Closing"];

const KNOWLEDGE_AREAS: Record<string, { hue: number; icon: string; blurb: string }> = {
  Integration:    { hue: 250, icon: "fa-cubes",        blurb: "Coordinates all the moving parts into one coherent whole." },
  Scope:          { hue: 275, icon: "fa-bullseye",     blurb: "Defines and controls what is — and is not — in the project." },
  Schedule:       { hue: 210, icon: "fa-clock",        blurb: "Plans and controls timely completion of the project." },
  Cost:           { hue: 45,  icon: "fa-coins",        blurb: "Plans, estimates, budgets, and controls costs." },
  Quality:        { hue: 160, icon: "fa-check-circle", blurb: "Ensures the project satisfies the needs it was undertaken for." },
  Resources:      { hue: 300, icon: "fa-users",        blurb: "Identifies, acquires, and manages people and physical resources." },
  Communications: { hue: 190, icon: "fa-envelope",     blurb: "Ensures timely, appropriate flow of project information." },
  Risk:           { hue: 10,  icon: "fa-shield-alt",   blurb: "Increases the probability of positive, and reduces negative, events." },
  Procurement:    { hue: 130, icon: "fa-handshake",    blurb: "Acquires goods and services from outside the project team." },
  Stakeholder:    { hue: 330, icon: "fa-user-friends", blurb: "Engages people and groups impacted by the project." },
};

const processData: Record<string, Record<string, string[]>> = {
  Integration: {
    Initiating: ["Develop Project Charter"],
    Planning: ["Develop Project Management Plan"],
    Executing: ["Direct and Manage Project Work"],
    "Monitoring & Controlling": ["Monitor and Control Project Work", "Perform Integrated Change Control"],
    Closing: ["Close Project or Phase"],
  },
  Scope: {
    Initiating: [],
    Planning: ["Plan Scope Management", "Collect Requirements", "Define Scope", "Create WBS"],
    Executing: [],
    "Monitoring & Controlling": ["Validate Scope", "Control Scope"],
    Closing: [],
  },
  Schedule: {
    Initiating: [],
    Planning: ["Plan Schedule Management", "Define Activities", "Sequence Activities", "Estimate Activity Resources", "Estimate Activity Durations", "Develop Schedule"],
    Executing: [],
    "Monitoring & Controlling": ["Control Schedule"],
    Closing: [],
  },
  Cost: {
    Initiating: [],
    Planning: ["Plan Cost Management", "Estimate Costs", "Determine Budget"],
    Executing: [],
    "Monitoring & Controlling": ["Control Costs"],
    Closing: [],
  },
  Quality: {
    Initiating: [],
    Planning: ["Plan Quality Management"],
    Executing: ["Manage Quality"],
    "Monitoring & Controlling": ["Control Quality"],
    Closing: [],
  },
  Resources: {
    Initiating: [],
    Planning: ["Plan Resource Management"],
    Executing: ["Acquire Resources", "Develop Team", "Manage Team"],
    "Monitoring & Controlling": [],
    Closing: [],
  },
  Communications: {
    Initiating: [],
    Planning: ["Plan Communications Management"],
    Executing: ["Manage Communications"],
    "Monitoring & Controlling": ["Monitor Communications"],
    Closing: [],
  },
  Risk: {
    Initiating: [],
    Planning: ["Plan Risk Management", "Identify Risks", "Perform Qualitative Risk Analysis", "Perform Quantitative Risk Analysis", "Plan Risk Responses"],
    Executing: [],
    "Monitoring & Controlling": ["Monitor Risks"],
    Closing: [],
  },
  Procurement: {
    Initiating: [],
    Planning: ["Plan Procurement Management"],
    Executing: ["Conduct Procurements"],
    "Monitoring & Controlling": ["Control Procurements"],
    Closing: ["Close Procurements"],
  },
  Stakeholder: {
    Initiating: ["Identify Stakeholders"],
    Planning: ["Plan Stakeholder Engagement"],
    Executing: ["Manage Stakeholder Engagement"],
    "Monitoring & Controlling": ["Monitor Stakeholder Engagement"],
    Closing: [],
  },
};

const definitions = [
  { title: "Initiating", icon: "fa-play", text: "Formally authorizes the project or phase. No charter, no project. Provides a high-level description of the product, service, or result." },
  { title: "Planning", icon: "fa-pen-fancy", text: "Establishes plans to guide the work. Clarifies who does what, when, and where. Progressive elaboration, used to document subsidiary plans." },
  { title: "Executing", icon: "fa-cogs", text: "This is where the work gets done! Creates deliverables that are reviewed by the customer." },
  { title: "Monitoring & Controlling", icon: "fa-chart-line", text: "Do deliverables comply with the project plan? Track, review, and adjust performance to meet objectives. Assess impact of scope changes. Review, develop, and manage deliverables." },
  { title: "Closing", icon: "fa-check-double", text: "Properly closes the project or phase. Reviews scope baseline to ensure completion. Finalizes all activities. Transfers project products to operations, production, or next phase." },
  { title: "Integration Management", icon: "fa-cubes", text: "Focuses on the big picture, ensuring that project parts are coordinated. High-level perspective. Car body analogy – concept of tuning and retuning the band." },
  { title: "Scope Management", icon: "fa-bullseye", text: "Logical process to understand scope and verify that the product is correct. Outlines all scope processes and plans. How scope will be delivered. Perform Integrated Change Control focuses on managing project scope changes, while Monitor and Control Project Work ensures that the product, service, or result matches scope. Formal acceptance of completed project deliverables." },
  { title: "Schedule Management", icon: "fa-clock", text: "The project manager should control the schedule; schedule is derived from scope baseline and other information. The heart of project information. Primary tool for controlling project scope. Compares work results to plan. Ensures project performance matches plan. Schedule is managed continuously throughout the project life cycle." },
  { title: "Cost Management", icon: "fa-coins", text: "Goal: complete project within approved budget. Requires continuous cost monitoring. Lifecycle cost: total cost of ownership from creation to disposal – analyzes the bigger cost picture. Value engineering: getting more value from the project in every possible way. Cost management should be done early and requires clear scope and WBS. Cost and scope are tightly linked." },
  { title: "Quality Management", icon: "fa-check-circle", text: "Quality elements: 1) Customer satisfaction 2) Prevention over inspection 3) Continuous improvement or “Kaizen” (just-in-time) 4) Management responsibility 5) Cost of quality – do it right the first time. Key terms: TQM; Kaizen; JIT (kanban); ISO 9000; standard deviation; prevention." },
  { title: "Resource Management", icon: "fa-users", text: "Defines roles for everyone on the project and clarifies each role’s responsibilities. Defines roles and responsibilities, staffing, managers, team building, evaluation, and improvement of the project team. Provides project staffing and ensures ongoing resource availability. The project manager must be a team leader, guiding the team to make the best contributions to the project. Builds team awareness and improves work performance." },
  { title: "Communications Management", icon: "fa-envelope", text: "Covers all tasks related to generating, assembling, sending, storing, retiring, and managing project records. Develops communication methods based on stakeholder needs. Ongoing and periodic review." },
  { title: "Risk Management", icon: "fa-shield-alt", text: "Risks are related to uncertain events. Identifies which risks have higher priority for the project (priority ranking). Assigns numbers to quantify risks, analyzing impact on project numerically. Iterative process, confirming that risks are properly planned. Tracks identified risks, identifies new risks, and ensures risk management effectiveness." },
  { title: "Procurement Management", icon: "fa-handshake", text: "Formal process of obtaining goods, services, or scope from outside the organization. Identifies positive and negative risks and takes appropriate responses. Creates and documents plans to handle positive and negative risks. Determines which components or services will be performed internally and which will be outsourced. Selects sellers and service providers and awards procurement contracts." },
  { title: "Stakeholder Management", icon: "fa-user-friends", text: "Identifies all stakeholders, plans how to engage them, manages their expectations, and monitors engagement effectiveness. Ensures stakeholder satisfaction." },
];

const inputsData: Record<string, string[]> = {
  Integration: ["Project Charter", "Project Management Plan", "Approved Change Requests", "Deliverables", "Work Performance Data", "Work Performance Reports", "Organizational Process Assets", "Enterprise Environmental Factors"],
  Scope: ["Project Charter", "Requirements Documentation", "Requirements Traceability Matrix", "Scope Management Plan", "Project Scope Statement", "WBS", "Scope Baseline"],
  Schedule: ["Project Management Plan", "Project Charter", "Schedule Management Plan", "Scope Baseline", "Activity List", "Activity Attributes", "Milestone List", "Resource Calendars", "Project Schedule"],
  Cost: ["Project Management Plan", "Project Charter", "Cost Management Plan", "Scope Baseline", "Project Schedule", "Risk Register", "Resource Requirements", "Basis of Estimates"],
  Quality: ["Project Management Plan", "Quality Metrics", "Quality Checklists", "Work Performance Data", "Deliverables", "Approved Change Requests"],
  Resources: ["Project Management Plan", "Activity Resource Requirements", "Human Resource Management Plan", "Project Staff Assignments", "Resource Calendars", "Issue Log"],
  Communications: ["Project Management Plan", "Stakeholder Register", "Communications Management Plan", "Work Performance Reports", "Project Communications"],
  Risk: ["Project Management Plan", "Project Charter", "Risk Register", "Risk Report", "Stakeholder Register", "Procurement SOW"],
  Procurement: ["Requirements Documentation", "Risk Register", "Activity Resource Requirements", "Project Schedule", "Activity Cost Estimates", "Stakeholder Register", "Procurement Management Plan", "Procurement Documents"],
  Stakeholder: ["Project Charter", "Project Management Plan", "Stakeholder Register", "Stakeholder Engagement Plan", "Communications Management Plan", "Issue Log"],
};

const toolsData: Record<string, string[]> = {
  Integration: ["Expert Judgment", "Meetings", "Facilitation Techniques", "Project Management Information System", "Analytical Techniques", "Change Control Tools"],
  Scope: ["Expert Judgment", "Meetings", "Interviews", "Focus Groups", "Facilitated Workshops", "Group Creativity Techniques", "Decision-Making Techniques", "Questionnaires and Surveys", "Observations", "Prototypes", "Benchmarking", "Brainstorming", "Nominal Group Technique", "Decomposition", "Product Analysis", "Variance Analysis"],
  Schedule: ["Expert Judgment", "Analytical Techniques", "Meetings", "Critical Path Method", "Critical Chain Method", "Resource Optimization Techniques", "Modeling Techniques", "Leads and Lags", "Schedule Compression", "Rolling Wave Planning", "Precedence Diagramming Method", "Analogous Estimating", "Parametric Estimating", "Three-Point Estimating"],
  Cost: ["Expert Judgment", "Analytical Techniques", "Meetings", "Three-Point Estimating", "Reserve Analysis", "Cost of Quality", "Cost Aggregation", "Historical Relationships", "Funding Limit Reconciliation", "Earned Value Management", "Forecasting"],
  Quality: ["Quality Audits", "Process Analysis", "Seven Basic Quality Tools", "Cost-Benefit Analysis", "Cost of Quality", "Benchmarking", "Design of Experiments", "Statistical Sampling", "Quality Management and Control Tools"],
  Resources: ["Organization Charts", "Responsibility Assignment Matrix", "Interpersonal and Team Skills", "Training", "Team Building Activities", "Ground Rules", "Co-location", "Recognition and Rewards", "Performance Assessments"],
  Communications: ["Communication Requirements Analysis", "Communication Models", "Communication Technology", "Communication Methods", "Meetings", "Information Management Systems", "Performance Reporting"],
  Risk: ["Expert Judgment", "Meetings", "Information Gathering Techniques", "Documentation Reviews", "Risk Analysis", "Risk Probability and Impact Assessment", "Probability and Impact Matrix", "Decision Tree Analysis", "Sensitivity Analysis", "Monte Carlo Simulation", "Reserve Analysis", "Risk Audits"],
  Procurement: ["Make-or-Buy Analysis", "Expert Judgment", "Market Research", "Meetings", "Bidder Conferences", "Proposal Evaluation Techniques", "Independent Estimates", "Procurement Negotiations", "Procurement Audits"],
  Stakeholder: ["Expert Judgment", "Meetings", "Stakeholder Analysis", "Power/Interest Grid", "Stakeholder Engagement Assessment Matrix", "Communication Methods", "Interpersonal Skills", "Management Skills"],
};

const outputsData: Record<string, string[]> = {
  Integration: ["Project Charter", "Project Management Plan", "Deliverables", "Work Performance Data", "Change Requests", "Work Performance Reports", "Final Product Acceptance", "Organizational Process Assets Updates"],
  Scope: ["Scope Management Plan", "Requirements Management Plan", "Requirements Documentation", "Requirements Traceability Matrix", "Project Scope Statement", "Scope Baseline", "Deliverable Acceptance", "Change Requests"],
  Schedule: ["Schedule Management Plan", "Activity List", "Activity Attributes", "Milestone List", "Project Schedule", "Schedule Baseline", "Schedule Data", "Project Calendars", "Change Requests"],
  Cost: ["Cost Management Plan", "Activity Cost Estimates", "Basis of Estimates", "Cost Baseline", "Project Funding Requirements", "Cost Forecasts", "Change Requests"],
  Quality: ["Quality Management Plan", "Process Improvement Plan", "Quality Metrics", "Quality Checklists", "Quality Reports", "Change Requests", "Verified Deliverables"],
  Resources: ["Resource Management Plan", "Project Staff Assignments", "Resource Calendars", "Team Performance Assessments", "Change Requests", "Project Documents Updates"],
  Communications: ["Communications Management Plan", "Project Communications", "Project Documents Updates", "Change Requests"],
  Risk: ["Risk Register", "Risk Report", "Risk Management Plan", "Risk Response Plan", "Change Requests", "Project Documents Updates"],
  Procurement: ["Procurement Management Plan", "Procurement Documents", "Selected Sellers", "Agreements", "Procurement Closure", "Change Requests"],
  Stakeholder: ["Stakeholder Register", "Stakeholder Engagement Plan", "Change Requests", "Project Documents Updates"],
};

// ============================================================================
// Seed logic
// ============================================================================

async function clearTables() {
  console.log("Clearing existing content...");
  // Children first (FK constraints), then parents.
  for (const table of ["resource_items", "processes", "definitions", "process_groups", "knowledge_areas"]) {
    const { error } = await supabase.from(table).delete().gte("id", 0);
    if (error) throw new Error(`Failed clearing ${table}: ${error.message}`);
  }
}

async function seedKnowledgeAreas(): Promise<Record<string, number>> {
  const rows = Object.entries(KNOWLEDGE_AREAS).map(([name, meta], i) => ({
    name,
    hue: meta.hue,
    icon: meta.icon,
    blurb: meta.blurb,
    sort_order: i,
  }));
  const { data, error } = await supabase.from("knowledge_areas").insert(rows).select("id, name");
  if (error) throw new Error(`Failed seeding knowledge_areas: ${error.message}`);
  return Object.fromEntries(data!.map((r) => [r.name, r.id]));
}

async function seedProcessGroups(): Promise<Record<string, number>> {
  const rows = PROCESS_GROUPS.map((name, i) => ({ name, sort_order: i }));
  const { data, error } = await supabase.from("process_groups").insert(rows).select("id, name");
  if (error) throw new Error(`Failed seeding process_groups: ${error.message}`);
  return Object.fromEntries(data!.map((r) => [r.name, r.id]));
}

function requireId(map: Record<string, number>, key: string, label: string): number {
  const id = map[key];
  if (id === undefined) throw new Error(`Missing ${label} id for "${key}" — did seeding order change?`);
  return id;
}

async function seedProcesses(areaIds: Record<string, number>, groupIds: Record<string, number>) {
  const rows: { knowledge_area_id: number; process_group_id: number; title: string; sort_order: number }[] = [];
  for (const area of Object.keys(processData)) {
    for (const group of PROCESS_GROUPS) {
      (processData[area]?.[group] ?? []).forEach((title, i) => {
        rows.push({
          knowledge_area_id: requireId(areaIds, area, "knowledge area"),
          process_group_id: requireId(groupIds, group, "process group"),
          title,
          sort_order: i,
        });
      });
    }
  }
  const { error } = await supabase.from("processes").insert(rows);
  if (error) throw new Error(`Failed seeding processes: ${error.message}`);
  return rows.length;
}

async function seedDefinitions() {
  const rows = definitions.map((d, i) => ({ title: d.title, icon: d.icon, body: d.text, sort_order: i }));
  const { error } = await supabase.from("definitions").insert(rows);
  if (error) throw new Error(`Failed seeding definitions: ${error.message}`);
  return rows.length;
}

async function seedResourceItems(areaIds: Record<string, number>) {
  const rows: { knowledge_area_id: number; kind: "input" | "tool" | "output"; label: string; sort_order: number }[] = [];
  const sources: [Record<string, string[]>, "input" | "tool" | "output"][] = [
    [inputsData, "input"],
    [toolsData, "tool"],
    [outputsData, "output"],
  ];
  for (const [data, kind] of sources) {
    for (const area of Object.keys(data)) {
      (data[area] ?? []).forEach((label, i) => {
        rows.push({ knowledge_area_id: requireId(areaIds, area, "knowledge area"), kind, label, sort_order: i });
      });
    }
  }
  const { error } = await supabase.from("resource_items").insert(rows);
  if (error) throw new Error(`Failed seeding resource_items: ${error.message}`);
  return rows.length;
}

async function main() {
  await clearTables();

  const areaIds = await seedKnowledgeAreas();
  console.log(`✓ ${Object.keys(areaIds).length} knowledge areas`);

  const groupIds = await seedProcessGroups();
  console.log(`✓ ${Object.keys(groupIds).length} process groups`);

  const processCount = await seedProcesses(areaIds, groupIds);
  console.log(`✓ ${processCount} processes`);

  const defCount = await seedDefinitions();
  console.log(`✓ ${defCount} definitions`);

  const itemCount = await seedResourceItems(areaIds);
  console.log(`✓ ${itemCount} resource items (inputs/tools/outputs)`);

  console.log("\nDone. Content now lives in Supabase — edit it via Studio's table editor from here on.");
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message);
  process.exit(1);
});
