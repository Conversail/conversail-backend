import app from "./server";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

app.listen(process.env.PORT);

console.log(`Server running on http://localhost:${process.env.PORT}`);
