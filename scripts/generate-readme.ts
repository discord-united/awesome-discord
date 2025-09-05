import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { Project } from './validate-data';

const DATA_DIR = path.join(__dirname, '..', 'data');
const README_PATH = path.join(__dirname, '..', 'README.md');

interface Section {
  title: string;
  filename: string;
  description: string;
}

const SECTIONS: Section[] = [
  {
    title: 'Bot Templates',
    filename: 'bot-templates.yml',
    description: 'Ready-to-use bot starter templates'
  },
  {
    title: 'Bots',
    filename: 'bots.yml',
    description: 'Complete Discord bots (open-source)'
  },
  {
    title: 'Dashboards',
    filename: 'dashboards.yml',
    description: 'Web interfaces for bot management'
  },
  {
    title: 'Developer Tools',
    filename: 'developer-tools.yml',
    description: 'Utilities for Discord development'
  },
  {
    title: 'Libraries',
    filename: 'libraries.yml',
    description: 'APIs and SDKs for Discord development'
  },
  {
    title: 'Platforms',
    filename: 'platforms.yml',
    description: 'Alternative Discord-compatible platforms'
  },
  {
    title: 'Website Templates',
    filename: 'website-templates.yml',
    description: 'Templates for Discord-related websites'
  }
];

function loadProjects(filename: string): Project[] {
  const filePath = path.join(DATA_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  const projects = yaml.parse(content) as Project[];
  
  // Sort projects alphabetically by name
  return projects.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}

function generateProjectLink(project: Project): string {
  const repoUrl = project.repo.startsWith('http') ? project.repo : `https://github.com/${project.repo}`;
  const homepageText = project.homepage ? ` ([Homepage](${project.homepage}))` : '';
  return `[${project.name}](${repoUrl})${homepageText}`;
}

function generateSectionContent(section: Section): string {
  const projects = loadProjects(section.filename);
  
  if (projects.length === 0) {
    return `## ${section.title}

*No projects in this category yet.*

`;
  }

  const projectList = projects
    .map(project => `- ${generateProjectLink(project)} — ${project.description}`)
    .join('\n');

  return `## ${section.title}

${projectList}

`;
}

function generateTableOfContents(): string {
  const tocItems = SECTIONS
    .map(section => `  - [${section.title}](#${section.title.toLowerCase().replace(/\s+/g, '-')})`)
    .join('\n');

  return `## Table of Contents

${tocItems}
  - [How to Contribute](#how-to-contribute)
  - [Quality Standards](#quality-standards)
  - [License](#license)

`;
}

function generateReadme(): string {
  const toc = generateTableOfContents();
  const sectionsContent = SECTIONS.map(generateSectionContent).join('');

  return `# Awesome Discord

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
![Last Commit](https://img.shields.io/github/last-commit/discord-united/awesome-discord?style=flat-square)
![Stars](https://img.shields.io/github/stars/discord-united/awesome-discord?style=flat-square)

> ⚠️ **This file is auto-generated.** Do not edit directly. Edit \`data/*.yml\` files and run \`npm run generate\`.

A curated list of high-quality, community-driven open-source Discord projects. This collection focuses on tools, bots, libraries, and resources that empower developers and communities in the Discord ecosystem.

${toc}${sectionsContent}## How to Contribute

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for detailed instructions on how to add projects to this list.

### Quick Steps

1. Fork this repository
2. Edit the appropriate YAML file in \`data/\`
3. Run \`npm run validate:data && npm run generate\` locally
4. Submit a pull request

## Quality Standards

All projects must be:

- **Open-source** with a clear license
- **Actively maintained** (commits within 12 months or recent releases)
- **Discord-focused** and useful to the community
- **Well-documented** with clear setup instructions

### Project Classification

- **Active**: Regular commits or releases within 12 months
- **Inactive**: No activity for 365+ days → moved to [INACTIVE.md](INACTIVE.md)
- **Archived**: Repository marked as archived → moved to [ARCHIVE.md](ARCHIVE.md)

## License

This project is licensed under the [MIT License](LICENSE).

---

**Discord United** — Building, curating, and maintaining open-source tools for the Discord ecosystem.
`;
}

function main() {
  console.log('📝 Generating README.md...\n');

  try {
    const readme = generateReadme();
    fs.writeFileSync(README_PATH, readme, 'utf8');
    
    console.log('✅ README.md generated successfully!');
    console.log(`📄 File saved to: ${README_PATH}`);
    
    // Count total projects
    let totalProjects = 0;
    for (const section of SECTIONS) {
      const projects = loadProjects(section.filename);
      console.log(`   ${section.title}: ${projects.length} projects`);
      totalProjects += projects.length;
    }
    console.log(`📊 Total projects: ${totalProjects}`);
    
  } catch (error) {
    console.error('❌ Error generating README.md:');
    console.error((error as Error).message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { generateReadme };
