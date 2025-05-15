import { createApp } from "./routes";

const app = createApp();

export type ApiV1Type = typeof app;
export default app;
