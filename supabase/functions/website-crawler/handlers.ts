
import { corsHeaders } from "./config.ts";
import { processRequestSync } from "./sync-processor.ts";
import { handleBackgroundJob } from "./job-handler.ts";

export { processRequestSync, handleBackgroundJob };
