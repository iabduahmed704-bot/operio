import Image from "next/image";

export function Logo({ height = 28 }: { height?: number }) {
  const width = Math.round(height * (1774 / 887));

  return (
    <span className="inline-flex items-center" style={{ height }}>
      <Image
        src="/logo-light.png"
        alt="Operio"
        width={width}
        height={height}
        priority
        className="logo-light"
        style={{ height, width: "auto" }}
      />
      <Image
        src="/logo-dark.png"
        alt="Operio"
        width={width}
        height={height}
        priority
        className="logo-dark"
        style={{ height, width: "auto" }}
      />
    </span>
  );
}
