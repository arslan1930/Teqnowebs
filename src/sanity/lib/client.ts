import { createClient } from "@sanity/client";
import { apiVersion, dataset, hasSanityConfig, projectId } from "../env";

export const client = hasSanityConfig
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null;
