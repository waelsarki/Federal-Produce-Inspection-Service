import Link from "next/link";
import { QuickLink } from "@/lib/quicklinks";

/** Renders one directory entry. Every destination is a page inside this portal. */
export default function QuickLinkItem({ link, showDescription = false }: { link: QuickLink; showDescription?: boolean }) {
  return (
    <Link className="quicklink" href={link.href}>
      <span className="quicklink-label">
        {link.label}
        <i aria-hidden="true">↗</i>
      </span>
      {showDescription && link.description ? <small>{link.description}</small> : null}
    </Link>
  );
}
