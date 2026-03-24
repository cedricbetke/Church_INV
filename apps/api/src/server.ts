import { loadEnv } from "./config/loadEnv";
import { app } from "./app";

loadEnv();

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`Server laeuft auf Port ${PORT}`);
});
