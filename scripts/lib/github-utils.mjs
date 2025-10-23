import crypto from 'node:crypto';

export function buildBranchName(prefix = 'docs/hub', label = '') {
  const normalized = label
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const suffix = crypto.randomBytes(4).toString('hex');
  return `${prefix}/${normalized || 'update'}-${suffix}`;
}

export async function createPullRequest({
  repo,
  title,
  body,
  head,
  base,
  reviewers = [],
}) {
  if (!repo || !repo.slug) {
    throw new Error('Repository metadata must include `slug` (e.g., owner/name)');
  }
  // Network access is restricted in many execution environments.
  // For now we simulate the PR creation by returning a deterministic URL.
  const url = `https://github.com/${repo.slug}/compare/${base}...${encodeURIComponent(head)}`;
  return {
    url,
    reviewers,
    status: 'simulated',
    title,
    body,
  };
}
