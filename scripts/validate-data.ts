import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { z } from 'zod';

// Define the schema for project entries
const ProjectSchema = z.object({
  name: z.string().min(1).max(100),
  repo: z.string().min(1),
  homepage: z.string().url().optional(),
  description: z.string().min(10).max(140).refine(desc => desc.endsWith('.'), {
    message: "Description must end with a period"
  }),
  language: z.string().min(1),
  license: z.string().min(1),
  activity: z.enum(['active', 'inactive', 'archived']),
  tags: z.array(z.string()).optional()
});

type Project = z.infer<typeof ProjectSchema>;

const DATA_DIR = path.join(__dirname, '..', 'data');
const YAML_FILES = [
  'bot-templates.yml',
  'bots.yml',
  'dashboards.yml',
  'developer-tools.yml',
  'libraries.yml',
  'platforms.yml',
  'website-templates.yml'
];

function validateYamlFile(filename: string): Project[] {
  const filePath = path.join(DATA_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File ${filename} does not exist`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const data = yaml.parse(content);

  if (!Array.isArray(data)) {
    throw new Error(`${filename} must contain an array of projects`);
  }

  const validatedProjects: Project[] = [];
  const projectNames = new Set<string>();

  for (let i = 0; i < data.length; i++) {
    try {
      const project = ProjectSchema.parse(data[i]);
      
      // Check for duplicate names
      if (projectNames.has(project.name.toLowerCase())) {
        throw new Error(`Duplicate project name: ${project.name}`);
      }
      projectNames.add(project.name.toLowerCase());
      
      validatedProjects.push(project);
    } catch (error) {
      console.error(`Error validating project at index ${i} in ${filename}:`);
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
      } else {
        console.error(`  - ${(error as Error).message}`);
      }
      process.exit(1);
    }
  }

  return validatedProjects;
}

function main() {
  console.log('🔍 Validating YAML data files...\n');

  let totalProjects = 0;
  const allProjectNames = new Set<string>();

  for (const filename of YAML_FILES) {
    try {
      console.log(`📄 Validating ${filename}...`);
      const projects = validateYamlFile(filename);
      
      // Check for duplicate names across all files
      for (const project of projects) {
        if (allProjectNames.has(project.name.toLowerCase())) {
          console.error(`❌ Duplicate project name across files: ${project.name}`);
          process.exit(1);
        }
        allProjectNames.add(project.name.toLowerCase());
      }
      
      console.log(`   ✅ ${projects.length} projects validated`);
      totalProjects += projects.length;
    } catch (error) {
      console.error(`❌ Error validating ${filename}:`);
      console.error(`   ${(error as Error).message}`);
      process.exit(1);
    }
  }

  console.log(`\n🎉 All validation passed!`);
  console.log(`📊 Total projects: ${totalProjects}`);
  console.log(`📁 Files validated: ${YAML_FILES.length}`);
}

if (require.main === module) {
  main();
}

export { validateYamlFile, ProjectSchema, Project };
