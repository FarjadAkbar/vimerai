import { redirect } from "next/navigation";
import { PRODUCT_PATH } from "@/lib/product-path";

/** Legacy generation detail — retired in favor of Content Items in Library. */
export default function GenerationDetailRedirectPage() {
  redirect(PRODUCT_PATH.library);
}
