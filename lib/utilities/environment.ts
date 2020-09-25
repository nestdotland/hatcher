export function envHOMEDIR(): string {
  return Deno.env.get("HOME") ?? // for linux / mac
    Deno.env.get("USERPROFILE") ?? // for windows
    "/";
}
