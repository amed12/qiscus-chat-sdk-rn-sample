# Contributing

## Commit format

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <summary>

feat(chat): add reply-to-message support
fix(upload): handle missing file size gracefully
docs(readme): add emulator setup steps
chore(deps): bump expo to 52.1
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`.

## Branch naming

`<type>/<short-description>` — e.g. `feat/reply-message`, `fix/typing-timeout`.

## PR checklist

- [ ] `yarn type-check` passes
- [ ] `yarn lint` passes
- [ ] New strings added to both `src/i18n/locales/en.ts` and `id.ts`
- [ ] New user-facing feature documented in `docs/features/`
- [ ] Tested on Android emulator end-to-end

## Code style

- Hooks in `src/hooks/`, not inside screens
- Screens must not import `qiscusClient` directly for realtime data — use hooks
- Styling via `StyleSheet` + tokens from `src/theme/`
- No inline colours or magic numbers
