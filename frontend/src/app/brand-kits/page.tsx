import { redirect } from "next/navigation";
import { PRODUCT_PATH } from "@/lib/product-path";

/** Former Brand Kit route — Business DNA is the create/edit path. */
export default function BrandKitsRedirectPage() {
  redirect(PRODUCT_PATH.businessDna);
}
