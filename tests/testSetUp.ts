import { initDb } from "../src/database";
import { closeDb } from "../src/database";

beforeAll(async () => {
  console.log('Running bofore all')
  console.log = () => {};
  await initDb(); // importing our database to be tested
});
afterAll(async () => {
  console.log = console.log;
});


closeDb(); // closing the database connection after tests are done