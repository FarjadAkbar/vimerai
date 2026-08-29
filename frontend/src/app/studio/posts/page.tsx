import { redirect } from "next/navigation";
import { PRODUCT_PATH } from "@/lib/product-path";

/** Legacy Make a Post route — post jobs retired; Blitz is the create path. */
export default function StudioPostsRedirectPage() {
  redirect(PRODUCT_PATH.blitz);
}
