#!/usr/bin/env node

/**
 * Generate index for all scenarios in docs/website/zh/scenarios
 * This creates a comprehensive catalog page
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const SCENARIOS_ROOT = path.resolve('docs/website/zh/scenarios');
const OUTPUT_FILE = path.join(SCENARIOS_ROOT, '_catalog.md');

function extractTitle(content) {
  // Skip frontmatter title and extract H1 title instead
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    // Remove "– Usecase Seed Index" suffix if present
    const title = h1Match[1].trim();
    return title.replace(/–\s*Usecase Seed Index$/, '').trim();
  }

  return null;
}

function extractDescription(content) {
  const descMatch = content.match(/^>.*?(?=\n)/m);
  return descMatch ? descMatch[0].replace(/^>\s*/, '').trim() : null;
}

function extractUsecaseTable(content) {
  const tableMatch = content.match(/## Scope:.*?\n\n(\|[\s\S]*?)(?=\n##|\n```|\Z)/);
  if (!tableMatch) return null;

  const lines = tableMatch[1].trim().split('\n');
  const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);

  const rows = lines.slice(2).map(line => {
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length === headers.length) {
      const row = {};
      headers.forEach((h, i) => {
        row[h] = cols[i];
      });
      return row;
    }
    return null;
  }).filter(Boolean);

  return { headers, rows };
}

async function scanDirectory(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const items = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Only process top-level markdown files (not directories)
    if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md' && entry.name !== '_catalog.md' && entry.name !== 'usage.md') {
      // Top-level scenario file
      const content = await fs.readFile(fullPath, 'utf8');
      const title = extractTitle(content);
      const description = extractDescription(content);

      items.push({
        type: 'scenario-file',
        id: path.basename(entry.name, '.md'),
        title,
        description,
        path: `${entry.name}`,
      });
    }
  }

  return items;
}

function groupByPrefix(items) {
  const groups = new Map();

  for (const item of items) {
    const match = item.id.match(/^SCN-([A-Z]+)-/);
    const prefix = match ? match[1] : 'OTHER';

    if (!groups.has(prefix)) {
      groups.set(prefix, {
        prefix,
        displayName: getPrefixDisplayName(prefix),
        items: [],
      });
    }

    groups.get(prefix).items.push(item);
  }

  // Sort items within each group
  for (const group of groups.values()) {
    group.items.sort((a, b) => a.id.localeCompare(b.id));
  }

  // Sort groups
  return Array.from(groups.values()).sort((a, b) => a.prefix.localeCompare(b.prefix));
}

function getPrefixDisplayName(prefix) {
  const names = {
    'DEV-PLUGIN': '插件开发与调试',
    'DEV-PLUGIN-INIT': '插件创建与初始化',
    'DEV-PLUGIN-PUBLISH': '插件发布与上架',
    'DEV-PLUGIN-VERSION-COMPAT': '插件版本与兼容性管理',
    'IAM': '身份认证与权限',
    'IAM-LOGIN-AUTH': '登录认证',
    'IAM-MULTI-TENANT': '多租户管理',
    'IAM-USER-ROLE': '用户与角色',
    'OPS': '运维与监控',
    'OPS-EVENT-TASKFLOW': '事件与任务流',
    'OPS-PLUGIN-LIFECYCLE': '插件生命周期',
    'OPS-SYSTEM-MONITORING': '系统监控',
    'PUBLISH-HUB': '发布中心',
    'OTHER': '其他',
  };

  return names[prefix] || prefix;
}

function generateMarkdown(groups) {
  let content = `---
title: 场景目录
description: PowerX 插件生态系统场景文档索引
last_reviewed_at: ${new Date().toISOString().split('T')[0]}
---

# PowerX 场景目录

> 本索引由自动生成脚本维护，基于 docs/website/zh/scenarios 目录结构动态创建。

**总览统计**
- 场景分组数：${groups.length}
- 场景总数：${groups.reduce((sum, g) => sum + g.items.length, 0)}
- 用例总数：${groups.reduce((sum, g) => sum + g.items.reduce((s, i) => s + (i.usecases || 0), 0), 0)}

`;

  for (const group of groups) {
    content += `\n## ${group.displayName}\n\n`;
    content += `共 ${group.items.length} 个场景\n\n`;

    for (const item of group.items) {
      content += `### ${item.title || item.id}\n\n`;
      if (item.description) {
        content += `${item.description}\n\n`;
      }
      content += `- **路径**: [${item.path}](./${item.path})\n`;
      content += `- **ID**: \`${item.id}\`\n`;
      if (item.usecases) {
        content += `- **用例数量**: ${item.usecases}\n`;
      }
      content += `\n`;
    }
  }

  content += `\n---\n\n`;
  content += `> 本目录通过自动扫描 docs/website/zh/scenarios 生成，最后更新：${new Date().toLocaleString('zh-CN')}\n`;

  return content;
}

async function main() {
  console.log('Scanning scenarios directory...');
  const items = await scanDirectory(SCENARIOS_ROOT);

  console.log(`Found ${items.length} scenarios`);

  const groups = groupByPrefix(items);
  const markdown = generateMarkdown(groups);

  await fs.writeFile(OUTPUT_FILE, markdown, 'utf8');
  console.log(`Generated catalog: ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error('Failed to generate catalog:', error);
  process.exit(1);
});
