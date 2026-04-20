"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { generateAgentFiles } from "@/lib/engine";
import { PROJECT_TEMPLATES, PROJECT_CATEGORIES } from "@/lib/engine/templates";
import { IDE_TARGETS } from "@/lib/engine/ide-targets";
import { PACKAGE_LIBRARY, PACKAGE_CATEGORIES, getPackagesForTemplate } from "@/lib/engine/package-library";
import type { WizardConfig, GeneratedFile, IDETarget, ProjectTemplate, StackOption } from "@/lib/engine/types";



const STEPS = [
  { label: "Project",  number: 1 },
  { label: "Stack",    number: 2 },
  { label: "Packages", number: 3 },
  { label: "IDE",      number: 4 },
  { label: "Review",   number: 5 },
  { label: "Export",   number: 6 },
];

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [projectName, setProjectName] = useState("");
  const [stackConfig, setStackConfig] = useState<Record<string, string | boolean>>({});
  const [selectedIDEs, setSelectedIDEs] = useState<IDETarget[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [pkgSearch, setPkgSearch] = useState("");
  const [pkgCategory, setPkgCategory] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter templates by category and search
  const filteredTemplates = useMemo(() => {
    let templates = PROJECT_TEMPLATES;
    if (selectedCategory) {
      templates = templates.filter((t) => t.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    return templates;
  }, [selectedCategory, searchQuery]);

  // Initialize stack config with defaults when template is selected
  const selectTemplate = useCallback((template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setStackConfig({ ...template.defaultStack });
    setStep(2);
  }, []);

  // Toggle IDE selection
  const toggleIDE = useCallback((ide: IDETarget) => {
    setSelectedIDEs((prev) =>
      prev.includes(ide) ? prev.filter((i) => i !== ide) : [...prev, ide]
    );
  }, []);

  // Toggle package selection
  const togglePackage = useCallback((slug: string) => {
    setSelectedPackages((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]
    );
  }, []);

  // Packages filtered by template, category, and search
  const filteredPackages = useMemo(() => {
    if (!selectedTemplate) return [];
    let pkgs = getPackagesForTemplate(selectedTemplate.slug);
    if (pkgCategory) pkgs = pkgs.filter((p) => p.category === pkgCategory);
    if (pkgSearch) {
      const q = pkgSearch.toLowerCase();
      pkgs = pkgs.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.npmPackage ?? p.pyPackage ?? p.pubPackage ?? "").toLowerCase().includes(q)
      );
    }
    return pkgs;
  }, [selectedTemplate, pkgCategory, pkgSearch]);

  // Categories that have packages for this template
  const availableCategories = useMemo(() => {
    if (!selectedTemplate) return [];
    const pkgs = getPackagesForTemplate(selectedTemplate.slug);
    const cats = new Set(pkgs.map((p) => p.category));
    return PACKAGE_CATEGORIES.filter((c) => cats.has(c.slug));
  }, [selectedTemplate]);

  // Generate files
  const handleGenerate = useCallback(() => {
    if (!selectedTemplate || selectedIDEs.length === 0) return;

    const config: WizardConfig = {
      templateSlug: selectedTemplate.slug,
      projectName: projectName || "My Project",
      stackConfig,
      selectedIDEs,
      selectedPackages,
    };

    const result = generateAgentFiles(config);
    setGeneratedFiles(result.files);
    setActiveFileIndex(0);
    setStep(5);
  }, [selectedTemplate, projectName, stackConfig, selectedIDEs, selectedPackages]);

  // Copy file to clipboard
  const copyToClipboard = useCallback(async (content: string) => {
    await navigator.clipboard.writeText(content);
    setToast("Copied to clipboard!");
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Download all as ZIP
  const downloadZip = useCallback(async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    for (const file of generatedFiles) {
      zip.file(file.filePath, file.content);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(projectName || "initra").toLowerCase().replace(/\s+/g, "-")}-agent-files.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("Downloaded ZIP file!");
    setTimeout(() => setToast(null), 2500);
  }, [generatedFiles, projectName]);

  // Get core and advanced stack options
  const coreOptions = selectedTemplate?.stackOptions.filter((o) => o.section === "core") || [];
  const advancedOptions = selectedTemplate?.stackOptions.filter((o) => o.section === "advanced") || [];

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <span className="logo-icon">⚡</span>
            <span className="brand-text">Initra</span>
          </Link>
          <ul className="navbar-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/community">Community</Link></li>
          </ul>
        </div>
      </nav>

      <div className="wizard-container">
        <div className="container">
          {/* Header */}
          <div className="wizard-header">
            <h1>🧙‍♂️ Project Wizard</h1>
            <p>Configure your project and generate perfect agent files</p>
          </div>

          {/* Progress Bar */}
          <div className="wizard-progress">
            {STEPS.map((s, i) => (
              <div className="progress-step" key={s.number} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                  <div
                    className={`progress-dot ${step === s.number ? "active" : step > s.number ? "completed" : ""}`}
                    onClick={() => {
                      if (s.number < step) setStep(s.number);
                    }}
                    style={{ cursor: s.number < step ? "pointer" : "default" }}
                  >
                    {step > s.number ? "✓" : s.number}
                  </div>
                  <div className={`progress-label ${step === s.number ? "active" : ""}`}>
                    {s.label}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`progress-line ${step > s.number ? "completed" : ""}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="wizard-content" key={step}>
            {/* ── Step 1: Choose Project Type ──────────── */}
            {step === 1 && (
              <>
                <h2 className="wizard-step-title">What are you building?</h2>
                <p className="wizard-step-subtitle">Choose a project type to get started</p>

                {/* Category filters */}
                <div className="filter-tabs" style={{ justifyContent: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                  <button
                    className={`filter-tab ${!selectedCategory ? "active" : ""}`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </button>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      className={`filter-tab ${selectedCategory === cat.slug ? "active" : ""}`}
                      onClick={() => setSelectedCategory(cat.slug)}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="search-input-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search frameworks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Template Grid */}
                <div className="project-type-grid">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.slug}
                      className={`project-type-card ${selectedTemplate?.slug === template.slug ? "selected" : ""}`}
                      onClick={() => selectTemplate(template)}
                    >
                      <span className="project-type-icon">{template.icon}</span>
                      <h3>{template.name}</h3>
                      <p>{template.description}</p>
                    </div>
                  ))}
                </div>

                {filteredTemplates.length === 0 && (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                    <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</p>
                    <p>No templates found. Try a different search or category.</p>
                  </div>
                )}
              </>
            )}

            {/* ── Step 2: Configure Stack ──────────────── */}
            {step === 2 && selectedTemplate && (
              <>
                <h2 className="wizard-step-title">Configure your {selectedTemplate.name} stack</h2>
                <p className="wizard-step-subtitle">Customize your tech stack. Smart defaults are pre-selected.</p>

                {/* Project name */}
                <div style={{ maxWidth: "500px", margin: "0 auto var(--space-2xl)" }}>
                  <div className="form-group">
                    <label className="form-label">
                      Project Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="My Awesome Project"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Core options */}
                <div className="stack-config-form">
                  {coreOptions.map((option) => (
                    <StackField
                      key={option.fieldName}
                      option={option}
                      value={stackConfig[option.fieldName]}
                      onChange={(val) => setStackConfig((prev) => ({ ...prev, [option.fieldName]: val }))}
                    />
                  ))}
                </div>

                {/* Advanced toggle */}
                {advancedOptions.length > 0 && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        margin: "2rem 0 1rem",
                        cursor: "pointer",
                        color: "var(--text-secondary)",
                      }}
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      <span style={{ transition: "transform 0.2s", transform: showAdvanced ? "rotate(90deg)" : "rotate(0)" }}>
                        ▸
                      </span>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Advanced Options</span>
                    </div>

                    {showAdvanced && (
                      <div className="stack-config-form" style={{ animation: "fadeIn 0.3s ease-out" }}>
                        {advancedOptions.map((option) => (
                          <StackField
                            key={option.fieldName}
                            option={option}
                            value={stackConfig[option.fieldName]}
                            onChange={(val) => setStackConfig((prev) => ({ ...prev, [option.fieldName]: val }))}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Navigation */}
                <div className="wizard-nav">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button className="btn btn-primary" onClick={() => setStep(3)}>
                    Choose Packages →
                  </button>
                </div>
              </>
            )}

            {/* ── Step 3: Select Packages ────────────────── */}
            {step === 3 && selectedTemplate && (
              <>
                <h2 className="wizard-step-title">Add packages &amp; libraries</h2>
                <p className="wizard-step-subtitle">
                  Select common packages for your {selectedTemplate.name} project. Skip to use defaults.
                </p>

                {/* Selected package tags */}
                {selectedPackages.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem", justifyContent: "center" }}>
                    {selectedPackages.map((slug) => {
                      const pkg = PACKAGE_LIBRARY.find((p) => p.slug === slug);
                      if (!pkg) return null;
                      return (
                        <span
                          key={slug}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            background: "var(--primary-subtle, rgba(124,58,237,0.15))",
                            border: "1px solid var(--primary)",
                            borderRadius: "999px",
                            padding: "0.25rem 0.75rem",
                            fontSize: "var(--text-sm)",
                            color: "var(--primary-light, #a78bfa)",
                          }}
                        >
                          {pkg.icon} {pkg.name}
                          <button
                            onClick={() => togglePackage(slug)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", lineHeight: 1, fontSize: "1rem" }}
                            aria-label={`Remove ${pkg.name}`}
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Category filter tabs */}
                <div className="filter-tabs" style={{ justifyContent: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
                  <button
                    className={`filter-tab ${!pkgCategory ? "active" : ""}`}
                    onClick={() => setPkgCategory(null)}
                  >
                    All
                  </button>
                  {availableCategories.map((cat) => (
                    <button
                      key={cat.slug}
                      className={`filter-tab ${pkgCategory === cat.slug ? "active" : ""}`}
                      onClick={() => setPkgCategory(cat.slug)}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="search-input-wrapper" style={{ marginBottom: "1.5rem" }}>
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search packages..."
                    value={pkgSearch}
                    onChange={(e) => setPkgSearch(e.target.value)}
                  />
                </div>

                {/* Package grid */}
                <div className="project-type-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                  {filteredPackages.map((pkg) => {
                    const isSelected = selectedPackages.includes(pkg.slug);
                    const badge = pkg.npmPackage ?? pkg.pyPackage ?? pkg.pubPackage;
                    return (
                      <div
                        key={pkg.slug}
                        className={`project-type-card ${isSelected ? "selected" : ""}`}
                        onClick={() => togglePackage(pkg.slug)}
                        style={{ textAlign: "left", gap: "0.5rem", position: "relative" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                          <span style={{ fontSize: "1.5rem" }}>{pkg.icon}</span>
                          <span style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>{pkg.name}</span>
                        </div>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                          {pkg.description}
                        </p>
                        {badge && (
                          <span
                            style={{
                              display: "inline-block",
                              marginTop: "0.5rem",
                              background: "rgba(255,255,255,0.07)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              borderRadius: "4px",
                              padding: "0.1rem 0.4rem",
                              fontSize: "0.65rem",
                              fontFamily: "monospace",
                              color: "var(--text-muted)",
                            }}
                          >
                            {badge}
                          </span>
                        )}
                        {isSelected && (
                          <div className="checkmark">✓</div>
                        )}
                      </div>
                    );
                  })}
                  {filteredPackages.length === 0 && (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                      No packages found for this search.
                    </div>
                  )}
                </div>

                <div className="wizard-nav">
                  <button className="btn btn-ghost" onClick={() => setStep(2)}>
                    ← Back
                  </button>
                  <button className="btn btn-ghost" onClick={() => setStep(4)}>
                    Skip →
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setStep(4)}
                  >
                    {selectedPackages.length > 0
                      ? `Continue with ${selectedPackages.length} package${selectedPackages.length > 1 ? "s" : ""} →`
                      : "Choose IDE →"}
                  </button>
                </div>
              </>
            )}

            {/* ── Step 4: Select IDE & Agent ───────────── */}
            {step === 4 && (
              <>
                <h2 className="wizard-step-title">Which IDE(s) do you use?</h2>
                <p className="wizard-step-subtitle">
                  Select one or more. We&apos;ll generate the right config files for each.
                </p>

                <div className="ide-grid">
                  {IDE_TARGETS.map((ide) => (
                    <div
                      key={ide.slug}
                      className={`ide-card ${selectedIDEs.includes(ide.slug) ? "selected" : ""}`}
                      onClick={() => toggleIDE(ide.slug)}
                      style={{ position: "relative" }}
                    >
                      <div className="ide-logo">{ide.icon}</div>
                      <div className="ide-info">
                        <h3>{ide.name}</h3>
                        <p>{ide.description}</p>
                        <span className="ide-file-badge">📄 {ide.configFilename}</span>
                      </div>
                      <div className="checkmark">✓</div>
                    </div>
                  ))}
                </div>

                <div className="wizard-nav">
                  <button className="btn btn-ghost" onClick={() => setStep(3)}>
                    ← Back
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleGenerate}
                    disabled={selectedIDEs.length === 0}
                    style={{ opacity: selectedIDEs.length === 0 ? 0.5 : 1 }}
                  >
                    🔮 Generate Files ({selectedIDEs.length} selected)
                  </button>
                </div>
              </>
            )}

            {/* ── Step 5: Review & Generate ─────────────── */}
            {step === 5 && generatedFiles.length > 0 && (
              <>
                <h2 className="wizard-step-title">Your Agent Files</h2>
                <p className="wizard-step-subtitle">
                  Review the generated content. {generatedFiles.length} file{generatedFiles.length > 1 ? "s" : ""} ready.
                </p>

                <div className="review-layout">
                  {/* File Preview */}
                  <div>
                    <div className="file-tabs">
                      {generatedFiles.map((file, idx) => (
                        <button
                          key={idx}
                          className={`file-tab ${activeFileIndex === idx ? "active" : ""}`}
                          onClick={() => setActiveFileIndex(idx)}
                        >
                          📄 {file.filename}
                        </button>
                      ))}
                    </div>
                    <div className="code-preview">
                      {generatedFiles[activeFileIndex]?.content}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => copyToClipboard(generatedFiles[activeFileIndex]?.content || "")}
                      >
                        📋 Copy
                      </button>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                        {generatedFiles[activeFileIndex]?.filePath}
                      </span>
                    </div>
                  </div>

                  {/* Summary Sidebar */}
                  <div className="review-sidebar">
                    <div className="card-glass review-summary">
                      <h3>📋 Configuration</h3>
                      <div className="review-item">
                        <span className="label">Template</span>
                        <span className="value">{selectedTemplate?.name}</span>
                      </div>
                      <div className="review-item">
                        <span className="label">Project</span>
                        <span className="value">{projectName || "My Project"}</span>
                      </div>
                      {Object.entries(stackConfig)
                        .filter(([, v]) => v && v !== "none")
                        .slice(0, 6)
                        .map(([key, value]) => (
                          <div className="review-item" key={key}>
                            <span className="label">{key}</span>
                            <span className="value">{String(value)}</span>
                          </div>
                        ))}
                      <div className="review-item">
                        <span className="label">IDEs</span>
                        <span className="value">{selectedIDEs.length}</span>
                      </div>
                      <div className="review-item">
                        <span className="label">Files</span>
                        <span className="value">{generatedFiles.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="wizard-nav">
                  <button className="btn btn-ghost" onClick={() => setStep(4)}>
                    ← Back
                  </button>
                  <button className="btn btn-primary" onClick={() => setStep(6)}>
                    📦 Export Files →
                  </button>
                </div>
              </>
            )}

            {/* ── Step 6: Download & Setup ─────────────── */}
            {step === 6 && (
              <>
                <h2 className="wizard-step-title">Export Your Files</h2>
                <p className="wizard-step-subtitle">
                  Download your agent configuration files and start building!
                </p>

                <div className="download-grid">
                  <div className="card download-option" onClick={downloadZip}>
                    <span className="download-icon">📁</span>
                    <h3>Download ZIP</h3>
                    <p>All files in the correct directory structure, ready to extract into your project.</p>
                  </div>
                  <div
                    className="card download-option"
                    onClick={() => {
                      const allContent = generatedFiles
                        .map((f) => `// ─── ${f.filePath} ───\n\n${f.content}`)
                        .join("\n\n\n");
                      copyToClipboard(allContent);
                    }}
                  >
                    <span className="download-icon">📋</span>
                    <h3>Copy All</h3>
                    <p>Copy all file contents to clipboard with file path headers.</p>
                  </div>
                  <div className="card download-option" style={{ opacity: 0.5, cursor: "default" }}>
                    <span className="download-icon">🔗</span>
                    <h3>Share Link</h3>
                    <p>Generate a permalink to share your configuration. Coming soon!</p>
                  </div>
                </div>

                {/* Setup Instructions */}
                <div className="setup-instructions">
                  <h3>🛠️ Setup Instructions</h3>
                  <div className="setup-step">
                    <div className="step-number">1</div>
                    <p>Extract the ZIP file into your project root directory</p>
                  </div>
                  <div className="setup-step">
                    <div className="step-number">2</div>
                    <p>
                      Open your project in your IDE. The agent should automatically detect
                      the configuration files.
                    </p>
                  </div>
                  <div className="setup-step">
                    <div className="step-number">3</div>
                    <p>
                      For Cursor: files go in <code>.cursor/rules/</code> — 
                      For Claude: <code>CLAUDE.md</code> in project root — 
                      For Windsurf: <code>.windsurf/rules/</code>
                    </p>
                  </div>
                  <div className="setup-step">
                    <div className="step-number">4</div>
                    <p>
                      Start a new chat session with your AI agent. It will automatically read
                      the config files and follow your project conventions!
                    </p>
                  </div>
                  <div className="setup-step">
                    <div className="step-number">5</div>
                    <p>
                      <strong>Pro tip:</strong> Commit these files to your repo so your whole
                      team benefits from consistent AI agent behavior.
                    </p>
                  </div>
                </div>

                <div className="wizard-nav">
                  <button className="btn btn-ghost" onClick={() => setStep(4)}>
                    ← Back to Review
                  </button>
                  <Link href="/community" className="btn btn-primary">
                    🌍 Explore Community Projects
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast success">
          ✅ {toast}
        </div>
      )}
    </>
  );
}

// ── Stack Config Field Component ──────────────────

function StackField({
  option,
  value,
  onChange,
}: {
  option: StackOption;
  value: string | boolean | undefined;
  onChange: (val: string | boolean) => void;
}) {
  if (option.fieldType === "toggle") {
    return (
      <div className="form-group">
        <label className="form-label">{option.fieldLabel}</label>
        <div className="form-toggle" onClick={() => onChange(!value)}>
          <div className={`toggle-switch ${value ? "active" : ""}`} />
          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            {value ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>
    );
  }

  if (option.fieldType === "text") {
    return (
      <div className="form-group">
        <label className="form-label">
          {option.fieldLabel}
          {option.isRequired && <span className="required">*</span>}
        </label>
        <input
          type="text"
          className="form-input"
          value={String(value || "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={String(option.defaultValue)}
        />
      </div>
    );
  }

  return (
    <div className="form-group">
      <label className="form-label">
        {option.fieldLabel}
        {option.isRequired && <span className="required">*</span>}
      </label>
      <select
        className="form-select"
        value={String(value || option.defaultValue)}
        onChange={(e) => onChange(e.target.value)}
      >
        {option.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
