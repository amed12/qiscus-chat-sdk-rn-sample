# Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

### Primary Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (white-space, formatting, etc)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Special Types
- **BREAKING CHANGE**: A commit that has a footer `BREAKING CHANGE:`, or appends a `!` after the type/scope

## Scopes (Optional)

Common scopes for this project:

### Platform
- **android**: Android-specific changes
- **ios**: iOS-specific changes
- **native**: Native module changes

### Features
- **auth**: Authentication/login
- **chat**: Chat functionality
- **messaging**: Real-time messaging
- **notifications**: Push notifications
- **firebase**: Firebase integration
- **qiscus**: Qiscus SDK integration

### Components
- **screens**: Screen components
- **components**: UI components
- **navigation**: Navigation setup
- **styles**: Styling changes

### Infrastructure
- **deps**: Dependencies
- **config**: Configuration files
- **build**: Build configuration
- **gradle**: Gradle configuration

## Examples

### Feature
```
feat(chat): add file download functionality

- Replaced rn-fetch-blob with react-native-blob-util
- Added download progress indicator
- Implemented permission handling for Android

Closes #123
```

### Bug Fix
```
fix(android): resolve minSdkVersion conflict

Changed minSdkVersion from 23 to 24 to satisfy
@react-native-documents/picker requirement

Fixes #456
```

### Breaking Change
```
feat(deps)!: upgrade to React Native 0.79

BREAKING CHANGE: Minimum Android SDK version is now 24
- Updated all dependencies to latest versions
- Migrated deprecated APIs
- Updated build configuration

Migration guide: See MIGRATION_GUIDE.md
```

### Refactor
```
refactor(qiscus): replace xstream with EventEmitter

- Removed xstream dependency
- Implemented EventEmitter bridge for SDK callbacks
- Updated all event listeners
```

### Documentation
```
docs: add Android build fix documentation

Created ANDROID_FIX.md with detailed steps for resolving
build issues related to deprecated packages
```

### Build
```
build(gradle): add Firebase and multidex support

- Added google-services plugin
- Enabled multidex
- Updated minSdkVersion to 24
```

### Chore
```
chore(deps): update react-native-safe-area-context to 5.6.2

Updated to fix Yoga API compatibility with RN 0.79
```

## Subject Guidelines

1. Use imperative, present tense: "change" not "changed" nor "changes"
2. Don't capitalize first letter
3. No period (.) at the end
4. Limit to 50 characters
5. Be descriptive but concise

## Body Guidelines

1. Use imperative, present tense
2. Include motivation for the change
3. Contrast with previous behavior
4. Wrap at 72 characters

## Footer Guidelines

### Breaking Changes
```
BREAKING CHANGE: <description>
```

### Issue References
```
Fixes #123
Closes #456
Refs #789
```

### Multiple Issues
```
Fixes #123, #456
Closes #789
```

## Git Workflow

### Branch Naming
```
<type>/<short-description>

Examples:
feat/file-download
fix/android-build
docs/update-readme
refactor/event-emitter
```

### Commit Message Template

Create `.gitmessage` in project root:
```
# <type>(<scope>): <subject>
# |<----  Using a Maximum Of 50 Characters  ---->|

# Explain why this change is being made
# |<----   Try To Limit Each Line to a Maximum Of 72 Characters   ---->|

# Provide links or keys to any relevant tickets, articles or other resources
# Example: Fixes #23

# --- COMMIT END ---
# Type can be
#    feat     (new feature)
#    fix      (bug fix)
#    refactor (refactoring code)
#    style    (formatting, missing semi colons, etc; no code change)
#    docs     (changes to documentation)
#    test     (adding or refactoring tests; no production code change)
#    chore    (updating grunt tasks etc; no production code change)
#    perf     (performance improvement)
#    build    (build system or external dependencies)
#    ci       (CI configuration)
# --------------------
# Remember to
#   - Use the imperative mood in the subject line
#   - Do not end the subject line with a period
#   - Separate subject from body with a blank line
#   - Use the body to explain what and why vs. how
#   - Can use multiple lines with "-" for bullet points in body
# --------------------
```

Set it globally:
```bash
git config commit.template .gitmessage
```

## Automated Tools

### Commitlint (Optional)

Install:
```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

Create `commitlint.config.js`:
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'android',
        'ios',
        'auth',
        'chat',
        'messaging',
        'notifications',
        'firebase',
        'qiscus',
        'deps',
        'config',
        'build',
      ],
    ],
  },
};
```

### Husky (Optional)

Install:
```bash
npm install --save-dev husky
npx husky init
```

Add commit-msg hook:
```bash
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

## Quick Reference

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(chat): add emoji picker` |
| `fix` | Bug fix | `fix(android): resolve crash on startup` |
| `docs` | Documentation | `docs: update installation guide` |
| `style` | Code style | `style: format with prettier` |
| `refactor` | Code restructure | `refactor: extract message component` |
| `perf` | Performance | `perf(chat): optimize message rendering` |
| `test` | Tests | `test(auth): add login flow tests` |
| `build` | Build system | `build(gradle): update dependencies` |
| `ci` | CI/CD | `ci: add GitHub Actions workflow` |
| `chore` | Maintenance | `chore: update .gitignore` |

## Version Bumping

Based on commit types:
- `feat`: Minor version bump (0.x.0)
- `fix`: Patch version bump (0.0.x)
- `BREAKING CHANGE`: Major version bump (x.0.0)

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)
