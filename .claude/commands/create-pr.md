# Create Pull Request Command

Create a new branch, commit changes, and submit a pull request.

## Behavior
- Creates a new branch based on current changes
- Formats modified files using Biome
- Analyzes changes and automatically splits into logical commits when appropriate
- Each commit focuses on a single logical change or feature
- Creates descriptive commit messages for each logical unit
- Pushes branch to remote
- Creates pull request with proper summary and test plan

## Guidelines for Automatic Commit Splitting
- Split commits by feature, component, or concern
- Keep related file changes together in the same commit
- Separate refactoring from feature additions
- Ensure each commit can be understood independently
- Multiple unrelated changes should be split into separate commits

## Best Practices
PR Title Format: Use conventional commit format with emojis

Always include an appropriate emoji at the beginning of the title
Use the actual emoji character (not the code representation like :sparkles:)
Examples:
✨(supabase): Add staging remote configuration
🐛(auth): Fix login redirect issue
📝(readme): Update installation instructions
