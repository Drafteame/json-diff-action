# json-diff-action

A github action that compare a list of JSON files an return the missing keys between each other.

## Usage

You can compare specific files using the next configuration:

```yml
- name: Run JSON Diff Action
  uses: Drafteame/json-diff-action@main
  with:
    files: |
      path/to/file1.json
      path/to/file2.json
```

Each new line on the `files` argument is a new file path.

Or if you want to search on a specific route you can use the next configuration:

```yml
- name: Run JSON Diff Action
  uses: Drafteame/json-diff-action@main
  with:
    search_path: path/to/folder
    search_pattern: '\\.json$'
```

This will find on the specified route all files that match the `search_pattern` to compare each other
