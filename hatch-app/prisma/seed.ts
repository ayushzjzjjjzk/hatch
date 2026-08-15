import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-");
}

const CATEGORIES = ["AI", "SaaS", "Fintech", "Developer Tools", "Consumer", "Healthcare", "Education", "Marketplace", "Robotics", "Climate"];

// All companies and founders below are fictional, invented for demo purposes only.
// Website/social URLs use the .example TLD or an "-example" suffix so nothing
// resolves to a real, unrelated site or person - swap in real data as you add
// real startups through the admin dashboard.
const STARTUPS = [
  {
    id: "seed-0",
    name: "Lumina",
    shortDescription: "AI-powered analytics that explain themselves in plain English.",
    description:
      "Lumina turns raw product and revenue data into plain-English explanations of what changed and why. Instead of another dashboard full of charts, teams get a daily digest that reads like a smart analyst wrote it, complete with the underlying query so nothing is a black box. Lumina connects to your warehouse in minutes and gets smarter the more questions your team asks it.",
    categories: ["AI"],
    ycBatch: "W26",
    location: "San Francisco, CA",
    foundedYear: 2025,
    employeeRange: "1-10",
    featured: true,
    founders: [
      { name: "Maya Chen", role: "Co-Founder & CEO", bio: "Previously led analytics at a Series C logistics startup." },
      { name: "Daniel Osei", role: "Co-Founder & CTO", bio: "Spent six years building data infrastructure at scale." }
    ]
  },
  {
    id: "seed-1",
    name: "Fernbase",
    shortDescription: "Branch your database like you branch your code.",
    description:
      "Fernbase gives every pull request its own isolated copy of your production database, ready in seconds instead of hours. Engineers test against real data without ever touching production, and branches disappear automatically when the PR merges or closes. It plugs into your existing Postgres setup, so there's no migration and no new ORM to learn.",
    categories: ["Developer Tools"],
    ycBatch: "S25",
    location: "Remote",
    foundedYear: 2024,
    employeeRange: "1-10",
    hasGithub: true,
    founders: [{ name: "Priya Raman", role: "Founder & CEO", bio: "Built developer infrastructure teams at two prior startups." }]
  },
  {
    id: "seed-2",
    name: "Coral Pay",
    shortDescription: "Instant payouts for global contractor teams.",
    description:
      "Coral Pay lets companies pay contractors and freelancers in 40+ countries in their local currency, usually within minutes instead of days. One dashboard handles compliance, tax forms, and FX, so finance teams stop juggling five different payment providers. Contractors get a single, simple place to see what they're owed and when it lands.",
    categories: ["Fintech"],
    ycBatch: "W26",
    location: "New York, NY",
    foundedYear: 2025,
    employeeRange: "11-50",
    featured: true,
    founders: [
      { name: "Lucas Ferreira", role: "Co-Founder & CEO", bio: "Ran international payments partnerships before starting Coral Pay." },
      { name: "Ines Duarte", role: "Co-Founder & COO", bio: "Focused on cross-border compliance and operations." }
    ]
  },
  {
    id: "seed-3",
    name: "Voxel Health",
    shortDescription: "Turning routine scans into earlier warnings.",
    description:
      "Voxel Health reviews routine CT and MRI scans for early signs of conditions the scan wasn't originally ordered to look for, and flags them for a radiologist's second look. It's built to sit alongside existing hospital imaging systems rather than replace them, so nothing changes about how clinicians already work. Early pilot sites have used it to catch findings that would otherwise have waited for a future scan to surface.",
    categories: ["Healthcare"],
    ycBatch: "S25",
    location: "Boston, MA",
    foundedYear: 2024,
    employeeRange: "11-50",
    founders: [{ name: "Amara Bello", role: "Co-Founder & CEO", bio: "Practicing radiologist turned founder." }]
  },
  {
    id: "seed-4",
    name: "Northlight",
    shortDescription: "Satellite methane monitoring, built for regulators.",
    description:
      "Northlight combines satellite imagery with ground sensor data to detect methane leaks at oil and gas sites within hours of them starting, not months. Reports are formatted to match what regulators and auditors actually ask for, so operators can go from detection to fix without a translation step in between. The platform already covers several major basins and adds new coverage every quarter.",
    categories: ["Climate"],
    ycBatch: "W25",
    location: "Denver, CO",
    foundedYear: 2024,
    employeeRange: "11-50",
    featured: true,
    founders: [
      { name: "Owen Bright", role: "Co-Founder & CEO", bio: "Background in satellite remote sensing." },
      { name: "Sana Iqbal", role: "Co-Founder & CTO", bio: "Previously built environmental sensor networks." }
    ]
  },
  {
    id: "seed-5",
    name: "Fieldnote",
    shortDescription: "A shared trip notebook for people who explore together.",
    description:
      "Fieldnote is a shared notebook for hiking, climbing, and camping groups to plan routes, log gear lists, and drop pins on trail conditions as they go. Everything works offline and syncs once someone's back in signal range, which matters more than most trip-planning apps seem to assume. It started as a tool the founder built for his own hiking group and grew from there.",
    categories: ["Consumer"],
    ycBatch: "S26",
    location: "Seattle, WA",
    foundedYear: 2025,
    employeeRange: "1-10",
    founders: [{ name: "Theo Marsh", role: "Founder", bio: "Started Fieldnote to solve his own group's planning chaos." }]
  },
  {
    id: "seed-6",
    name: "Craftline",
    shortDescription: "Where independent furniture makers sell direct to design studios.",
    description:
      "Craftline connects independent furniture makers directly with interior design studios and architecture firms, cutting out the markup and delay of traditional wholesale showrooms. Makers set their own lead times and pricing; studios get verified craftsmanship and real production timelines up front. Every listing includes the materials, dimensions, and the maker's own process notes, not just a product photo.",
    categories: ["Marketplace", "Consumer"],
    ycBatch: "W26",
    location: "Chicago, IL",
    foundedYear: 2025,
    employeeRange: "1-10",
    founders: [
      { name: "Nora Kessler", role: "Co-Founder & CEO", bio: "Worked in wholesale furniture sourcing for eight years." },
      { name: "Ben Whitfield", role: "Co-Founder", bio: "Runs a small furniture workshop himself." }
    ]
  },
  {
    id: "seed-7",
    name: "Pathwise",
    shortDescription: "Practice sets that target exactly what a student is missing.",
    description:
      "Pathwise looks at a student's recent practice problems and figures out the specific concept gap causing the mistakes, then builds the next set of problems around closing that gap instead of just moving on. Teachers get a plain-language summary of where each student is stuck, without having to grade a pile of near-identical worksheets. It's currently used in middle and high school math classrooms.",
    categories: ["Education"],
    ycBatch: "S25",
    location: "Austin, TX",
    foundedYear: 2024,
    employeeRange: "1-10",
    founders: [{ name: "Grace Lindqvist", role: "Founder & CEO", bio: "Taught middle school math for six years before founding Pathwise." }]
  },
  {
    id: "seed-8",
    name: "Anchorpoint Robotics",
    shortDescription: "Autonomous inspection arms for offshore wind turbines.",
    description:
      "Anchorpoint builds autonomous robotic arms that climb and inspect offshore wind turbine blades without grounding the turbine or sending a technician up on a rope. The arm captures high-resolution imagery and flags damage patterns automatically, cutting inspection time from a full day to under two hours. It's designed to survive the same salt, wind, and vibration the turbines themselves are built for.",
    categories: ["Robotics", "Climate"],
    ycBatch: "W25",
    location: "Houston, TX",
    foundedYear: 2024,
    employeeRange: "11-50",
    hasGithub: true,
    founders: [
      { name: "Marcus Deng", role: "Co-Founder & CEO", bio: "Previously an offshore wind technician and engineer." },
      { name: "Elif Yildiz", role: "Co-Founder & CTO", bio: "Built autonomous inspection systems for industrial robotics." }
    ]
  },
  {
    id: "seed-9",
    name: "Ledgerly",
    shortDescription: "Close your books in a day, not two weeks.",
    description:
      "Ledgerly automates the repetitive parts of monthly close, matching transactions, chasing down discrepancies, and assembling the standard reports, so finance teams spend their close week reviewing exceptions instead of hunting for them. It connects to most common accounting platforms and layers on top rather than replacing them. Teams using it have cut close time from around two weeks to a day or two.",
    categories: ["SaaS", "Fintech"],
    ycBatch: "S26",
    location: "Toronto, Canada",
    foundedYear: 2025,
    employeeRange: "1-10",
    founders: [{ name: "Samir Rahman", role: "Founder & CEO", bio: "Worked in corporate accounting before starting Ledgerly." }]
  }
];

async function main() {
  console.log("Seeding categories...");
  const categoryIdByName = new Map<string, string>();
  for (const name of CATEGORIES) {
    const slug = slugify(name);
    const category = await prisma.category.upsert({
      where: { name },
      update: { slug },
      create: { name, slug }
    });
    categoryIdByName.set(name, category.id);
  }

  console.log("Seeding admin user...");
  const adminEmail = process.env.ADMIN_EMAIL || "admin@hatch.dev";
  const adminPassword = process.env.ADMIN_PASSWORD || "change-me-immediately";
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "ADMIN" },
    create: { name: "Hatch Admin", email: adminEmail, passwordHash, role: "ADMIN" }
  });

  console.log(`Seeding ${STARTUPS.length} startups...`);
  for (const [index, s] of STARTUPS.entries()) {
    const slug = slugify(s.name);
    // cascades to founders/images/categories via onDelete: Cascade, so this is
    // safe to re-run - it resets each seed startup back to this known state
    await prisma.startup.deleteMany({ where: { id: s.id } });

    await prisma.startup.create({
      data: {
        id: s.id,
        name: s.name,
        slug,
        shortDescription: s.shortDescription,
        description: s.description,
        websiteUrl: `https://www.${slug}.example`,
        linkedinUrl: `https://linkedin.com/company/${slug}-example`,
        xUrl: `https://x.com/${slug.replace(/-/g, "")}example`,
        githubUrl: s.hasGithub ? `https://github.com/${slug.replace(/-/g, "")}example` : null,
        youtubeUrl: null,
        ycBatch: s.ycBatch,
        location: s.location,
        foundedYear: s.foundedYear,
        employeeRange: s.employeeRange,
        status: "PUBLISHED",
        featured: s.featured ?? false,
        displayOrder: index,
        founders: {
          create: s.founders.map((f, i) => {
            const handle = slugify(f.name);
            return {
              name: f.name,
              role: f.role,
              bio: f.bio,
              linkedinUrl: `https://linkedin.com/in/${handle}-example`,
              xUrl: `https://x.com/${handle.replace(/-/g, "")}example`,
              displayOrder: i
            };
          })
        },
        categories: {
          create: s.categories.map((name) => ({ categoryId: categoryIdByName.get(name)! }))
        }
      }
    });
  }

  console.log("\nDone.");
  console.log(`Admin login -> email: ${adminEmail}  password: ${adminPassword}`);
  console.log("Change that password as soon as you log in.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
