import { exec } from "node:child_process";
import watch from "node-watch";

const run = () => {
  console.info("🛠  Compiling & Deploying...");
  exec("yarn deploy", (error, stdout, stderr) => {
    console.info(stdout);
    if (error) console.info(error);
    if (stderr) console.info(stderr);
  });
};

console.info("🔬 Watching Contracts...");

watch("./contracts", { recursive: true }, (name) => {
  console.info("%s changed.", name);
  run();
});

run();
