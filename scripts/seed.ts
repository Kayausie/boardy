import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "boardy.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Drop and recreate
db.exec(`DROP TABLE IF EXISTS summaries; DROP TABLE IF EXISTS event_logs; DROP TABLE IF EXISTS users;`);

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    initials TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    start_date TEXT NOT NULL,
    remaining INTEGER DEFAULT 60,
    score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Needs support',
    color TEXT DEFAULT '#e2e8f0',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE event_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    payload TEXT DEFAULT '{}',
    timestamp TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const insertUser = db.prepare(`INSERT INTO users (name, initials, role, department, start_date, remaining, score, status, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insertEvent = db.prepare(`INSERT INTO event_logs (user_id, event_type, description, payload, timestamp) VALUES (?, ?, ?, ?, ?)`);

const now = new Date().toISOString();
const h = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3600000).toISOString();

// Users
const u1 = insertUser.run("Maya Chen", "MC", "Product Designer", "Product", "12 Aug 2026", 24, 89, "Above & beyond", "#d9e9ff");
const u2 = insertUser.run("Daniel Ross", "DR", "Frontend Engineer", "Engineering", "19 Aug 2026", 31, 76, "Well done", "#ffe6c7");
const u3 = insertUser.run("Priya Shah", "PS", "People Operations", "People", "26 Aug 2026", 38, 71, "Well done", "#e9dcff");
const u4 = insertUser.run("Marcus Lee", "ML", "Account Executive", "Sales", "02 Sep 2026", 45, 58, "Needs support", "#d5f0df");
const u5 = insertUser.run("Sofia Nguyen", "SN", "Marketing Associate", "Marketing", "09 Sep 2026", 52, 83, "Above & beyond", "#ffe1eb");

// Maya events
insertEvent.run(u1.lastInsertRowid, "ms365_document", "Uploaded 3 research synthesis files", JSON.stringify({source:"OneDrive",files:3}), h(2));
insertEvent.run(u1.lastInsertRowid, "ms365_email", "Sent an update to the Growth team", JSON.stringify({subject:"Usability insights — week 3"}), h(3));
insertEvent.run(u1.lastInsertRowid, "figma_comment", "Left feedback on the onboarding prototype", JSON.stringify({tool:"Figma",comments:4}), h(26));
insertEvent.run(u1.lastInsertRowid, "jira_task", "Moved 'Usability test synthesis' to complete", JSON.stringify({task:"Usability test synthesis",to:"Done"}), h(28));
insertEvent.run(u1.lastInsertRowid, "jira_task", "Started working on 'Redesign the onboarding flow'", JSON.stringify({progress:82}), h(5));

// Daniel events
insertEvent.run(u2.lastInsertRowid, "github_commit", "Opened a pull request for billing settings", JSON.stringify({pr:"#286",files_changed:12,additions:342,deletions:87}), h(1));
insertEvent.run(u2.lastInsertRowid, "github_commit", "Pushed 3 commits to feature/billing-settings", JSON.stringify({branch:"feature/billing-settings",commits:3}), h(2));
insertEvent.run(u2.lastInsertRowid, "ms365_email", "Replied to implementation feedback", JSON.stringify({subject:"Billing settings review"}), h(25));
insertEvent.run(u2.lastInsertRowid, "github_issue", "Commented on a customer-reported issue", JSON.stringify({issue:"#1194",type:"bug"}), h(27));
insertEvent.run(u2.lastInsertRowid, "jira_task", "Resolved mobile navigation bugs", JSON.stringify({task:"Resolve mobile navigation bugs",status:"Done"}), h(30));

// Priya events
insertEvent.run(u3.lastInsertRowid, "ms365_document", "Uploaded a revised onboarding checklist", JSON.stringify({source:"People hub",version:3}), h(4));
insertEvent.run(u3.lastInsertRowid, "ms365_email", "Sent welcome information to new starters", JSON.stringify({recipients:6}), h(26));
insertEvent.run(u3.lastInsertRowid, "jira_task", "Completed 'Audit leave policy pages'", JSON.stringify({status:"Done"}), h(28));

// Marcus events (fewer - needs support)
insertEvent.run(u4.lastInsertRowid, "ms365_document", "Opened sales enablement resources", JSON.stringify({documents:3}), h(25));
insertEvent.run(u4.lastInsertRowid, "slack_message", "Asked a question in the onboarding channel", JSON.stringify({channel:"#sales-onboarding"}), h(50));

// Sofia events
insertEvent.run(u5.lastInsertRowid, "ms365_document", "Uploaded the August social report", JSON.stringify({type:"report"}), h(3));
insertEvent.run(u5.lastInsertRowid, "jira_task", "Completed social performance report", JSON.stringify({daysAhead:2,status:"Done"}), h(26));
insertEvent.run(u5.lastInsertRowid, "jira_task", "Started Q4 campaign brief", JSON.stringify({progress:68}), h(6));

console.log("✅ Database seeded!");
console.log(`   Users: ${(db.prepare("SELECT COUNT(*) as c FROM users").get() as any).c}`);
console.log(`   Events: ${(db.prepare("SELECT COUNT(*) as c FROM event_logs").get() as any).c}`);

db.close();
