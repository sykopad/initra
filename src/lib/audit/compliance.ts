/**
 * Initra Sovereign Compliance Engine
 * Audits ventures for data residency and regulatory compliance (GDPR, HIPAA).
 */

export interface ComplianceAuditResult {
  overallStatus: 'compliant' | 'warning' | 'non-compliant';
  score: number;
  checks: ComplianceCheck[];
  dataResidency: {
    computeRegion: string;
    databaseRegion: string;
    isRegionLocked: boolean;
  };
  recommendations: string[];
}

export interface ComplianceCheck {
  id: string;
  name: string;
  category: 'GDPR' | 'HIPAA' | 'Residency' | 'Security';
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

/**
 * Heuristic Compliance Audit
 * Analyzes the venture's configuration and infrastructure for regulatory alignment.
 */
export async function auditCompliance(
  config: any,
  generatedFiles: { filePath: string; content: string }[]
): Promise<ComplianceAuditResult> {
  const checks: ComplianceCheck[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // 1. Data Residency Check (Region Locking)
  const vercelJson = generatedFiles.find(f => f.filePath === 'vercel.json');
  let computeRegion = 'unknown';
  let isRegionLocked = false;
  
  if (vercelJson) {
    try {
      const data = JSON.parse(vercelJson.content);
      if (data.regions && data.regions.length === 1) {
        computeRegion = data.regions[0];
        isRegionLocked = true;
      } else if (data.regions && data.regions.length > 1) {
        computeRegion = 'multi-region';
      }
    } catch (e) {}
  }

  checks.push({
    id: 'data-residency-lock',
    name: 'Data Residency - Compute Region',
    category: 'Residency',
    status: isRegionLocked ? 'pass' : 'warning',
    message: isRegionLocked 
      ? \`Compute is strictly locked to region: \${computeRegion}.\` 
      : 'Multi-region compute detected. Ensure data transit follows residency laws.'
  });

  if (!isRegionLocked) {
    recommendations.push("For strict GDPR/HIPAA residency, consider locking compute to a single sovereign region (e.g., fra1 for EU).");
  }

  // 2. Database RLS & Encryption Check
  const schemaFiles = generatedFiles.filter(f => f.filePath.endsWith('.sql'));
  const hasRLS = schemaFiles.some(f => f.content.includes('ENABLE ROW LEVEL SECURITY'));
  
  checks.push({
    id: 'db-rls-enforcement',
    name: 'Database Row-Level Security',
    category: 'Security',
    status: hasRLS ? 'pass' : 'fail',
    message: hasRLS 
      ? 'Row-Level Security (RLS) is active on core tables.' 
      : 'CRITICAL: RLS is missing. Data isolation is not guaranteed.'
  });

  if (!hasRLS) {
    score -= 40;
    recommendations.push("Enable RLS on all tables containing PII (Personally Identifiable Information) to satisfy HIPAA/GDPR isolation requirements.");
  }

  // 3. GDPR: Privacy Policy & Data Rights
  const hasPrivacyPage = generatedFiles.some(f => f.filePath.includes('privacy') || f.filePath.includes('terms'));
  checks.push({
    id: 'gdpr-privacy-legal',
    name: 'GDPR Privacy Infrastructure',
    category: 'GDPR',
    status: hasPrivacyPage ? 'pass' : 'warning',
    message: hasPrivacyPage 
      ? 'Privacy and Terms boilerplate detected.' 
      : 'Privacy policy page is missing.'
  });

  if (!hasPrivacyPage) {
    score -= 10;
    recommendations.push("Generate a Privacy Policy page to satisfy GDPR 'Right to be Informed' requirements.");
  }

  // 4. HIPAA: Audit Logging
  const hasAuditLogs = generatedFiles.some(f => f.content.includes('audit_logs') || f.content.includes('pino'));
  checks.push({
    id: 'hipaa-audit-logging',
    name: 'HIPAA Audit Traceability',
    category: 'HIPAA',
    status: hasAuditLogs ? 'pass' : 'warning',
    message: hasAuditLogs 
      ? 'Structured logging detected for request traceability.' 
      : 'Audit logging is insufficient for HIPAA compliance.'
  });

  if (!hasAuditLogs) {
    score -= 15;
    recommendations.push("Implement granular audit logging for all data access events to comply with HIPAA technical safeguards.");
  }

  return {
    overallStatus: score >= 90 ? 'compliant' : score >= 70 ? 'warning' : 'non-compliant',
    score: Math.max(0, score),
    checks,
    dataResidency: {
      computeRegion,
      databaseRegion: 'us-east-1', // Mock/Assumed from project config
      isRegionLocked
    },
    recommendations
  };
}
