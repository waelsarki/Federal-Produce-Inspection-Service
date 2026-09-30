import Link from "next/link";
import { FPIS_QUICK_LINK_GROUPS } from "@/lib/quicklinks";

/**
 * Header mega-menu holding the whole site directory, so every section of the
 * service is reachable from the navigation without a separate link per group.
 */
export default function QuickLinksMenu() {
  return (
    <li className="nav-dropdown">
      <Link className="nav-dropdown-trigger" href="/quick-links">
        Quick links <span className="nav-caret" aria-hidden="true">▾</span>
      </Link>
      <div className="nav-dropdown-panel">
        <div className="nav-panel-head">
          <p className="eyebrow">SITE DIRECTORY</p>
          <p>Every section of the Federal Produce Inspection Service, open inside this portal.</p>
          <Link className="text-link" href="/information">Information centre →</Link>
        </div>
        <div className="nav-panel-groups">
          {FPIS_QUICK_LINK_GROUPS.map((group) => (
            <div className="nav-panel-group" key={group.label}>
              <h3>{group.label}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}><Link className="nav-link" href={link.href}>{link.label}</Link></li>
                ))}
                {group.sections.map((section) => (
                  <div className="nav-panel-sub" key={section.label}>
                    <h4>{section.label}</h4>
                    <ul>
                      {section.links.map((link) => (
                        <li key={link.label}><Link className="nav-link" href={link.href}>{link.label}</Link></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </li>
  );
}