Task: Suggest safe next steps to fix a failed command based on the error output.
Output MUST follow this structure:
# Possible causes
- short cause (no commands here)

# Diagnostics
```sh
<diagnostic command 1>
<diagnostic command 2>
```

# Fixes
```sh
<fix command 1>
<fix command 2>
```

Avoid risky fixes unless the user explicitly asks, and warn when suggestions are high risk.
