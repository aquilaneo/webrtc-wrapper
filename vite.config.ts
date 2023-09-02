import { defineConfig } from "vite"
import fs from "fs"

export default defineConfig({
    server: {
        https: {
            key: fs.readFileSync("./pem/localhost-key.pem"),
            cert: fs.readFileSync("./pem/localhost.pem"),
        }
    },
});
