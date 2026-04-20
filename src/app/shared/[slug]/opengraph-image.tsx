import { ImageResponse } from "next/og";
import { getSharedConfig } from "@/lib/actions/shared";

export const runtime = "edge";
export const alt = "Initra Shared Configuration";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const shared = await getSharedConfig(slug);

  if (!shared) {
    return new ImageResponse(
      (
        <div style={{ background: "#0a0a0a", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyItems: "center" }}>
           <h1 style={{ color: "#fff" }}>Config Not Found</h1>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage: "radial-gradient(circle at 25% 25%, #1a1a1a 0%, #0a0a0a 100%)",
          padding: "80px",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
          <span style={{ fontSize: "60px" }}>⚡</span>
          <span style={{ fontSize: "40px", color: "#fff", fontWeight: "bold" }}>Initra</span>
        </div>

        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          background: "rgba(255, 255, 255, 0.05)", 
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "24px",
          padding: "60px",
          width: "100%",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        }}>
          <h1 style={{ 
            fontSize: "64px", 
            fontWeight: "bold", 
            color: "#fff", 
            margin: "0 0 20px 0",
            letterSpacing: "-0.02em"
          }}>
            {shared.projectName}
          </h1>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
             <span style={{ fontSize: "32px", color: "#00ffff" }}>{shared.templateSlug}</span>
             <span style={{ fontSize: "24px", color: "rgba(255, 255, 255, 0.5)" }}>•</span>
             <span style={{ fontSize: "24px", color: "#fff" }}>By {shared.profiles?.username || "Initra User"}</span>
          </div>

          <div style={{ display: "flex", gap: "20px", marginTop: "40px" }}>
             <div style={{ color: "#fff", background: "rgba(0, 255, 255, 0.1)", padding: "10px 20px", borderRadius: "80px", border: "1px solid rgba(0, 255, 255, 0.2)", fontSize: "20px" }}>
               {shared.config.selectedPackages.length} Packages
             </div>
             <div style={{ color: "#fff", background: "rgba(255, 0, 255, 0.1)", padding: "10px 20px", borderRadius: "80px", border: "1px solid rgba(255, 0, 255, 0.2)", fontSize: "20px" }}>
               {shared.config.stackConfig.language}
             </div>
          </div>
        </div>

        <p style={{ marginTop: "40px", fontSize: "24px", color: "rgba(255, 255, 255, 0.4)" }}>
          initra.ai/shared/{slug}
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
