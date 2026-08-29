import { redirect } from "next/navigation";
import { PRODUCT_PATH } from "@/lib/product-path";

/** Legacy multi-arm generation library — retired in favor of Job + Content Item model. */
export default function GenerationsRedirectPage() {
  redirect(PRODUCT_PATH.library);
}
