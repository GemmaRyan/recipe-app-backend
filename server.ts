import { app } from "./src/index";
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
//   .catch((error) => {
//   console.error("Failed to initialize database:", error);
//   process.exit(1); )
