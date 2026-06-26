# Task 7: Create Enhanced Review Workflow

**Files:**
- Create: `.github/workflows/enhanced-review.yml`
- Modify: `.github/workflows/gemini-pr-review.yml`

**Interfaces:**
- Consumes: GitHub PR events
- Produces: Enhanced review submission

- [ ] **Step 1: Create enhanced review workflow**

Write `.github/workflows/enhanced-review.yml`:
```yaml
name: Gemini AI Enhanced Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches: [main]

concurrency:
  group: enhanced-review-${{ github.event.pull_request.number }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write

jobs:
  automated-checks:
    name: Automated Checks
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run TypeScript check
        run: npm run typecheck
        
      - name: Run ESLint check
        run: npm run lint
        
      - name: Security scan (placeholder)
        env:
          FILES: ${{ github.event.pull_request.changed_files }}
        run: |
          echo "Security scan placeholder - PR contains: ${{ env.FILES }}"
          echo "Note: Implement actual security scan in future iterations"

  enhanced-review:
    name: AI Enhanced Review
    needs: automated-checks
    runs-on: ubuntu-latest
    if: github.event.pull_request.draft == false
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get PR diff
        id: diff
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          gh api \
            "repos/${{ github.repository }}/pulls/${{ github.event.pull_request.number }}" \
            -H "Accept: application/vnd.github.diff" \
            > /tmp/pr_full.diff

          python3 << 'PYEOF'
          import re, sys

          SKIP_PATTERNS = [
              r'package-lock\.json$',
              r'pnpm-lock\.yaml$',
              r'yarn\.lock$',
              r'\.png$', r'\.jpg$', r'\.jpeg$', r'\.gif$', r'\.svg$', r'\.ico$', r'\.webp$',
              r'\.woff2?$', r'\.ttf$', r'\.eot$',
              r'^dist/',
              r'\.env\.example$',
              r'\.gitattributes$',
              r'\.gitignore$',
          ]

          with open('/tmp/pr_full.diff', 'r', errors='replace') as f:
              full_diff = f.read()

          file_diffs = re.split(r'(?=^diff --git )', full_diff, flags=re.MULTILINE)
          filtered = []

          for chunk in file_diffs:
              if not chunk.strip():
                  continue
              match = re.match(r'diff --git a/(.*?) b/(.*)', chunk)
              if not match:
                  filtered.append(chunk)
                  continue
              filepath = match.group(2)
              if any(re.search(p, filepath) for p in SKIP_PATTERNS):
                  continue
              filtered.append(chunk)

          result = ''.join(filtered)
          MAX_CHARS = 100_000
          if len(result) > MAX_CHARS:
              result = result[:MAX_CHARS] + '\n\n... [diff truncated due to size] ...'

          with open('/tmp/pr_filtered.diff', 'w') as f:
              f.write(result)

          if not result.strip():
              print('skip=true')
              with open('/tmp/skip_review', 'w') as f:
                  f.write('true')
          else:
              print('skip=false')
              with open('/tmp/skip_review', 'w') as f:
                  f.write('false')
          PYEOF

          echo "skip=$(cat /tmp/skip_review)" >> "$GITHUB_OUTPUT"

      - name: Skip if no reviewable changes
        if: steps.diff.outputs.skip == 'true'
        run: echo "No reviewable file changes found. Skipping review."

      - name: Run Enhanced Review
        if: steps.diff.outputs.skip != 'true'
        env:
          GEMINI_AI_KEY: ${{ secrets.GEMINI_AI_KEY }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
          PR_TITLE: ${{ github.event.pull_request.title }}
          PR_SHA: ${{ github.event.pull_request.head.sha }}
        run: |
          # Read diff
          DIFF=$(cat /tmp/pr_filtered.diff)
          
          # Run harness
          node .github/scripts/subagent-review-harness.js \
            --pr-number "$PR_NUMBER" \
            --pr-title "$PR_TITLE" \
            --pr-sha "$PR_SHA" \
            --diff-file /tmp/pr_filtered.diff \
            > /tmp/review_result.json

          cat /tmp/review_result.json

      - name: Submit GitHub Review
        if: steps.diff.outputs.skip != 'true'
        env:
          GH_TOKEN: ${{ secrets.BOT_GITHUB_TOKEN }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
          HEAD_SHA: ${{ github.event.pull_request.head.sha }}
          REPO: ${{ github.repository }}
        run: |
          python3 << 'PYEOF'
          import json, os, subprocess, sys

          with open('/tmp/review_result.json', 'r') as f:
              result = json.load(f)

          review_comment = result['reviewComment']
          metrics = result['performanceMetrics']

          # Dismiss previous reviews
          prev_reviews = subprocess.run(
              ['gh', 'api', f'repos/{repo}/pulls/{pr_number}/reviews', '--jq',
               '[.[] | select(.user.login == "github-actions[bot]" and .state == "CHANGES_REQUESTED") | .id]'],
              capture_output=True, text=True,
          )
          if prev_reviews.returncode == 0 and prev_reviews.stdout.strip():
              try:
                  review_ids = json.loads(prev_reviews.stdout.strip())
                  for rid in review_ids:
                      subprocess.run(
                          ['gh', 'api', '--method', 'PUT',
                           f'repos/{repo}/pulls/{pr_number}/reviews/{rid}/dismissals',
                           '-f', 'message=Superseded by enhanced review',
                           '-f', 'event=DISMISS'],
                          capture_output=True, text=True,
                      )
              except (json.JSONDecodeError, TypeError):
                  pass

          # Determine review event
          has_critical = any(issue.get('confidence', 0) >= 80 for issue in result.get('issues', []))
          has_minor = any(50 <= issue.get('confidence', 0) < 80 for issue in result.get('issues', []))
          
          if has_critical:
              event = 'REQUEST_CHANGES'
              body_lines = [
                  '## 🤖 Gemini AI Enhanced Code Review',
                  '',
                  review_comment,
                  '',
                  '### 📊 Performance Metrics',
                  f'- Review Time: {metrics["duration"]}ms',
                  f'- Agents Spawned: {metrics["agentsSpawned"]}',
                  f'- Issues Found: {metrics["issuesFound"]}',
                  '',
                  '<sub>🤖 Reviewed by 7 AI Experts | React with 👍 if helpful, 👎 if not</sub>'
              ]
          else:
              event = 'APPROVE'
              body_lines = [
                  '## 🤖 Gemini AI Enhanced Code Review',
                  '',
                  review_comment,
                  '',
                  '### 📊 Performance Metrics',
                  f'- Review Time: {metrics["duration"]}ms',
                  f'- Agents Spawned: {metrics["agentsSpawned"]}',
                  f'- Issues Found: {metrics["issuesFound"]}',
                  '',
                  '<sub>🤖 Reviewed by 7 AI Experts | React with 👍 if helpful, 👎 if not</sub>'
              ]

          body = '\n'.join(body_lines)

          # Submit review
          review_payload = json.dumps({
              'body': body,
              'event': event,
              'commit_id': head_sha,
          })

          result = subprocess.run(
              [
                  'gh', 'api',
                  f'repos/{repo}/pulls/{pr_number}/reviews',
                  '--method', 'POST',
                  '--input', '-',
              ],
              input=review_payload,
              capture_output=True,
              text=True,
          )

          if result.returncode == 0:
              print(f'Review submitted: {event}')
              print(f'   Performance: {metrics["duration"]}ms')
          else:
              print(f'Error submitting review: {result.stderr}')
              sys.exit(1)
          PYEOF
```

- [ ] **Step 2: Modify existing workflow to use enhanced review**

Update `.github/workflows/gemini-pr-review.yml` to add enhanced review job.

- [ ] **Step 3: Run workflow validation**

Run: `gh workflow validate --source .`
Expected: Valid workflow

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/enhanced-review.yml .github/workflows/gemini-pr-review.yml
git commit -m "feat: add enhanced review workflow with subagent harness"
```