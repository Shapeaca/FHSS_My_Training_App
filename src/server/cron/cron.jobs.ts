import { CronJob } from "cron";
import { cleanJwtBlacklist } from "./jobs/sys/clean-jwt";

export const cronJobs: CronJob[] = [
  cleanJwtBlacklist,
];