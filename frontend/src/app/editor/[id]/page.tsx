import { redirect } from "next/navigation";
import { PRODUCT_PATH } from "@/lib/product-path";

/** Legacy video editor — retired with user video CRUD. */
export default function EditorRedirectPage() {
  redirect(PRODUCT_PATH.library);
}
