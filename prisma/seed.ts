import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.summary.deleteMany();
  await prisma.eventLog.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const maya = await prisma.user.create({
    data: {
      name: "Maya Chen",
      initials: "MC",
      role: "Product Designer",
      department: "Product",
      startDate: "12 Aug 2024",
      remaining: 24,
      score: 89,
      status: "Above & beyond",
      color: "#d9e9ff",
    },
  });

  const daniel = await prisma.user.create({
    data: {
      name: "Daniel Ross",
      initials: "DR",
      role: "Frontend Engineer",
      department: "Engineering",
      startDate: "19 Aug 2024",
      remaining: 31,
      score: 76,
      status: "Well done",
      color: "#ffe6c7",
    },
  });

  const priya = await prisma.user.create({
    data: {
      name: "Priya Shah",
      initials: "PS",
      role: "People Operations",
      department: "People",
      startDate: "26 Aug 2024",
      remaining: 38,
      score: 71,
      status: "Well done",
      color: "#e9dcff",
    },
  });

  const marcus = await prisma.user.create({
    data: {
      name: "Marcus Lee",
      initials: "ML",
      role: "Account Executive",
      department: "Sales",
      startDate: "02 Sep 2024",
      remaining: 45,
      score: 58,
      status: "Needs support",
      color: "#d5f0df",
    },
  });

  const sofia = await prisma.user.create({
    data: {
      name: "Sofia Nguyen",
      initials: "SN",
      role: "Marketing Associate",
      department: "Marketing",
      startDate: "09 Sep 2024",
      remaining: 52,
      score: 83,
      status: "Above & beyond",
      color: "#ffe1eb",
    },
  });

  // Create EventLogs for each user
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Maya's events
  await prisma.eventLog.createMany({
    data: [
      { userId: maya.id, eventType: "ms365_document", description: "Uploaded 3 research synthesis files", payload: JSON.stringify({ source: "OneDrive", files: 3, folder: "Onboarding research" }), timestamp: new Date(now.getTime() - 2 * 3600000) },
      { userId: maya.id, eventType: "ms365_email", description: "Sent an update to the Growth team", payload: JSON.stringify({ subject: "Usability insights — week 3", recipients: 5 }), timestamp: new Date(now.getTime() - 3 * 3600000) },
      { userId: maya.id, eventType: "figma_comment", description: "Left feedback on the onboarding prototype", payload: JSON.stringify({ tool: "Figma", comments: 4 }), timestamp: yesterday },
      { userId: maya.id, eventType: "jira_task", description: "Moved 'Usability test synthesis' to complete", payload: JSON.stringify({ task: "Usability test synthesis", from: "In Progress", to: "Done" }), timestamp: yesterday },
      { userId: maya.id, eventType: "jira_task", description: "Started working on 'Redesign the onboarding flow'", payload: JSON.stringify({ task: "Redesign the onboarding flow", progress: 82 }), timestamp: new Date(now.getTime() - 5 * 3600000) },
    ],
  });

  // Daniel's events
  await prisma.eventLog.createMany({
    data: [
      { userId: daniel.id, eventType: "github_commit", description: "Opened a pull request for billing settings", payload: JSON.stringify({ pr: "#286", files_changed: 12, additions: 342, deletions: 87 }), timestamp: new Date(now.getTime() - 1 * 3600000) },
      { userId: daniel.id, eventType: "github_commit", description: "Pushed 3 commits to feature/billing-settings", payload: JSON.stringify({ branch: "feature/billing-settings", commits: 3 }), timestamp: new Date(now.getTime() - 2 * 3600000) },
      { userId: daniel.id, eventType: "ms365_email", description: "Replied to implementation feedback", payload: JSON.stringify({ subject: "Billing settings review", replyTime: "1h 14m" }), timestamp: yesterday },
      { userId: daniel.id, eventType: "github_issue", description: "Commented on a customer-reported issue", payload: JSON.stringify({ issue: "#1194", type: "bug" }), timestamp: yesterday },
      { userId: daniel.id, eventType: "jira_task", description: "Resolved mobile navigation bugs", payload: JSON.stringify({ task: "Resolve mobile navigation bugs", status: "Done" }), timestamp: new Date(yesterday.getTime() - 3600000) },
    ],
  });

  // Priya's events
  await prisma.eventLog.createMany({
    data: [
      { userId: priya.id, eventType: "ms365_document", description: "Uploaded a revised onboarding checklist", payload: JSON.stringify({ source: "People hub", version: 3 }), timestamp: new Date(now.getTime() - 4 * 3600000) },
      { userId: priya.id, eventType: "ms365_email", description: "Sent welcome information to new starters", payload: JSON.stringify({ recipients: 6 }), timestamp: yesterday },
      { userId: priya.id, eventType: "jira_task", description: "Completed 'Audit leave policy pages'", payload: JSON.stringify({ task: "Audit leave policy pages", status: "Done" }), timestamp: new Date(yesterday.getTime() - 2 * 3600000) },
    ],
  });

  // Marcus's events (fewer - he needs support)
  await prisma.eventLog.createMany({
    data: [
      { userId: marcus.id, eventType: "ms365_document", description: "Opened sales enablement resources", payload: JSON.stringify({ source: "Training series", documents: 3 }), timestamp: yesterday },
      { userId: marcus.id, eventType: "slack_message", description: "Asked a question in the onboarding channel", payload: JSON.stringify({ channel: "#sales-onboarding" }), timestamp: new Date(yesterday.getTime() - 48 * 3600000) },
    ],
  });

  // Sofia's events
  await prisma.eventLog.createMany({
    data: [
      { userId: sofia.id, eventType: "ms365_document", description: "Uploaded the August social report", payload: JSON.stringify({ source: "Growth drive", type: "report" }), timestamp: new Date(now.getTime() - 3 * 3600000) },
      { userId: sofia.id, eventType: "jira_task", description: "Completed social performance report", payload: JSON.stringify({ task: "Compile social performance report", status: "Done", daysAhead: 2 }), timestamp: yesterday },
      { userId: sofia.id, eventType: "jira_task", description: "Started Q4 campaign brief", payload: JSON.stringify({ task: "Prepare Q4 campaign brief", progress: 68 }), timestamp: new Date(now.getTime() - 6 * 3600000) },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log(`   Created ${await prisma.user.count()} users`);
  console.log(`   Created ${await prisma.eventLog.count()} events`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
