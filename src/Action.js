import lodash from "lodash";
import fs from "fs";
import path from "path";

import {
  NotEnoughFiles,
  NotFoundPath,
  EmptySearchPath,
  InvalidSearchPath,
} from "./errors.js";

const defaultRegExp = "\\.json$";

export default class Action {
  /**
   * Text with a list of file paths to be compared. Each new line is a new file path.
   * @type {string}
   */
  #files;

  /**
   * Path to a folder that should be inspected to find files to be compared.
   * @type {string}
   */
  #searchPath;

  /**
   * Regular expression to filter files found on search path.
   * @type {string}
   */
  #searchPattern;

  /**
   * Final list of files after initial validations
   * @type {Array<string>}
   */
  #fileList;

  constructor(files, searchPath, searchPattern) {
    this.#files = files;
    this.#searchPath = searchPath;

    this.#searchPattern = defaultRegExp;

    if (!lodash.isEmpty(searchPattern)) {
      this.#searchPattern = searchPattern;
    }

    this.#fileList = this.#validateInputs();
  }

  /**
   * Return the computed list of files to be compared.
   *
   * @returns {Array<string>}
   */
  getFileList() {
    return this.#fileList;
  }

  /**
   * Execute comparison of file keys and return the found differences.
   *
   * @returns {Object}
   */
  run() {
    const contents = this.#readFilesContent();
    return this.#compareContents(contents);
  }

  /**
   * Receive and Object with the keys of each file and compare against each other to found what keys are missing
   * on each file.
   *
   * @param {Object} contents Object that each property is a file and the content is an array of its keys
   *
   * @returns {Object} Each property is a file with differences and its content is an array of string keys
   */
  #compareContents(contents) {
    const missingKeys = {};

    const keys = Object.keys(contents);

    keys.forEach((file1) => {
      let missing = [];

      keys.forEach((file2) => {
        if (file1 === file2) {
          return;
        }

        const keysFile1 = contents[file1];
        const keysFile2 = contents[file2];

        keysFile2
          .filter((key) => {
            const notInKeys1 = !keysFile1.includes(key);
            const notInMissing = !missing.includes(key);

            return notInKeys1 && notInMissing;
          })
          .forEach((key) => {
            missing.push(key);
          });
      });

      if (missing.length > 0) {
        missingKeys[file1] = missing;
      }
    });

    return missingKeys;
  }

  /**
   * Read the content of each file of the filtered list and obtain it's keys to be compared against each other.
   *
   * @returns {Object} each property is an array of strings
   */
  #readFilesContent() {
    const contents = {};

    this.#fileList.forEach((file) => {
      const content = fs.readFileSync(file, { encoding: "utf-8" });
      contents[file] = Object.keys(JSON.parse(content));
    });

    return contents;
  }

  /**
   * Validate action inputs and return a list of the files that should be compared based on the configurations.
   *
   * @returns {Array<string>}
   */
  #validateInputs() {
    if (!lodash.isEmpty(this.#files)) {
      return this.#validateFiles();
    }

    return this.#validateSearchPath();
  }

  /**
   * Validate and split list of specific files, to check if there are at least 2 files and if ech path exists
   *
   * @throws {NotEnoughFiles} If there are less than 2 files
   * @throws {NotFoundPath} If specified file path not exists.
   *
   * @return {Array<string>}
   */
  #validateFiles() {
    let parts = this.#files
      .split("\n")
      .map((part) => part.trim())
      .filter((part) => !lodash.isEmpty(part))
      .filter((part, index, array) => array.indexOf(part) === index)
      .map((file) => {
        if (!fs.existsSync(file)) {
          throw new NotFoundPath(`File ${file} not found.`);
        }

        return file;
      });

    if (parts.length < 2) {
      throw new NotEnoughFiles("You need at least 2 files to be compared.");
    }

    return parts;
  }

  /**
   * Validate search configuration and return a list of files that should be compared.
   *
   * @throws {EmptySearchPath} Search path configuration is empty.
   * @throws {InvalidSearchPath} Search path not exists or is not a directory.
   *
   * @returns {Array<string>}
   */
  #validateSearchPath() {
    if (lodash.isEmpty(this.#searchPath)) {
      throw new EmptySearchPath("Search path can't be empty.");
    }

    if (
      !fs.existsSync(this.#searchPath) ||
      !fs.lstatSync(this.#searchPath).isDirectory()
    ) {
      throw new InvalidSearchPath(
        `Invalid path '${this.#searchPath}', path should exists and be a directory.`,
      );
    }

    return this.#getFilesFromPath();
  }

  /**
   * Return a filtered list of files found on the search path that matches git the configured pattern.
   *
   * @throws {NotEnoughFiles} Filtered files are less than 2.
   *
   * @returns {Array<string>}
   */
  #getFilesFromPath() {
    const regexp = new RegExp(this.#searchPattern);

    let files = fs
      .readdirSync(this.#searchPath, { withFileTypes: true })
      .filter((file) => {
        if (file.isDirectory()) {
          return false;
        }

        return regexp.test(file.name);
      })
      .map((file) => `${this.#normalizePath(this.#searchPath)}/${file.name}`);

    if (files.length < 2) {
      throw new NotEnoughFiles("You need at least 2 files to be compared.");
    }

    return files;
  }

  /**
   * Normalize a given folder path to not end with a final separator.
   *
   * @param {string} input Denormalized folder path.
   *
   * @returns {string}
   */
  #normalizePath(input) {
    const normalizedPath = path.join(input);
    const lastSegment = path.basename(normalizedPath);
    const newPath = path.join(path.dirname(normalizedPath), lastSegment);

    return newPath;
  }
}
