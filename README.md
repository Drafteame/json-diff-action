# json-diff-action

A github action that compare a list of JSON files an return the missing keys between each other.

## Action configurations

| Input Name   | Description                                                                                                     | Required | Default            |
|--------------|-----------------------------------------------------------------------------------------------------------------|----------|--------------------|
| `files`      | List of JSON file paths to check between each other. Should be at least 2 files.                                 | `false`  | -                  |
| `search_path`| Path to a folder that will be inspected to search all JSON files and compare each other.                         | `false`  | -                  |
| `search_pattern` | Regular expression used on search path to find desired files.                                                  | `false`  | `\.json$`          |
| `ignore_file`| Path to a specific ignore file configuration                                                                    | `false`  | `.json-diff-ignore.json` |

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

### Ignore rules

If you need to ignore some specific keys on certain files you can use an ignore json file on your project
root. By the fault the name of this files is `.json-diff-ignore.json` and has this structure:

```json
[
  {
    "pattern": "regexp/file\\.json$",
    "ignoreKeys": ["key1"]
  },
  {
    "pattern": "regexp/file2\\.json$",
    "ignoreKeys": ["key2"]
  }
]
```

If you what to specify a specific path to find the ignore file you can do that by adding the next configuration:

```yml
- name: Run JSON Diff Action
  uses: Drafteame/json-diff-action@main
  with:
    # ...
    ignore_file: /path/to/.json-diff-ignore.json
```
