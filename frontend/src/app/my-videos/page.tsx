import { redirect } from "next/navigation";
import { PRODUCT_PATH } from "@/lib/product-path";

/** Legacy user video CRUD — retired; library holds Content Items. */
export default function MyVideosRedirectPage() {
  redirect(PRODUCT_PATH.library);
}
