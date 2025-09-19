import { config as dotenv } from "dotenv";
dotenv({ path: ".env.local" }); // ensure env is loaded when run stand-alone

import { ensureIndexes } from "./indexes";

ensureIndexes()
    .then(() => {
        console.log("Indexes created ✅");
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
