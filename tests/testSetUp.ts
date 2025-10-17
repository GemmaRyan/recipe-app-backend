beforeAll(async () => {
  console.log('Running bofore all')
  console.log = () => {};
});
afterAll(async () => {
  console.log = console.log;
});
