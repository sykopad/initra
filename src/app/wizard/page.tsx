"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { generateAgentFiles } from "@/lib/engine";
import { PROJECT_TEMPLATES, PROJECT_CATEGORIES, WORKFLOW_OVERLAYS } from "@/lib/engine/templates";
import { IDE_TARGETS } from "@/lib/engine/ide-targets";
import { PACKAGE_LIBRARY, PACKAGE_CATEGORIES, getPackagesForTemplate } from "@/lib/engine/package-library";
import { SERVICE_LIBRARY, SERVICE_CATEGORIES, getRecommendedServices } from "@/lib/engine/service-library";
import { WizardConfig, GeneratedFile, IDETarget, ProjectTemplate, StackOption, ApiService } from "@/lib/engine/types";
import { saveWizardSession, updateWizardFile } from "@/lib/actions/wizard";
import Navbar from "@/components/Navbar";
import AgentEditor from "@/components/AgentEditor";
import DonationButton from "@/components/wizard/DonationButton";
import CodeViewer from "@/components/wizard/CodeViewer";
import { saveSharedConfig } from "@/lib/actions/shared";
import RepoSyncModal, { RepoSettings } from "@/components/wizard/RepoSyncModal";
import DeploymentCenter from "@/components/wizard/DeploymentCenter";



const STEPS = [
  { label: "Start",    number: 0 },
  { label: "Project",  number: 1 },
  { label: "Stack",    number: 2 },
  { label: "Packages", number: 3 },
  { label: "Services", number: 4 },
  { label: "IDE",      number: 5 },
  { label: "Review",   number: 6 },
  { label: "Export",   number: 7 },
];

export default function WizardPage() {
  const [step, setStep] = useState(0);
  const [wizardMode, setWizardMode] = useState<'manual' | 'ai'>('manual');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'experienced'>('experienced');
  const [aiGoal, setAiGoal] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [templateVersion, setTemplateVersion] = useState("");
  const [projectName, setProjectName] = useState("");
  const [stackConfig, setStackConfig] = useState<Record<string, string | boolean>>({});
  const [selectedIDEs, setSelectedIDEs] = useState<IDETarget[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [pkgSearch, setPkgSearch] = useState("");
  const [pkgCategory, setPkgCategory] = useState<string | null>(null);
  const [svcSearch, setSvcSearch] = useState("");
  const [svcCategory, setSvcCategory] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [includeBoilerplate, setIncludeBoilerplate] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isPushing, setIsPushing] = useState(false);
  const [importRepoUrl, setImportRepoUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [selectionMethod, setSelectionMethod] = useState<'browse' | 'import'>('browse');
  const [orchestrationMode, setOrchestrationMode] = useState<'single-agent' | 'multi-agent'>('single-agent');
  const [selectedOverlays, setSelectedOverlays] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [syncResult, setSyncResult] = useState<{ url: string; repoFullName: string } | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

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
    const defaultVersion = template.availableVersions[0]?.id || "";
    setTemplateVersion(defaultVersion);
    setStackConfig({ 
      ...template.defaultStack,
      version: defaultVersion 
    });
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

  // Toggle service selection
  const toggleService = useCallback((slug: string) => {
    setSelectedServices((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  // Packages filtered by template, category, and search
  const filteredPackages = useMemo(() => {
    if (!selectedTemplate) return [];
    
    let pkgs = PACKAGE_LIBRARY.filter(p => {
      // 1. Language check
      if (p.language !== selectedTemplate.language) return false;
      
      // 2. Explicit compatibility check
      const isExplicitlyCompatible = p.compatibleTemplates.includes(selectedTemplate.slug);
      const isExplicitlyExcluded = p.excludedTemplates?.includes(selectedTemplate.slug);
      
      return isExplicitlyCompatible && !isExplicitlyExcluded;
    });

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
    const pkgs = PACKAGE_LIBRARY.filter(p => 
      p.language === selectedTemplate.language && 
      p.compatibleTemplates.includes(selectedTemplate.slug)
    );
    const cats = new Set(pkgs.map((p) => p.category));
    return PACKAGE_CATEGORIES.filter((c) => cats.has(c.slug));
  }, [selectedTemplate]);

  // Services filtered by category and search
  const filteredServices = useMemo(() => {
    if (!selectedTemplate) return SERVICE_LIBRARY;

    let svcs = SERVICE_LIBRARY.filter(s => {
      if (!s.compatibility) return true;
      
      const { languages, frameworks, exclude } = s.compatibility;
      
      if (languages && !languages.includes(selectedTemplate.language)) return false;
      if (frameworks && !frameworks.includes(selectedTemplate.slug)) return false;
      if (exclude && exclude.includes(selectedTemplate.slug)) return false;
      
      return true;
    });

    if (svcCategory) svcs = svcs.filter((s) => s.category === svcCategory);
    if (svcSearch) {
      const q = svcSearch.toLowerCase();
      svcs = svcs.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.envVars.some(e => e.key.toLowerCase().includes(q))
      );
    }
    return svcs;
  }, [selectedTemplate, svcCategory, svcSearch]);

  // Transition from packages to services with auto-selection
  const handOffToServices = useCallback(() => {
    const recommended = getRecommendedServices(selectedPackages, stackConfig);
    setSelectedServices((prev) => {
      const next = new Set([...prev, ...recommended]);
      return Array.from(next);
    });
    setStep(4);
  }, [selectedPackages, stackConfig]);

  // AI Assistant Mapping
  const handleAiAnalysis = useCallback(async () => {
    if (!aiGoal) return;
    setIsAnalyzing(true);
    setAiExplanation(null);

    try {
      const response = await fetch("/api/analyze-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: aiGoal, experienceLevel }),
      });

      if (!response.ok) throw new Error("Failed to analyze goal");

      const data = await response.json();
      
      // Auto-populate the wizard
      const template = PROJECT_TEMPLATES.find(t => t.slug === data.templateSlug);
      if (template) {
        setSelectedTemplate(template);
        setProjectName(data.projectName || "");
        setStackConfig(data.stackConfig || {});
        setSelectedPackages(data.selectedPackages || []);
        setSelectedServices(data.selectedServices || []);
        setAiExplanation(data.explanation);
        
        // Skip straight to Review if AI was thorough
        setStep(6);
      } else {
        setToast("AI suggested a template that doesn't exist yet.");
      }
    } catch (err) {
      console.error(err);
      setToast("AI analysis failed. Falling back to manual mode.");
      setWizardMode('manual');
      setStep(1);
    } finally {
      setIsAnalyzing(false);
    }
  }, [aiGoal, experienceLevel]);

  // Generate files
  const handleGenerate = useCallback(() => {
    if (!selectedTemplate || selectedIDEs.length === 0) return;

    const config: WizardConfig = {
      templateSlug: selectedTemplate.slug,
      templateVersion: String(stackConfig.version || templateVersion),
      projectName: projectName || "My Project",
      stackConfig,
      selectedIDEs,
      selectedPackages,
      selectedServices,
      includeBoilerplate,
      experienceLevel,
      orchestrationMode,
      selectedOverlays,
    };

    const result = generateAgentFiles(config);
    setGeneratedFiles(result.files);
    setActiveFileIndex(0);
    setStep(7);

    // Persist session in background and store ID for potential edits
    saveWizardSession(config, result.files).then(session => {
      setSessionId(session.id);
    }).catch(err => {
      console.warn("Failed to persist wizard session:", err);
    });
  }, [selectedTemplate, projectName, stackConfig, selectedIDEs, selectedPackages, selectedServices, templateVersion]);

  // Handle saving from the editor
  const handleEditorSave = useCallback(async (newContent: string) => {
    const file = generatedFiles[activeFileIndex];
    if (!file) return;

    // Update local state
    const newFiles = [...generatedFiles];
    newFiles[activeFileIndex] = { ...file, content: newContent };
    setGeneratedFiles(newFiles);

    // Persist to DB if we have a session
    if (sessionId) {
      try {
        await updateWizardFile(sessionId, file.filename, newContent);
        setToast("Changes saved!");
        setTimeout(() => setToast(null), 2500);
      } catch (err) {
        console.error("Failed to update file in DB:", err);
        setToast("Failed to save changes to cloud.");
        setTimeout(() => setToast(null), 2500);
      }
    }

    setIsEditing(false);
  }, [generatedFiles, activeFileIndex, sessionId]);

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

  // Push to GitHub
  const handlePushToGitHub = useCallback(async (settings: RepoSettings) => {
    if (!projectName || generatedFiles.length === 0) return;
    setIsPushing(true);
    setToast("Creating GitHub repository...");

    try {
      const response = await fetch("/api/github/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoName: settings.name,
          isPrivate: settings.isPrivate,
          description: settings.description,
          files: generatedFiles
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to push to GitHub");

      setSyncResult({ url: data.url, repoFullName: data.repoFullName });
      setShowRepoModal(false);
      setToast("🚀 Project pushed successfully!");
      
      // Auto-save the session state if needed
    } catch (err: any) {
      console.error(err);
      setToast(`❌ Error: ${err.message}`);
    } finally {
      setIsPushing(false);
    }
  }, [projectName, generatedFiles]);

  // Handle GitHub Import
  const handleRepoImport = useCallback(async () => {
    if (!importRepoUrl) return;
    setIsImporting(true);
    setToast("🔍 Scanning repository...");

    try {
      const response = await fetch("/api/github/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: importRepoUrl }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to import repo");

      const { config } = data;
      const template = PROJECT_TEMPLATES.find(t => t.slug === config.templateSlug);
      
      if (template) {
        setSelectedTemplate(template);
        setProjectName(config.projectName || "");
        setStackConfig(config.stackConfig || {});
        setSelectedPackages(config.selectedPackages || []);
        
        // Ensure template version is set
        const version = config.templateVersion || template.availableVersions[0]?.id || "";
        setTemplateVersion(version);

        // Pre-populate recommended services based on detected packages
        const recommendedServices = getRecommendedServices(config.selectedPackages || [], config.stackConfig || {});
        setSelectedServices(recommendedServices);

        // Pre-populate a default IDE (Universal) to enable generation and fix the empty "Back" state
        const universalIDE = IDE_TARGETS.find(i => i.slug === 'universal');
        const selectedIDEs = config.selectedIDEs || (universalIDE ? [universalIDE] : []);
        setSelectedIDEs(selectedIDEs);
        
        setToast("✅ Repository detected! Reviewing configuration...");
        setTimeout(() => setStep(6), 1500);
      }
    } catch (err: any) {
      console.error(err);
      setToast(`❌ Error: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  }, [importRepoUrl]);

  // Handle Share Config
  const handleShareConfig = useCallback(async () => {
    if (!user) {
      setToast("🔒 Please login to share configurations");
      return;
    }
    
    setIsSharing(true);
    setToast("🔗 Generating share link...");

    try {
      const configToShare = {
        templateSlug: selectedTemplate?.slug,
        templateVersion: selectedTemplate?.availableVersions[0]?.id,
        stackConfig,
        selectedPackages,
        selectedServices,
      };

      const result = await saveSharedConfig(
        projectName || "My Project",
        selectedTemplate?.slug || "unknown",
        configToShare,
        user.id
      );

      const url = `${window.location.origin}/shared/${result.slug}`;
      setShareUrl(url);
      copyToClipboard(url);
      setToast("✅ Link copied to clipboard!");
    } catch (err: any) {
      console.error(err);
      setToast(`❌ Error: ${err.message}`);
    } finally {
      setIsSharing(false);
    }
  }, [user, projectName, selectedTemplate, stackConfig, selectedPackages, selectedServices]);

  // Get core and advanced stack options
  const coreOptions = selectedTemplate?.stackOptions?.filter((o) => o.section === "core") || [];
  const advancedOptions = selectedTemplate?.stackOptions?.filter((o) => o.section === "advanced") || [];

  // Helper to determine language for syntax highlighting
  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'md') return 'markdown';
    if (ext === 'json') return 'json';
    if (ext === 'ts' || ext === 'tsx') return 'typescript';
    if (ext === 'js' || ext === 'jsx') return 'javascript';
    if (ext === 'py') return 'python';
    if (ext === 'go') return 'go';
    if (ext === 'css') return 'css';
    if (ext === 'html') return 'html';
    if (filename.startsWith('.env')) return 'bash';
    return 'markdown'; // Default
  };

  return (
    <>
      <Navbar />

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
            {/* ── Step 0: Initial Setup ────────────────── */}
            {step === 0 && (
              <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
                <h2 className="wizard-step-title">How would you like to build?</h2>
                <p className="wizard-step-subtitle" style={{ marginBottom: "2rem" }}>
                  Select your path and experience level to customize your journey.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "3rem" }}>
                  <div 
                    className={`project-type-card ${wizardMode === 'manual' ? 'selected' : ''}`}
                    onClick={() => setWizardMode('manual')}
                    style={{ padding: "2rem" }}
                  >
                    <span style={{ fontSize: "2.5rem", marginBottom: "1rem", display: "block" }}>🛠️</span>
                    <h3>Manual Selection</h3>
                    <p style={{ fontSize: "0.85rem" }}>Hand-pick your framework, database, and packages.</p>
                  </div>
                  <div 
                    className={`project-type-card ${wizardMode === 'ai' ? 'selected' : ''}`}
                    onClick={() => setWizardMode('ai')}
                    style={{ padding: "2rem" }}
                  >
                    <span style={{ fontSize: "2.5rem", marginBottom: "1rem", display: "block" }}>✨</span>
                    <h3>AI Assistant</h3>
                    <p style={{ fontSize: "0.85rem" }}>Describe your goal and let AI suggest the perfect architecture.</p>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: "2rem", textAlign: "left" }}>
                  <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Your Experience Level</h3>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button 
                      className={`btn ${experienceLevel === 'experienced' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setExperienceLevel('experienced')}
                      style={{ flex: 1 }}
                    >
                      Experienced Developer
                    </button>
                    <button 
                      className={`btn ${experienceLevel === 'beginner' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setExperienceLevel('beginner')}
                      style={{ flex: 1 }}
                    >
                      Business / New Dev
                    </button>
                  </div>
                  <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {experienceLevel === 'beginner' 
                      ? "✨ We'll provide extra guidance on setting up infrastructure like Vercel and Supabase for free." 
                      : "💻 We'll focus on architecture, patterns, and agent orchestration."}
                  </p>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ marginTop: "2rem", width: "100%", padding: "1rem" }}
                  onClick={() => setStep(1)}
                >
                  Continue →
                </button>
              </div>
            )}

            {/* ── Step 1: Manual or AI Project Path ──────── */}
            {step === 1 && (
              wizardMode === 'ai' ? (
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                  <h2 className="wizard-step-title">What are you building?</h2>
                  <p className="wizard-step-subtitle">Describe your project goal in a few sentences</p>
                  
                  <textarea
                    className="form-input"
                    style={{ minHeight: "150px", marginTop: "2rem", resize: "vertical" }}
                    placeholder="Example: I want to build a fitness app for personal trainers that handles subscriptions, workout tracking, and has a dashboard for clients."
                    value={aiGoal}
                    onChange={(e) => setAiGoal(e.target.value)}
                  />

                  <div style={{ marginTop: "2rem" }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ width: "100%", padding: "1.2rem", fontSize: "1.1rem" }}
                      onClick={handleAiAnalysis}
                      disabled={!aiGoal || isAnalyzing}
                    >
                      {isAnalyzing ? "🪄 Analyzing Architectures..." : "Initialize with AI Assistant →"}
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ width: "100%", marginTop: "1rem" }}
                      onClick={() => {
                        setWizardMode('manual');
                      }}
                    >
                      Switch to Manual Mode
                    </button>
                  </div>
                </div>
              ) : (
                 <>
                  <h2 className="wizard-step-title">Start Your Project</h2>
                <p className="wizard-step-subtitle">Select a framework manually or import from an existing repository.</p>

                <div className="filter-tabs" style={{ justifyContent: "center", marginBottom: "2rem" }}>
                   <button 
                    className={`filter-tab ${selectionMethod === 'browse' ? 'active' : ''}`}
                    onClick={() => setSelectionMethod('browse')}
                   >
                     📂 Browse Templates
                   </button>
                   <button 
                    className={`filter-tab ${selectionMethod === 'import' ? 'active' : ''}`}
                    onClick={() => setSelectionMethod('import')}
                   >
                     🔗 Import from GitHub
                   </button>
                </div>

                {selectionMethod === 'import' ? (
                  <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '2.5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🐙</span>
                      <h3>Connect Repository</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Paste a GitHub URL to detect its framework and generate agent rules automatically.
                      </p>
                    </div>
                    
                    <div className="form-group">
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="https://github.com/user/repo"
                        value={importRepoUrl}
                        onChange={(e) => setImportRepoUrl(e.target.value)}
                        style={{ textAlign: 'center', fontSize: '1.1rem' }}
                      />
                    </div>

                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}
                      onClick={handleRepoImport}
                      disabled={isImporting || !importRepoUrl}
                    >
                      {isImporting ? "🔍 Analyzing..." : "Detect Stack & Generate →"}
                    </button>
                  </div>
                ) : (
                  <>
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
          </>
        )
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
                  <button className="btn btn-ghost" onClick={handOffToServices}>
                    Skip →
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handOffToServices}
                  >
                    {selectedPackages.length > 0
                      ? `Continue with ${selectedPackages.length} package${selectedPackages.length > 1 ? "s" : ""} →`
                      : "Choose Services →"}
                  </button>
                </div>
              </>
            )}

            {/* ── Step 4: APIs & Services ────────────────── */}
            {step === 4 && (
              <>
                <h2 className="wizard-step-title">APIs &amp; External Services</h2>
                <p className="wizard-step-subtitle">
                  We&apos;ll prepare your <code>.env.example</code> with the right keys and registration links.
                </p>

                {/* Selected service tags */}
                {selectedServices.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem", justifyContent: "center" }}>
                    {selectedServices.map((slug) => {
                      const svc = SERVICE_LIBRARY.find((s) => s.slug === slug);
                      if (!svc) return null;
                      return (
                        <span
                          key={slug}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            background: "rgba(16,185,129,0.1)",
                            border: "1px solid var(--success)",
                            borderRadius: "999px",
                            padding: "0.25rem 0.75rem",
                            fontSize: "var(--text-sm)",
                            color: "var(--success)",
                          }}
                        >
                          {svc.icon} {svc.name}
                          <button
                            onClick={() => toggleService(slug)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", lineHeight: 1, fontSize: "1rem" }}
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
                    className={`filter-tab ${!svcCategory ? "active" : ""}`}
                    onClick={() => setSvcCategory(null)}
                  >
                    All
                  </button>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      className={`filter-tab ${svcCategory === cat.slug ? "active" : ""}`}
                      onClick={() => setSvcCategory(cat.slug)}
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
                    placeholder="Search services or env vars (e.g. STRIPE_...)"
                    value={svcSearch}
                    onChange={(e) => setSvcSearch(e.target.value)}
                  />
                </div>

                {/* Service grid */}
                <div className="project-type-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                  {filteredServices.map((svc) => {
                    const isSelected = selectedServices.includes(svc.slug);
                    const isRecommended = getRecommendedServices(selectedPackages, stackConfig).includes(svc.slug);
                    
                    return (
                      <div
                        key={svc.slug}
                        className={`project-type-card ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleService(svc.slug)}
                        style={{ textAlign: "left", gap: "0.5rem", position: "relative" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                          <span style={{ fontSize: "1.5rem" }}>{svc.icon}</span>
                          <span style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>{svc.name}</span>
                          {isRecommended && (
                            <span style={{ fontSize: "0.6rem", background: "var(--primary)", color: "white", padding: "1px 4px", borderRadius: "3px" }}>RECOMMENDED</span>
                          )}
                        </div>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                          {svc.description}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginTop: "0.5rem" }}>
                          {svc.envVars.slice(0, 2).map(e => (
                             <code key={e.key} style={{ fontSize: "0.55rem", opacity: 0.7 }}>{e.key}</code>
                          ))}
                          {svc.envVars.length > 2 && <span style={{ fontSize: "0.55rem", opacity: 0.5 }}>+{svc.envVars.length - 2} more</span>}
                        </div>
                        {isSelected && (
                          <div className="checkmark" style={{ background: "var(--success)" }}>✓</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="wizard-nav">
                  <button className="btn btn-ghost" onClick={() => setStep(3)}>
                    ← Back
                  </button>
                  <button className="btn btn-primary" onClick={() => setStep(5)}>
                    Continue to IDE Selection →
                  </button>
                </div>
              </>
            )}

            {/* ── Step 5: Select IDE & Agent ───────────── */}
            {step === 5 && (
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

                {/* Project Boilerplate Toggle */}
                <div style={{ marginTop: "2rem", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                    <div>
                      <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        📦 Project Boilerplate
                      </h3>
                      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", margin: 0 }}>
                        Include core project files (package.json, src/, etc.) alongside agent rules.
                      </p>
                    </div>
                    <label style={{ position: "relative", display: "inline-block", width: "50px", height: "26px", cursor: "pointer" }}>
                      <input 
                        type="checkbox" 
                        checked={includeBoilerplate} 
                        onChange={(e) => setIncludeBoilerplate(e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: includeBoilerplate ? "var(--primary)" : "#ccc",
                        transition: ".4s",
                        borderRadius: "34px"
                      }}>
                        <span style={{
                          position: "absolute",
                          content: '""',
                          height: "18px", width: "18px",
                          left: includeBoilerplate ? "28px" : "4px",
                          bottom: "4px",
                          backgroundColor: "white",
                          transition: ".4s",
                          borderRadius: "50%"
                        }}></span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Advanced Agentic Features */}
                <div style={{ marginTop: "2rem" }}>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    🧠 Advanced Agentic Features
                  </h3>
                  
                  <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {/* Orchestration Mode */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem" }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>Orchestration Mode</h4>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                          {orchestrationMode === 'multi-agent' 
                            ? "Hierarchical rules (Architect, Frontend, Backend) for better focus." 
                            : "Single monolithic rule file for simpler projects."}
                        </p>
                      </div>
                      <div style={{ display: "flex", background: "var(--bg-glass)", borderRadius: "8px", padding: "4px" }}>
                        <button 
                          className={`btn btn-sm ${orchestrationMode === 'single-agent' ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => setOrchestrationMode('single-agent')}
                        >
                          Single
                        </button>
                        <button 
                          className={`btn btn-sm ${orchestrationMode === 'multi-agent' ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => setOrchestrationMode('multi-agent')}
                        >
                          Multi
                        </button>
                      </div>
                    </div>

                    <div style={{ height: "1px", background: "rgba(255,255,255,0.1)" }} />

                    {/* Workflow Overlays */}
                    <div>
                      <h4 style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>Applied Workflows</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        {WORKFLOW_OVERLAYS.map(overlay => {
                          const isSelected = selectedOverlays.includes(overlay.slug);
                          return (
                            <div 
                              key={overlay.slug}
                              className={`project-type-card ${isSelected ? "selected" : ""}`}
                              onClick={() => setSelectedOverlays(prev => 
                                isSelected ? prev.filter(s => s !== overlay.slug) : [...prev, overlay.slug]
                              )}
                              style={{ padding: "1rem", textAlign: "left", cursor: "pointer" }}
                            >
                              <div style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>{overlay.icon}</div>
                              <h5 style={{ fontSize: "0.85rem", margin: "0 0 0.25rem" }}>{overlay.name}</h5>
                              <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", margin: 0 }}>{overlay.description}</p>
                              {isSelected && <div className="checkmark" style={{ background: "var(--primary)", bottom: "10px", right: "10px" }}>✓</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="wizard-nav">
                  <button className="btn btn-ghost" onClick={() => setStep(4)}>
                    ← Back
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setStep(6)}
                    disabled={selectedIDEs.length === 0}
                    style={{ opacity: selectedIDEs.length === 0 ? 0.5 : 1 }}
                  >
                    Next: Review Blueprint →
                  </button>
                </div>
              </>
            )}

            {/* ── Step 6: Review Configuration ─────────── */}
            {step === 6 && selectedTemplate && (
              <>
                <h2 className="wizard-step-title">Review your architecture</h2>
                <p className="wizard-step-subtitle">Final check before we generate your agent files.</p>

                {aiExplanation && (
                  <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem", borderLeft: "4px solid var(--primary)" }}>
                    <h4 style={{ fontSize: "0.9rem", color: "var(--primary-light)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      AI Architect Note
                    </h4>
                    <p style={{ fontSize: "0.95rem", fontStyle: "italic", color: "var(--text-primary)" }}>
                      &quot;{aiExplanation}&quot;
                    </p>
                  </div>
                )}

                <div className="glass-panel" style={{ padding: "2.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", border: "1px solid var(--border-medium)" }}>
                  <div style={{ borderRight: "1px solid var(--border-subtle)", paddingRight: "2rem" }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "1.5rem", color: "var(--accent-violet-light)" }}>Core Stack</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                      <div className="review-item" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
                        <span className="label" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Template:</span>
                        <span className="value" style={{ fontWeight: 600 }}>{selectedTemplate.name}</span>
                      </div>
                      <div className="review-item" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
                        <span className="label" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Project:</span>
                        <span className="value" style={{ fontWeight: 600 }}>{projectName || "My Project"}</span>
                      </div>
                      {Object.entries(stackConfig).map(([key, val]) => (
                        <div key={key} className="review-item" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
                          <span className="label" style={{ color: "var(--text-muted)", fontSize: "0.9rem", textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="value" style={{ fontWeight: 600 }}>{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "1.5rem", color: "var(--accent-cyan-light)" }}>Add-ons & Agent Modes</h3>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Packages</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {selectedPackages.map(p => (
                          <span key={p} className="badge-outline" style={{ background: "var(--bg-glass)", borderColor: "var(--border-medium)", padding: "0.25rem 0.75rem", borderRadius: "99px", fontSize: "0.75rem" }}>{p}</span>
                        ))}
                        {selectedPackages.length === 0 && <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>None selected</span>}
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Services</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {selectedServices.map(s => (
                          <span key={s} className="badge-outline" style={{ background: "var(--bg-glass)", borderColor: "var(--border-medium)", padding: "0.25rem 0.75rem", borderRadius: "99px", fontSize: "0.75rem" }}>{s}</span>
                        ))}
                        {selectedServices.length === 0 && <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>None selected</span>}
                      </div>
                    </div>

                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Architect Modes</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        <span className="badge-outline" style={{ borderColor: 'var(--accent-violet)', background: "rgba(124, 58, 237, 0.1)", padding: "0.25rem 0.75rem", borderRadius: "99px", fontSize: "0.75rem", color: "var(--accent-violet-light)" }}>
                          {orchestrationMode === 'multi-agent' ? '🚀 Hierarchical Multi-Agent' : '📄 Single Agent'}
                        </span>
                        {selectedOverlays.map(slug => (
                          <span key={slug} className="badge-outline" style={{ borderColor: 'var(--accent-emerald)', background: "rgba(16, 185, 129, 0.1)", padding: "0.25rem 0.75rem", borderRadius: "99px", fontSize: "0.75rem", color: "var(--accent-emerald-light)" }}>
                            {WORKFLOW_OVERLAYS.find(o => o.slug === slug)?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="wizard-nav">
                  <button className="btn btn-ghost" onClick={() => setStep(5)}>
                    ← Back
                  </button>
                  <button className="btn btn-primary" onClick={handleGenerate}>
                    🔮 Generate Agent Files →
                  </button>
                </div>
              </>
            )}

            {/* ── Step 7: Export & Results ──────────────── */}
            {step === 7 && generatedFiles.length > 0 && (
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
                          {file.filename === '.env.example' ? '🔑' : '📄'} {file.filename}
                        </button>
                      ))}
                    </div>
                    <div className="code-preview-wrapper" style={{ minHeight: '400px' }}>
                      <CodeViewer 
                        code={generatedFiles[activeFileIndex]?.content || ""} 
                        language={getLanguage(generatedFiles[activeFileIndex]?.filename || "")} 
                        filename={generatedFiles[activeFileIndex]?.filePath}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => copyToClipboard(generatedFiles[activeFileIndex]?.content || "")}
                      >
                        📋 Copy
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsEditing(true)}
                      >
                        ✍️ Edit Rules
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
                      <div className="review-item">
                        <span className="label">Stack</span>
                        <span className="value">{Object.keys(stackConfig).length} choices</span>
                      </div>
                      <div className="review-item">
                        <span className="label">Packages</span>
                        <span className="value">{selectedPackages.length} selected</span>
                      </div>
                      <div className="review-item">
                        <span className="label">Services</span>
                        <span className="value" style={{ color: "var(--success)" }}>{selectedServices.length} selected</span>
                      </div>
                      <div className="review-item">
                        <span className="label">Files</span>
                        <span className="value">{generatedFiles.length} generated</span>
                      </div>

                      {selectedServices.length > 0 && (
                        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                           <h4 style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Env Vars Required</h4>
                           <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              {selectedServices.flatMap(s => 
                                SERVICE_LIBRARY.find(sl => sl.slug === s)?.envVars.map(e => (
                                   <code key={e.key} style={{ fontSize: "0.6rem", background: "var(--bg-glass)", padding: "2px 4px", borderRadius: "3px" }}>{e.key}</code>
                                )) || []
                              )}
                           </div>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                      <DonationButton />
                    </div>
                  </div>
                </div>

                <div className="wizard-nav">
                  <button className="btn btn-ghost" onClick={() => setStep(5)}>
                    ← Back
                  </button>
                  <button className="btn btn-primary" onClick={() => setStep(7)}>
                    📦 Export Files →
                  </button>
                </div>
              </>
            )}

            {/* ── Step 7: Export & Setup ─────────────── */}
            {step === 7 && (
              <>
                <h2 className="wizard-step-title">Export Your Files</h2>
                <p className="wizard-step-subtitle">
                  Download your agent configuration and <code>.env.example</code> setup.
                </p>

                <div style={{ marginTop: "2rem" }}>
                  <DeploymentCenter 
                    projectName={projectName}
                    generatedFiles={generatedFiles}
                    onOpenGitHubSync={() => setShowRepoModal(true)}
                    syncResult={syncResult}
                    isPushing={isPushing}
                  />
                </div>

                <div className="download-grid" style={{ marginTop: "2rem" }}>
                  <div className="card download-option" onClick={downloadZip}>
                    <span className="download-icon">📁</span>
                    <h3>Download ZIP</h3>
                    <p>All files in the correct directory structure, including <code>.env.example</code>.</p>
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
                  <div
                    className={`card download-option ${isSharing ? "loading" : ""}`}
                    onClick={!isSharing ? handleShareConfig : undefined}
                    style={shareUrl ? { borderColor: 'var(--accent-purple)', background: 'rgba(255,100,255,0.05)' } : {}}
                  >
                    <span className="download-icon">🔗</span>
                    <h3>{shareUrl ? "✅ Link Copied" : "Share Config"}</h3>
                    <p>
                      {isSharing ? "Generating..." : shareUrl ? `Shared at ${shareUrl}` : "Generate a permalink to share your configuration with the community."}
                    </p>
                  </div>
                </div>

                <RepoSyncModal 
                  isOpen={showRepoModal}
                  onClose={() => setShowRepoModal(false)}
                  onConfirm={handlePushToGitHub}
                  initialName={projectName}
                  isPushing={isPushing}
                />

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

                {/* Support Initra (Donation) */}
                <div style={{ maxWidth: '600px', margin: '3rem auto 0' }}>
                  <DonationButton 
                    userId={user?.id}
                    onSuccess={(amount) => {
                      setToast(`Support detected! $${amount} added to your contribution.`);
                    }} 
                  />
                </div>

                <div className="wizard-nav">
                  <button className="btn btn-ghost" onClick={() => setStep(6)}>
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

      {isEditing && generatedFiles[activeFileIndex] && (
        <AgentEditor
          initialContent={generatedFiles[activeFileIndex].content}
          onSave={handleEditorSave}
          onClose={() => setIsEditing(false)}
        />
      )}

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
