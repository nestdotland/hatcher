import { Github, UpdateNotifier } from "./mod.ts";

const notifier = new UpdateNotifier({
  name: "denon",
  owner: "denosaurs",
  registry: Github,
  currentVersion: "0.1.2",
  updateCheckInterval: 0,
});

await notifier.checkForUpdates();
notifier.notify();
