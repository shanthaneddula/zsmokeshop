# Git Branching Strategy for Z SMOKE SHOP

This document outlines the branching strategy and workflow for the Z SMOKE SHOP project, following GitFlow methodology with adaptations for our Adidas-inspired UI development.

## Branch Structure

### Main Branches

- **`main`** - Production-ready code
  - Always deployable to production
  - Protected branch with required reviews
  - Tagged releases (v1.0.0, v1.1.0, etc.)
  - Direct pushes not allowed
  - Automatic deployment to production environment

- **`develop`** - Integration branch
  - Latest development changes
  - Feature branches merge here first
  - Staging deployments for testing
  - Base for all new feature branches
  - Contains completed features ready for next release

### Supporting Branches
- **`feature/*`** - New features and enhancements
- **`release/*`** - Prepare new production releases
- **`hotfix/*`** - Critical production fixes
- **`bugfix/*`** - Non-critical bug fixes

## Workflow Examples

### Creating a New Feature

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/ui-improvements-and-docs-update

# Work on feature...
git add .
git commit -m "feat: redesign hero section with single-line title and perfect centering"
git commit -m "feat: implement expandable mobile menu with Adidas-style navigation"
git commit -m "feat: update support page to match Adidas help design"
git commit -m "feat: replace thick borders with thin separators throughout UI"
git commit -m "docs: update PROJECT_SUMMARY.md with latest UI improvements"
git commit -m "docs: enhance README.md with comprehensive feature list and setup"

# Push feature branch
git push origin feature/ui-improvements-and-docs-update

# Create pull request to develop
# After review and approval, merge to develop
```

### Release Preparation
```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Final testing, bug fixes, version bumps
git commit -m "chore: bump version to 1.2.0"

# Merge to main and develop
git checkout main
git merge release/v1.2.0
git tag v1.2.0
git checkout develop
git merge release/v1.2.0
```

### 3. Hotfix Process
```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# Fix the issue
git commit -m "fix: resolve critical security vulnerability"

# Merge to main and develop
git checkout main
git merge hotfix/critical-security-fix
git tag v1.2.1
git checkout develop
git merge hotfix/critical-security-fix
```

## Commit Message Convention

We follow **Conventional Commits** specification:

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes

### Examples
```bash
feat(hero): add translucent mobile cards with backdrop blur
fix(navigation): resolve z-index overlap with hero section
docs(readme): update installation instructions
style(components): format code with prettier
refactor(api): extract user service logic
perf(images): optimize hero section image loading
test(hero): add unit tests for card carousel
chore(deps): update next.js to latest version
ci(deploy): add automated deployment pipeline
```

## Pull Request Guidelines

### PR Title Format
```
<type>(<scope>): <description>
```

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if applicable)
- [ ] Mobile testing (if applicable)

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] No console errors
```

## Branch Protection Rules

### Main Branch
- Require pull request reviews (2 reviewers)
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes to main
- Require signed commits

### Develop Branch
- Require pull request reviews (1 reviewer)
- Require status checks to pass
- Allow force pushes for maintainers

## Release Process

### Version Numbering (Semantic Versioning)
- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (1.1.0): New features (backward compatible)
- **PATCH** (1.1.1): Bug fixes (backward compatible)

### Release Checklist
- [ ] All features tested and approved
- [ ] Documentation updated
- [ ] Version number bumped
- [ ] Changelog updated
- [ ] Release notes prepared
- [ ] Production deployment tested
- [ ] Rollback plan ready

## Environment Strategy

### Environments
- **Development** (`develop` branch) - `dev.zsmokeshop.com`
- **Staging** (`release/*` branches) - `staging.zsmokeshop.com`
- **Production** (`main` branch) - `zsmokeshop.com`

### Deployment Pipeline
1. **Feature** → **Develop** → **Development Environment**
2. **Develop** → **Release** → **Staging Environment**
3. **Release** → **Main** → **Production Environment**

## Quick Commands

### Setup
```bash
# Clone and setup
git clone <repository-url>
cd zsmokeshop
npm install

# Setup develop branch
git checkout -b develop
git push -u origin develop
```

### Daily Workflow
```bash
# Start new feature
git checkout develop && git pull origin develop
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "feat(scope): your changes"
git push origin feature/your-feature-name

# Update feature with latest develop
git checkout develop && git pull origin develop
git checkout feature/your-feature-name
git rebase develop
```

### Emergency Hotfix
```bash
# Quick hotfix
git checkout main && git pull origin main
git checkout -b hotfix/urgent-fix
# Make fix
git commit -m "fix: urgent production issue"
git checkout main && git merge hotfix/urgent-fix
git tag v1.x.x && git push origin main --tags
git checkout develop && git merge hotfix/urgent-fix
```

## Best Practices

1. **Keep branches focused** - One feature per branch
2. **Use descriptive names** - `feature/mobile-navigation-improvements`
3. **Regular commits** - Small, logical commits with clear messages
4. **Rebase before merge** - Keep history clean
5. **Delete merged branches** - Clean up after merging
6. **Test before pushing** - Ensure code works locally
7. **Review your own PR** - Self-review before requesting others
8. **Update documentation** - Keep docs in sync with code changes

## Troubleshooting

### Common Issues
```bash
# Sync fork with upstream
git remote add upstream <original-repo-url>
git fetch upstream
git checkout main
git merge upstream/main

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Fix merge conflicts
git status
# Edit conflicted files
git add .
git commit
```

This branching strategy ensures code quality, enables parallel development, and provides a clear path from development to production.
