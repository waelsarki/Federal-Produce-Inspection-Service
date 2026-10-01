import { encodeCode39 } from "@/lib/barcode";

// A 0.25mm module sits comfortably above the 7.5 mil floor that handheld
// scanners need, and stating the size in millimetres keeps screen and print
// rendering the same symbol.
const MODULE_MM = 0.25;
const BAR_HEIGHT_MODULES = 36;

export default function CertificateBarcode({ value }: { value: string }) {
  const barcode = encodeCode39(value);

  return (
    <figure className="cert-barcode">
      <svg
        className="cert-barcode-symbol"
        width={`${barcode.width * MODULE_MM}mm`}
        height={`${BAR_HEIGHT_MODULES * MODULE_MM}mm`}
        viewBox={`0 0 ${barcode.width} ${BAR_HEIGHT_MODULES}`}
        shapeRendering="crispEdges"
        role="img"
        aria-label={`Barcode for register reference ${barcode.value}`}
      >
        <rect width={barcode.width} height={BAR_HEIGHT_MODULES} fill="#ffffff" />
        {barcode.bars.map((bar) => (
          <rect key={bar.x} x={bar.x} width={bar.width} height={BAR_HEIGHT_MODULES} fill="#101010" />
        ))}
      </svg>
      <figcaption className="cert-barcode-caption">{barcode.value}</figcaption>
    </figure>
  );
}
