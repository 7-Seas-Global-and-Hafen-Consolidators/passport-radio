import { handleRequest } from "./logic.js";

Deno.serve((req: Request) => handleRequest(req, {
  env: {
    SUPABASE_URL: Deno.env.get("SUPABASE_URL") ?? "",
    SUPABASE_SERVICE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    BLOG_ABERTO_ADMIN_USER_ID: Deno.env.get("BLOG_ABERTO_ADMIN_USER_ID") ?? "",
    BLOG_ABERTO_GITHUB_TOKEN: Deno.env.get("BLOG_ABERTO_GITHUB_TOKEN") ?? "",
    GITHUB_REPOSITORY: Deno.env.get("GITHUB_REPOSITORY") ?? "7-Seas-Global-and-Hafen-Consolidators/passport-radio"
  }
}));
