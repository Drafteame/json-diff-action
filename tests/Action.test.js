import sinon from "sinon";
import chai from "chai";
import sinonChai from "sinon-chai";
import fs from "fs";

import Action from "./../src/Action.js";

const expect = chai.expect;

chai.use(sinonChai);

describe("Action core functions", () => {
  let sandbox;
  let fsStub;
  let isDirectoryStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    let lstatResp = { isDirectory: () => false };
    isDirectoryStub = sandbox.stub(lstatResp, "isDirectory");

    fsStub = {
      existsSync: sandbox.stub(fs, "existsSync"),
      lstatSync: sandbox.stub(fs, "lstatSync").returns(lstatResp),
      readdirSync: sandbox.stub(fs, "readdirSync"),
      readFileSync: sandbox.stub(fs, "readFileSync"),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Should fail if explicit files are empty and search path is empty", () => {
    const files = ``;
    const searchPath = ``;
    const searchPattern = ``;

    try {
      new Action(files, searchPath, searchPattern);
    } catch (e) {
      expect(e.message).to.be.equal("Search path can't be empty.");
      return;
    }

    expect.fail("Expected exception");
  });

  it("Should fail if explicit files are lest than 2", () => {
    const files = `
      some/path/to/file.json
    `;
    const searchPath = ``;
    const searchPattern = ``;

    fsStub.existsSync.returns(true);

    try {
      new Action(files, searchPath, searchPattern);
    } catch (e) {
      expect(e.message).to.be.equal(
        "You need at least 2 files to be compared.",
      );
      return;
    }

    expect.fail("Expected exception");
  });

  it("Should fail different files of explicit files are less than 2", () => {
    const files = `
      some/path/to/file.json
      some/path/to/file.json
    `;
    const searchPath = ``;
    const searchPattern = ``;

    fsStub.existsSync.returns(true);

    try {
      new Action(files, searchPath, searchPattern);
    } catch (e) {
      expect(e.message).to.be.equal(
        "You need at least 2 files to be compared.",
      );
      return;
    }

    expect.fail("Expected exception");
  });

  it("Should fail if explicit file not exists", () => {
    const files = `
      some/path/to/file1.json
      some/path/to/file2.json
    `;
    const searchPath = ``;
    const searchPattern = ``;

    fsStub.existsSync.withArgs("some/path/to/file1.json").returns(true);
    fsStub.existsSync.withArgs("some/path/to/file2.json").returns(false);

    try {
      new Action(files, searchPath, searchPattern);
    } catch (e) {
      expect(e.message).to.be.equal("File some/path/to/file2.json not found.");
      return;
    }

    expect.fail("Expected exception");
  });

  it("Should create instance if explicit files are valid", () => {
    const files = `
      some/path/to/file1.json
      some/path/to/file2.json
    `;
    const searchPath = ``;
    const searchPattern = ``;

    fsStub.existsSync.returns(true);

    try {
      const action = new Action(files, searchPath, searchPattern);

      expect(action.getFileList()).to.contains("some/path/to/file1.json");
      expect(action.getFileList()).to.contains("some/path/to/file2.json");
    } catch (e) {
      expect.fail(`Error: ${e.message}`);
      return;
    }
  });

  it("Should fail if search path not exists", () => {
    const files = ``;
    const searchPath = `some/search/folder`;
    const searchPattern = ``;

    fsStub.existsSync.withArgs(searchPath).returns(false);

    try {
      new Action(files, searchPath, searchPattern);
    } catch (e) {
      expect(e.message).to.be.equal(
        `Invalid path '${searchPath}', path should exists and be a directory.`,
      );
      return;
    }

    expect.fail(`Expected exception`);
  });

  it("Should fail if search path is not a directory", () => {
    const files = ``;
    const searchPath = `some/search/folder`;
    const searchPattern = ``;

    fsStub.existsSync.withArgs(searchPath).returns(true);
    isDirectoryStub.returns(false);

    try {
      new Action(files, searchPath, searchPattern);
    } catch (e) {
      expect(e.message).to.be.equal(
        `Invalid path '${searchPath}', path should exists and be a directory.`,
      );
      return;
    }

    expect.fail(`Expected exception`);
  });

  it("Should fail if files filtered in search path are less than 2", () => {
    const files = ``;
    const searchPath = `some/search/folder`;
    const searchPattern = ``;

    fsStub.existsSync.withArgs(searchPath).returns(true);
    isDirectoryStub.returns(true);

    fsStub.readdirSync.returns([
      { name: "file1.json", isDirectory: () => false },
      { name: "file2.ejson", isDirectory: () => false },
      { name: "folder", isDirectory: () => true },
      { name: "file3.txt", isDirectory: () => false },
    ]);

    try {
      new Action(files, searchPath, searchPattern);
    } catch (e) {
      expect(e.message).to.be.equal(
        `You need at least 2 files to be compared.`,
      );
      return;
    }

    expect.fail(`Expected exception`);
  });

  it("Should obtain a custom list from custom pattern", () => {
    const files = ``;
    const searchPath = `some/search/folder`;
    const searchPattern = `json$`;

    fsStub.existsSync.withArgs(searchPath).returns(true);
    isDirectoryStub.returns(true);

    fsStub.readdirSync.returns([
      { name: "file1.json", isDirectory: () => false },
      { name: "file2.ejson", isDirectory: () => false },
      { name: "folder", isDirectory: () => true },
      { name: "file3.txt", isDirectory: () => false },
    ]);

    try {
      const action = new Action(files, searchPath, searchPattern);

      expect(action.getFileList()).to.contain(`${searchPath}/file1.json`);
      expect(action.getFileList()).to.contain(`${searchPath}/file2.ejson`);
    } catch (e) {
      expect.fail(`Error: ${e.message}`);
    }
  });

  it("Should obtain normalized file list from not normalized search path", () => {
    const files = ``;
    const searchPath = `/some/search/folder/`;
    const searchPattern = `json$`;

    fsStub.existsSync.withArgs(searchPath).returns(true);
    isDirectoryStub.returns(true);

    fsStub.readdirSync.returns([
      { name: "file1.json", isDirectory: () => false },
      { name: "file2.ejson", isDirectory: () => false },
      { name: "folder", isDirectory: () => true },
      { name: "file3.txt", isDirectory: () => false },
    ]);

    try {
      const action = new Action(files, searchPath, searchPattern);

      expect(action.getFileList()).to.contain(`/some/search/folder/file1.json`);
      expect(action.getFileList()).to.contain(
        `/some/search/folder/file2.ejson`,
      );
    } catch (e) {
      expect.fail(`Error: ${e.message}`);
    }
  });

  it("Should return differences of each file", () => {
    const files = ``;
    const searchPath = `/some/search/folder/`;
    const searchPattern = `json$`;

    fsStub.existsSync.withArgs(searchPath).returns(true);
    isDirectoryStub.returns(true);

    fsStub.readdirSync.returns([
      { name: "file1.json", isDirectory: () => false },
      { name: "file2.ejson", isDirectory: () => false },
      { name: "folder", isDirectory: () => true },
      { name: "file3.txt", isDirectory: () => false },
    ]);

    let readOpts = { encoding: "utf-8" };

    fsStub.readFileSync
      .withArgs("/some/search/folder/file1.json", readOpts)
      .returns(
        JSON.stringify({
          common: 1,
          missing1: "some",
        }),
      );

    fsStub.readFileSync
      .withArgs("/some/search/folder/file2.ejson", readOpts)
      .returns(
        JSON.stringify({
          common: 1,
          missing2: "some",
        }),
      );

    const expected = {
      "/some/search/folder/file1.json": ["missing2"],
      "/some/search/folder/file2.ejson": ["missing1"],
    };

    try {
      const action = new Action(files, searchPath, searchPattern);

      expect(action.getFileList()).to.contain(`/some/search/folder/file1.json`);
      expect(action.getFileList()).to.contain(
        `/some/search/folder/file2.ejson`,
      );

      const missing = action.run();

      expect(JSON.stringify(missing)).to.be.equal(JSON.stringify(expected));
    } catch (e) {
      expect.fail(`Error: ${e.message}`);
    }
  });

  it("Should not return differences if not exists", () => {
    const files = ``;
    const searchPath = `/some/search/folder/`;
    const searchPattern = `json$`;

    fsStub.existsSync.withArgs(searchPath).returns(true);
    isDirectoryStub.returns(true);

    fsStub.readdirSync.returns([
      { name: "file1.json", isDirectory: () => false },
      { name: "file2.ejson", isDirectory: () => false },
      { name: "folder", isDirectory: () => true },
      { name: "file3.txt", isDirectory: () => false },
    ]);

    let readOpts = { encoding: "utf-8" };

    fsStub.readFileSync
      .withArgs("/some/search/folder/file1.json", readOpts)
      .returns(
        JSON.stringify({
          common: 1,
          missing1: "some",
          missing2: "some",
        }),
      );

    fsStub.readFileSync
      .withArgs("/some/search/folder/file2.ejson", readOpts)
      .returns(
        JSON.stringify({
          common: 1,
          missing1: "some",
          missing2: "some",
        }),
      );

    const expected = {};

    try {
      const action = new Action(files, searchPath, searchPattern);

      expect(action.getFileList()).to.contain(`/some/search/folder/file1.json`);
      expect(action.getFileList()).to.contain(
        `/some/search/folder/file2.ejson`,
      );

      const missing = action.run();

      expect(JSON.stringify(missing)).to.be.equal(JSON.stringify(expected));
    } catch (e) {
      expect.fail(`Error: ${e.message}`);
    }
  });

  it("Should return differences just for some files if exists", () => {
    const files = ``;
    const searchPath = `/some/search/folder/`;
    const searchPattern = `json$`;

    fsStub.existsSync.withArgs(searchPath).returns(true);
    isDirectoryStub.returns(true);

    fsStub.readdirSync.returns([
      { name: "file1.json", isDirectory: () => false },
      { name: "file2.ejson", isDirectory: () => false },
      { name: "folder", isDirectory: () => true },
      { name: "file3.txt", isDirectory: () => false },
    ]);

    let readOpts = { encoding: "utf-8" };

    fsStub.readFileSync
      .withArgs("/some/search/folder/file1.json", readOpts)
      .returns(
        JSON.stringify({
          common: 1,
          missing1: "some",
        }),
      );

    fsStub.readFileSync
      .withArgs("/some/search/folder/file2.ejson", readOpts)
      .returns(
        JSON.stringify({
          common: 1,
          missing1: "some",
          missing2: "some",
        }),
      );

    const expected = {
      "/some/search/folder/file1.json": ["missing2"],
    };

    try {
      const action = new Action(files, searchPath, searchPattern);

      expect(action.getFileList()).to.contain(`/some/search/folder/file1.json`);
      expect(action.getFileList()).to.contain(
        `/some/search/folder/file2.ejson`,
      );

      const missing = action.run();

      expect(JSON.stringify(missing)).to.be.equal(JSON.stringify(expected));
    } catch (e) {
      expect.fail(`Error: ${e.message}`);
    }
  });
});
