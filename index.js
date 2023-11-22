import core from "@actions/core";

import Action from "./src/Action.js";

const main = () => {
  const action = new Action(
    core.getInput("files"),
    core.getInput("search_path"),
    core.getInput("search_pattern"),
    core.getInput("ignore_file"),
  );

  try {
    const missing = action.run();

    const keys = Object.keys(missing);

    if (keys.length === 0) {
      core.info("No differences found in files!!");
      return;
    }

    core.setFailed("Differences found on the next files:");

    keys.forEach((key) => {
      core.info(key);

      missing[key].forEach((item) => {
        core.info(`- ${item}`);
      });
    });
  } catch (e) {
    core.setFailed(e.message);
  }
};

main();
