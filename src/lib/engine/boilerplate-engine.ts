import { WizardConfig, BoilerplateFile, GeneratedFile, IDETarget, TemplateVariables } from './types';
import { getTemplate } from './templates';
import { getPackageDefinition } from './package-library';
import { getServiceDefinition } from './service-library';
import { extractVariables, compose } from './prompt-composer';

/**
 * Boilerplate Engine
 * Generates the full project file structure based on user selections.
 */
export function generateProjectBoilerplate(config: WizardConfig): GeneratedFile[] {
  if (config.includeBoilerplate === false) return [];

  const files: BoilerplateFile[] = [];

  // 1. Collect from template
  const template = getTemplate(config.templateSlug);
  if (template?.boilerplateFiles) {
    files.push(...template.boilerplateFiles);
  }

  // 2. Collect from selected packages
  for (const pkgSlug of config.selectedPackages) {
    const pkg = getPackageDefinition(pkgSlug);
    if (pkg?.boilerplateFiles) {
      files.push(...pkg.boilerplateFiles);
    }
  }

  // 3. Collect from selected services
  for (const svcSlug of config.selectedServices) {
    const svc = getServiceDefinition(svcSlug);
    if (svc?.boilerplateFiles) {
      files.push(...svc.boilerplateFiles);
    }
  }

  // 4. Filter by condition
  const filteredFiles = files.filter(file => {
    if (file.targetTemplate && file.targetTemplate !== config.templateSlug) return false;
    if (!file.condition) return true;
    const { field, value } = file.condition;
    return config.stackConfig[field] === value;
  });

  // 5. Merge logic
  return resolveFileConflicts(filteredFiles, config);
}

/**
 * Resolves conflicts when multiple sources provide the same file path.
 * Special logic for package.json merging and marker injection.
 */
function resolveFileConflicts(files: BoilerplateFile[], config: WizardConfig): GeneratedFile[] {
  const fileMap: Record<string, GeneratedFile> = {};
  const packageJsons: BoilerplateFile[] = [];

  for (const file of files) {
    if (file.mergeType === 'package-json') {
      packageJsons.push(file);
      continue;
    }

    if (fileMap[file.path]) {
      // Conflict resolution
      if (file.mergeType === 'append') {
        fileMap[file.path].content += '\n' + file.content;
      } else if (file.mergeType === 'prepend') {
        fileMap[file.path].content = file.content + '\n' + fileMap[file.path].content;
      } else if (file.mergeType === 'inject' && file.injectMarker) {
        const marker = file.injectMarker;
        fileMap[file.path].content = fileMap[file.path].content.replace(
          marker,
          `${file.content}\n${marker}`
        );
      } else {
        // Default: overwrite (last one wins)
        fileMap[file.path] = {
          ideTarget: 'universal',
          filename: file.path.split('/').pop() || '',
          filePath: file.path,
          content: file.content
        };
      }
    } else {
      fileMap[file.path] = {
        ideTarget: 'universal',
        filename: file.path.split('/').pop() || '',
        filePath: file.path,
        content: file.content
      };
    }
  }

  // Process package.json last
  if (packageJsons.length > 0) {
    fileMap['package.json'] = mergePackageJsons(packageJsons, config);
  }

  // Perform interpolation on all files using the shared composer
  const variables = extractVariables(
    config.templateSlug,
    config.templateVersion,
    config.projectName,
    config.stackConfig,
    config.selectedPackages ?? [],
    config.selectedServices ?? [],
    config.experienceLevel ?? 'experienced',
    config.orchestrationMode ?? 'single-agent',
    config.selectedBrains ?? [],
    config.selectedWorkflows ?? [],
    config.designPreset
  );

  // Add projectSlug manually if not in TemplateVariables
  const varsWithSlug = {
    ...variables,
    projectSlug: config.projectName.toLowerCase().replace(/\s+/g, '-')
  } as any;

  return Object.values(fileMap).map(file => ({
    ...file,
    filePath: interpolateSimple(file.filePath, varsWithSlug),
    filename: interpolateSimple(file.filename, varsWithSlug),
    content: compose(file.content, varsWithSlug)
  }));
}

/**
 * Merges multiple package.json fragments into a single generated file.
 */
function mergePackageJsons(fragments: BoilerplateFile[], config: WizardConfig): GeneratedFile {
  const merged: any = {
    name: config.projectName.toLowerCase().replace(/\s+/g, '-'),
    version: '0.1.0',
    private: true,
    scripts: {},
    dependencies: {},
    devDependencies: {},
  };

  for (const fragment of fragments) {
    try {
      const data = JSON.parse(fragment.content);
      Object.assign(merged.scripts, data.scripts || {});
      Object.assign(merged.dependencies, data.dependencies || {});
      Object.assign(merged.devDependencies, data.devDependencies || {});
      
      // Merge other fields if needed
      for (const key in data) {
        if (!['scripts', 'dependencies', 'devDependencies'].includes(key)) {
          merged[key] = data[key];
        }
      }
    } catch (e) {
      console.warn("Failed to parse package.json fragment:", fragment.content);
    }
  }

  return {
    ideTarget: 'universal',
    filename: 'package.json',
    filePath: 'package.json',
    content: JSON.stringify(merged, null, 2)
  };
}

/**
 * Simple string interpolation for non-logic fields (paths)
 */
export function interpolateSimple(content: string, variables: Record<string, any>): string {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    if (typeof value === 'string' || typeof value === 'number') {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }
  }
  return result;
}
