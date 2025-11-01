import { spawn } from 'child_process';

export class GitCommandError extends Error {
  constructor(command, args, exitCode, stdout, stderr) {
    super(`git ${command} failed with code ${exitCode}`);
    this.name = 'GitCommandError';
    this.command = command;
    this.args = args;
    this.exitCode = exitCode;
    this.stdout = stdout;
    this.stderr = stderr;
  }
}

function runGit(args, { cwd, env } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('git', args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      } else {
        reject(new GitCommandError(args[0], args.slice(1), code, stdout.trim(), stderr.trim()));
      }
    });
  });
}

export async function checkoutBranch(branchName, { cwd, env } = {}) {
  try {
    await runGit(['rev-parse', '--verify', branchName], { cwd, env });
    await runGit(['checkout', branchName], { cwd, env });
  } catch (error) {
    if (error instanceof GitCommandError && error.command === 'rev-parse') {
      await runGit(['checkout', '-b', branchName], { cwd, env });
      return;
    }
    throw error;
  }
}

export async function ensureBranch(branchName, { cwd, env } = {}) {
  try {
    await runGit(['rev-parse', '--verify', branchName], { cwd, env });
  } catch (error) {
    if (error instanceof GitCommandError) {
      await runGit(['branch', branchName], { cwd, env });
      return;
    }
    throw error;
  }
}

export async function commitAll(message, { cwd, env } = {}) {
  await runGit(['add', '--all'], { cwd, env });
  try {
    await runGit(['commit', '-m', message], { cwd, env });
  } catch (error) {
    if (
      error instanceof GitCommandError &&
      /nothing to commit/.test(`${error.stderr}\n${error.stdout}`)
    ) {
      return { skipped: true };
    }
    throw error;
  }
  return { skipped: false };
}

export async function pushBranch(remote, branchName, { cwd, env, force = false } = {}) {
  const args = ['push', remote, branchName];
  if (force) {
    args.splice(1, 0, '--force-with-lease');
  }
  await runGit(args, { cwd, env });
}

export async function getCurrentBranch({ cwd, env } = {}) {
  const { stdout } = await runGit(['rev-parse', '--abbrev-ref', 'HEAD'], { cwd, env });
  return stdout;
}

export async function ensureRemote(remote, url, { cwd, env } = {}) {
  try {
    const { stdout } = await runGit(['remote', 'get-url', remote], { cwd, env });
    if (stdout && stdout.trim() !== url) {
      await runGit(['remote', 'set-url', remote, url], { cwd, env });
    }
  } catch (error) {
    if (error instanceof GitCommandError) {
      await runGit(['remote', 'add', remote, url], { cwd, env });
      return;
    }
    throw error;
  }
}

export { runGit };
