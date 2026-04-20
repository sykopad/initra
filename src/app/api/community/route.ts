import { NextResponse } from "next/server";

// ── Community Projects API ──────────────────────
// GET: List projects with optional filtering
// POST: Create a new project suggestion

// Demo data storage (will be replaced with Supabase queries)
let communityProjects = [
  {
    id: "1",
    title: "Open Source Disaster Relief Coordination",
    description:
      "A real-time platform for coordinating disaster relief efforts. Features live mapping, volunteer dispatching, and inventory tracking for aid organizations.",
    category: "web-app",
    tags: ["humanitarian", "real-time", "mapping"],
    impactStatement:
      "Helps save lives by improving disaster response coordination",
    status: "proposed",
    voteScore: 142,
    agentCount: 0,
    suggestedBy: "Sarah_K",
    createdAt: "2026-04-15T00:00:00Z",
  },
  {
    id: "2",
    title: "Accessible Education Platform for Developing Nations",
    description:
      "Offline-first mobile learning platform with AI-powered tutoring. Supports low-bandwidth environments and local language translations.",
    category: "mobile-app",
    tags: ["education", "accessibility", "offline-first"],
    impactStatement:
      "Brings quality education to underserved communities worldwide",
    status: "in-progress",
    voteScore: 98,
    agentCount: 3,
    suggestedBy: "DevForGood",
    createdAt: "2026-04-10T00:00:00Z",
  },
  {
    id: "3",
    title: "Community Health Monitoring API",
    description:
      "Open API for aggregating anonymized community health data. Helps public health officials identify disease outbreaks and allocate resources.",
    category: "api-backend",
    tags: ["health", "open-data", "api"],
    impactStatement:
      "Early detection of health crises through data-driven monitoring",
    status: "needs-agents",
    voteScore: 76,
    agentCount: 1,
    suggestedBy: "HealthTech_Co",
    createdAt: "2026-04-08T00:00:00Z",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "votes";

    let filtered = [...communityProjects];

    // Filter by status
    if (status && status !== "all") {
      filtered = filtered.filter((p) => p.status === status);
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    // Sort
    if (sort === "votes") {
      filtered.sort((a, b) => b.voteScore - a.voteScore);
    } else if (sort === "recent") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return NextResponse.json({ projects: filtered }, { status: 200 });
  } catch (error) {
    console.error("[Community API] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, category, tags, impactStatement } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const newProject = {
      id: String(Date.now()),
      title,
      description,
      category: category || "web-app",
      tags: tags || [],
      impactStatement: impactStatement || "",
      status: "proposed",
      voteScore: 1,
      agentCount: 0,
      suggestedBy: "Anonymous",
      createdAt: new Date().toISOString(),
    };

    communityProjects = [newProject, ...communityProjects];

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error("[Community API] POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
