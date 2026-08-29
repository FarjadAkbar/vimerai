import { redirect } from "next/navigation";
import { PRODUCT_PATH } from "@/lib/product-path";

/** Legacy products library — inline product create retired; use Media Store. */
export default function ProductsRedirectPage() {
  redirect(PRODUCT_PATH.library);
}
