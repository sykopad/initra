import { generateVentureBlueprintAction } from "./src/lib/actions/community";

async function main() {
  console.log("🚀 Initializing Phase 25 Flagship Venture Generation...");
  console.log("🧠 Model: Claude 4.6 (Elite Architect Mode)");
  
  try {
    const project = await generateVentureBlueprintAction();
    console.log("✅ Success! Flagship Venture Generated:");
    console.log(`📌 Title: ${project.title}`);
    console.log(`🎯 Category: ${project.category}`);
    console.log(`🔗 ID: ${project.id}`);
  } catch (err) {
    console.error("❌ Generation failed:", err);
  }
}

main();
