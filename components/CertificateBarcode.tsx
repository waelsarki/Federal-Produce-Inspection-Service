import { encodeCode39 } from "@/lib/barcode";
import { formatVerificationCode } from "@/lib/certificate-code";

// A 0.25mm module sits comfortably above the 7.5 mil floor that handheld
// scanners need, and stating the size in millimetres keeps screen and print
// rendering the same symbol.
const MODULE_MM = 0.25;
const BAR_HEIGHT_MODULES = 36;

const NOT_ISSUED = "NOT YET ISSUED";

/**
 * The security barcode. It encodes the certificate's verification code rather
 * than its register reference, because the reference is derived from the
 * application number and so proves nothing about who issued the certificate.
 *
 * Before the certificate has been issued there is no code to encode. Rather than
 * print a symbol that looks authentic but resolves to nothing, the footer states
 * that the certificate is awaiting issue.
 */
export default function CertificateBarcode({ value, issued = true }: { value: string; issued?: boolean }) {
  if (!issued || !value) {
    return (
      <figure className="cert-barcode cert-barcode-pending">
        <div className="cert-barcode-pending-mark" aria-hidden="true">{NOT_ISSUED}</div>
        <figcaption className="cert-barcode-caption">Verification code assigned on issue</figcaption>
      </figure>
    );
  }

  const barcode = encodeCode39(value);
  const printed = formatVerificationCode(barcode.value);

  return (
    <figure className="cert-barcode">
      <svg
        className="cert-barcode-symbol"
        width={`${barcode.width * MODULE_MM}mm`}
        height={`${BAR_HEIGHT_MODULES * MODULE_MM}mm`}
        viewBox={`0 0 ${barcode.width} ${BAR_HEIGHT_MODULES}`}
        shapeRendering="crispEdges"
        role="img"
        aria-label={`Verification code ${printed}`}
      >
        <rect width={barcode.width} height={BAR_HEIGHT_MODULES} fill="#ffffff" />
        {barcode.bars.map((bar) => (
          <rect key={bar.x} x={bar.x} width={bar.width} height={BAR_HEIGHT_MODULES} fill="#101010" />
        ))}
      </svg>
      <figcaption className="cert-barcode-caption">{printed}</figcaption>
    </figure>
  );
}
