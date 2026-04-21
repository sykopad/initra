"use client";

import { useState, useCallback } from "react";
import { extractPalette, rgbToHex, ColorPalette } from "@/lib/utils/colorUtils";

interface ColorPickerProps {
  onColorsChange: (colors: string[]) => void;
  initialColors?: string[];
}

export default function ColorPicker({ onColorsChange, initialColors = [] }: ColorPickerProps) {
  const [colors, setColors] = useState<string[]>(initialColors);
  const [isExtracting, setIsExtracting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const palette = await extractPalette(file);
      const hexColors = palette.all.map(rgbToHex);
      setColors(hexColors);
      onColorsChange(hexColors);
    } catch (err) {
      console.error("Extraction failed:", err);
    } finally {
      setIsExtracting(false);
    }
  }, [onColorsChange]);

  const addColor = useCallback((color: string) => {
    const next = [...colors, color];
    setColors(next);
    onColorsChange(next);
  }, [colors, onColorsChange]);

  const removeColor = useCallback((index: number) => {
    const next = colors.filter((_, i) => i !== index);
    setColors(next);
    onColorsChange(next);
  }, [colors, onColorsChange]);

  return (
    <div className="glass-panel" style={{ padding: "2rem" }}>
      <h3 style={{ marginBottom: "1.5rem" }}>Brand Identity</h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Upload Section */}
        <div>
          <label className="form-label" style={{ marginBottom: "1rem", display: "block" }}>
            Upload Logo (Optional)
          </label>
          <div 
            style={{ 
              border: "2px dashed var(--border-color)", 
              borderRadius: "1rem", 
              padding: "2rem", 
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              transition: "border-color 0.2s"
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--primary-color)")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
            onClick={() => document.getElementById("logo-upload")?.click()}
          >
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Logo preview" 
                style={{ maxHeight: "80px", maxWidth: "100%", objectFit: "contain" }} 
              />
            ) : (
              <div style={{ color: "var(--text-secondary)" }}>
                <span style={{ fontSize: "2rem", display: "block" }}>🖼️</span>
                <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Click to upload</p>
              </div>
            )}
            <input 
              id="logo-upload"
              type="file" 
              accept="image/*" 
              onChange={handleLogoUpload} 
              style={{ display: "none" }}
            />
          </div>
          <p style={{ fontSize: "0.75rem", marginTop: "0.5rem", color: "var(--text-muted)" }}>
            We'll automatically extract your brand colors from the logo.
          </p>
        </div>

        {/* Color Palette Section */}
        <div>
          <label className="form-label" style={{ marginBottom: "1rem", display: "block" }}>
            Brand Palette
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {colors.map((color, i) => (
              <div 
                key={i} 
                className="color-swatch-container"
                style={{ position: "relative", group: "true" } as any}
              >
                <div 
                  style={{ 
                    width: "40px", 
                    height: "40px", 
                    backgroundColor: color, 
                    borderRadius: "0.5rem",
                    border: "2px solid var(--border-color)",
                    cursor: "pointer"
                  }}
                  title={color}
                  onClick={() => removeColor(i)}
                />
              </div>
            ))}
            <div 
              style={{ 
                width: "40px", 
                height: "40px", 
                backgroundColor: "var(--bg-secondary)", 
                borderRadius: "0.5rem",
                border: "2px dashed var(--border-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
              onClick={() => addColor("#7000FF")}
            >
              +
            </div>
          </div>

          {isExtracting && <p style={{ fontSize: "0.85rem", color: "var(--primary-color)" }}>Analyzing logo...</p>}
        </div>
      </div>
    </div>
  );
}
