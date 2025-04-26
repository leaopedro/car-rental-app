import dbClient from "./db";
import app from "./app";

async function init() {
  await dbClient.init();

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

init().catch((err) => {
  console.error("Failed to initialize app:", err);
  process.exit(1);
});
