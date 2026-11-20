import "server-only";
import { redirect } from "next/navigation";
import { currentStaff } from "./index";
export async function requirePageStaff() {
  const staff = await currentStaff();
  if (!staff?.active) redirect("/admin/login");
  return staff;
}
