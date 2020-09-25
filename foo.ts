import { UpdateNotifier, Github } from "./mod.ts";

const notifier = new UpdateNotifier({
  name: "denon",
  owner: "denosaurs",
  registry: Github,
  currentVersion: "0.1.2",
  updateCheckInterval: 1000 * 60 * 60,
});

const update = await notifier.checkForUpdates();

notifier.notify("my command");
