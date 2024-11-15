/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as channels from "../channels.js";
import type * as directMessages from "../directMessages.js";
import type * as friends from "../friends.js";
import type * as members from "../members.js";
import type * as messages from "../messages.js";
import type * as profiles from "../profiles.js";
import type * as reports from "../reports.js";
import type * as servers from "../servers.js";
import type * as systemMessages from "../systemMessages.js";
import type * as utils_formatDate from "../utils/formatDate.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  channels: typeof channels;
  directMessages: typeof directMessages;
  friends: typeof friends;
  members: typeof members;
  messages: typeof messages;
  profiles: typeof profiles;
  reports: typeof reports;
  servers: typeof servers;
  systemMessages: typeof systemMessages;
  "utils/formatDate": typeof utils_formatDate;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

/* prettier-ignore-end */
