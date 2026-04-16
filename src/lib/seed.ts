import { db } from "@/db";
import { users, sites, visits } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const DEMO_SITES = [
  { name: "North Creek Terminal", address: "14 Industrial Rd, Johannesburg South" },
  { name: "Johannesburg Distribution Hub", address: "Cnr Comet & Ring Rd, Johannesburg" },
  { name: "Cape Town Depot", address: "77 Buitengracht St, Cape Town" },
  { name: "Durban Logistics Centre", address: "3 Umbilo Rd, Durban" },
  { name: "Pretoria Field Station", address: "12 Dynamo Rd, Pretoria" },
  { name: "Port Elizabeth Terminal", address: "5 Bay Rd, Port Elizabeth" },
  { name: "Bloemfontein Hub", address: "88 Zastron St, Bloemfontein" },
  { name: "East London Depot", address: "21 Oxford St, East London" },
  { name: "Polokwane Field Site", address: "4 Landdros Maré St, Polokwane" },
  { name: "Nelspruit Operations Centre", address: "15 Samora Machel Ave, Nelspruit" },
];

async function seed() {
  console.log("🌱 Seeding workforce database...");

  // Create users
  const passwordHash = await bcrypt.hash("WorkerPass123!", 10);
  const adminHash = await bcrypt.hash("AdminPass123!", 10);

  const [admin1, admin2] = await db
    .insert(users)
    .values([
      {
        email: "admin@workforce.co.za",
        passwordHash: adminHash,
        name: "Alex Morgan",
        role: "admin",
        targetVisitsDaily: 12,
        targetKmsDaily: "150.00",
      },
      {
        email: "manager@workforce.co.za",
        passwordHash: adminHash,
        name: "Jordan Lee",
        role: "admin",
        targetVisitsDaily: 12,
        targetKmsDaily: "150.00",
      },
      {
        email: "worker1@workforce.co.za",
        passwordHash: passwordHash,
        name: "Sam Khumalo",
        role: "worker",
        targetVisitsDaily: 12,
        targetKmsDaily: "150.00",
      },
      {
        email: "worker2@workforce.co.za",
        passwordHash: passwordHash,
        name: "Tsatsi Mokoena",
        role: "worker",
        targetVisitsDaily: 12,
        targetKmsDaily: "150.00",
      },
    ])
    .returning()
    .onConflictDoNothing();

  console.log("✅ Users created");

  // Create sites
  const createdSites = await db
    .insert(sites)
    .values(
      DEMO_SITES.map((s) => ({
        name: s.name,
        address: s.address,
        isActive: true,
      }))
    )
    .returning()
    .onConflictDoNothing();

  console.log(`✅ ${createdSites.length} sites created`);

  // Create 7 days of sample visits for each worker
  const workers = [admin1, admin2].filter(Boolean);
  const inspectionNotes = [
    "All clear. No issues found.",
    "Minor wear on gate hinge. Logged for maintenance.",
    "Safety signage needs replacement. Flagged.",
    "Site clean and secure. All systems operational.",
    "Leak detected near loading dock. Reported to facilities.",
    "Fence damage noted on east perimeter. Scheduled repair.",
    "Good condition overall. Minor litter removed.",
    "Access road requires grading. Scheduled.",
    "All equipment functional. No action needed.",
    "Customer feedback kiosk offline. IT notified.",
  ];

  for (const worker of workers) {
    if (!worker) continue;

    // Get a subset of sites for this worker
    const workerSites = createdSites.slice(0, 6);

    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      date.setHours(9 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0, 0);

      const numVisits = 3 + Math.floor(Math.random() * 5); // 3-7 visits per day

      for (let v = 0; v < numVisits; v++) {
        const site = workerSites[Math.floor(Math.random() * workerSites.length)];
        const kms = (5 + Math.random() * 60).toFixed(2);
        const note =
          inspectionNotes[Math.floor(Math.random() * inspectionNotes.length)];

        await db.insert(visits).values({
          workerId: String(worker.id),
          siteId: site.id,
          timestamp: new Date(date.getTime() + v * 45 * 60 * 1000),
          kmsCovered: kms,
          inspectionNotes: note,
          status: "completed",
        });
      }
    }
  }

  console.log("✅ Sample visits created for all workers");
  console.log("\n📋 Seed credentials:");
  console.log("  Admin:   admin@workforce.co.za / AdminPass123!");
  console.log("  Admin 2: manager@workforce.co.za / ManagerPass123!");
  console.log("  Worker 1: worker1@workforce.co.za / WorkerPass123!");
  console.log("  Worker 2: worker2@workforce.co.za / WorkerPass123!");
  console.log("\n✨ Done!");
}

seed().catch(console.error);