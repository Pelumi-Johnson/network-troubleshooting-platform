"use client";

type DeviceType = "pc" | "switch" | "router";

type DeviceState = {
  type: DeviceType;
  network?: {
    ip: string;
    mask: string;
    gateway: string;
    dns?: string;
  };
  interfaces?: Record<
    string,
    {
      ip?: string;
      mask?: string;
      status: "up" | "down";
      vlan?: string;
    }
  >;
  ports?: Record<
    string,
    {
      status: "up" | "down";
    }
  >;
};

type TopologyDevice = {
  id: string;
  label: string;
  type: DeviceType;
  position: {
    x: number;
    y: number;
  };
};

type TopologyLink = {
  id: string;
  from: string;
  to: string;
};

type Topology = {
  devices: TopologyDevice[];
  links: TopologyLink[];
};

type Props = {
  deviceId: string;
  setDeviceId: (id: string) => void;
  devices: Record<string, DeviceState> | undefined;
  topology: Topology | undefined;
  getDeviceHealth: (id: string) => string;
};

const fallbackPositions: Record<string, { x: number; y: number }> = {
  pc1: { x: 150, y: 120 },
  pc2: { x: 150, y: 280 },
  sw1: { x: 360, y: 200 },
  r1: { x: 560, y: 200 },
};

const VIEWBOX_WIDTH = 700;
const VIEWBOX_HEIGHT = 460;

const SAFE_LEFT = 140;
const SAFE_RIGHT = 560;
const SAFE_TOP = 130;
const SAFE_BOTTOM = 330;

function getDeviceAccent(type: DeviceType) {
  if (type === "pc") {
    return {
      border: "border-blue-500/40",
      activeBorder: "border-blue-300",
      glow: "shadow-[0_0_34px_rgba(59,130,246,0.25)]",
      label: "text-blue-300",
      icon: "text-blue-300",
      bg: "from-blue-950/90 via-slate-950 to-slate-950",
    };
  }

  if (type === "switch") {
    return {
      border: "border-violet-500/40",
      activeBorder: "border-violet-300",
      glow: "shadow-[0_0_34px_rgba(139,92,246,0.25)]",
      label: "text-violet-300",
      icon: "text-violet-300",
      bg: "from-violet-950/90 via-slate-950 to-slate-950",
    };
  }

  return {
    border: "border-rose-500/40",
    activeBorder: "border-rose-300",
    glow: "shadow-[0_0_34px_rgba(244,63,94,0.25)]",
    label: "text-rose-300",
    icon: "text-rose-300",
    bg: "from-rose-950/90 via-slate-950 to-slate-950",
  };
}

function getHealthStyle(health: string) {
  if (health === "fixed") {
    return {
      dot: "bg-green-400",
      text: "text-green-400",
      ring: "shadow-[0_0_26px_rgba(34,197,94,0.45)]",
      link: "rgb(34 197 94)",
      linkSoft: "rgba(34,197,94,0.22)",
      label: "Fixed",
    };
  }

  if (health === "broken") {
    return {
      dot: "bg-red-400",
      text: "text-red-400",
      ring: "shadow-[0_0_26px_rgba(248,113,113,0.45)]",
      link: "rgb(248 113 113)",
      linkSoft: "rgba(248,113,113,0.22)",
      label: "Fault",
    };
  }

  return {
    dot: "bg-slate-500",
    text: "text-slate-400",
    ring: "",
    link: "rgb(100 116 139)",
    linkSoft: "rgba(100,116,139,0.18)",
    label: "Normal",
  };
}

function DeviceGlyph({ type }: { type: DeviceType }) {
  if (type === "pc") {
    return (
      <svg viewBox="0 0 64 64" className="h-11 w-11">
        <rect
          x="9"
          y="11"
          width="46"
          height="31"
          rx="5"
          fill="currentColor"
          opacity="0.18"
        />
        <rect
          x="14"
          y="16"
          width="36"
          height="21"
          rx="2"
          fill="currentColor"
          opacity="0.58"
        />
        <rect
          x="27"
          y="44"
          width="10"
          height="6"
          fill="currentColor"
          opacity="0.45"
        />
        <rect
          x="20"
          y="51"
          width="24"
          height="4"
          rx="2"
          fill="currentColor"
          opacity="0.75"
        />
      </svg>
    );
  }

  if (type === "switch") {
    return (
      <svg viewBox="0 0 64 64" className="h-11 w-11">
        <rect
          x="7"
          y="18"
          width="50"
          height="28"
          rx="5"
          fill="currentColor"
          opacity="0.2"
        />
        {[14, 25, 36].map((x) => (
          <rect
            key={x}
            x={x}
            y="25"
            width="8"
            height="5"
            rx="1"
            fill="currentColor"
            opacity="0.75"
          />
        ))}
        {[14, 25].map((x) => (
          <rect
            key={x}
            x={x}
            y="35"
            width="8"
            height="5"
            rx="1"
            fill="currentColor"
            opacity="0.55"
          />
        ))}
        <circle cx="49" cy="37" r="3" fill="currentColor" opacity="0.85" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="h-11 w-11">
      <rect
        x="12"
        y="18"
        width="40"
        height="28"
        rx="7"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M22 32h20M32 22v20M23 23l18 18M41 23L23 41"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

function getTopologyDevices(
  devices: Record<string, DeviceState> | undefined,
  topology: Topology | undefined
): TopologyDevice[] {
  if (topology?.devices?.length) {
    return topology.devices.filter((topologyDevice) =>
      Boolean(devices?.[topologyDevice.id])
    );
  }

  return Object.entries(devices || {}).map(([id, device]) => ({
    id,
    label: id.toUpperCase(),
    type: device.type,
    position: fallbackPositions[id] || { x: 350, y: 230 },
  }));
}

function getTopologyLinks(
  devices: Record<string, DeviceState> | undefined,
  topology: Topology | undefined
): TopologyLink[] {
  if (topology?.links?.length) {
    return topology.links.filter(
      (link) => Boolean(devices?.[link.from]) && Boolean(devices?.[link.to])
    );
  }

  const links: TopologyLink[] = [];

  if (devices?.pc1 && devices?.sw1) {
    links.push({ id: "pc1-sw1", from: "pc1", to: "sw1" });
  }

  if (devices?.pc2 && devices?.sw1) {
    links.push({ id: "pc2-sw1", from: "pc2", to: "sw1" });
  }

  if (devices?.sw1 && devices?.r1) {
    links.push({ id: "sw1-r1", from: "sw1", to: "r1" });
  }

  if (devices?.pc1 && devices?.r1 && !devices?.sw1) {
    links.push({ id: "pc1-r1", from: "pc1", to: "r1" });
  }

  return links;
}

function scalePositions(topologyDevices: TopologyDevice[]) {
  if (topologyDevices.length === 0) return {};

  const xs = topologyDevices.map((device) => device.position.x);
  const ys = topologyDevices.map((device) => device.position.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const xRange = maxX - minX;
  const yRange = maxY - minY;

  const safeWidth = SAFE_RIGHT - SAFE_LEFT;
  const safeHeight = SAFE_BOTTOM - SAFE_TOP;

  const positionMap: Record<string, { x: number; y: number }> = {};

  for (const topologyDevice of topologyDevices) {
    const scaledX =
      xRange === 0
        ? VIEWBOX_WIDTH / 2
        : SAFE_LEFT + ((topologyDevice.position.x - minX) / xRange) * safeWidth;

    const scaledY =
      yRange === 0
        ? VIEWBOX_HEIGHT / 2
        : SAFE_TOP + ((topologyDevice.position.y - minY) / yRange) * safeHeight;

    positionMap[topologyDevice.id] = {
      x: scaledX,
      y: scaledY,
    };
  }

  return positionMap;
}

function normalizePosition(position: { x: number; y: number }) {
  return {
    left: `${(position.x / VIEWBOX_WIDTH) * 100}%`,
    top: `${(position.y / VIEWBOX_HEIGHT) * 100}%`,
  };
}

function getLinkHealth(
  link: TopologyLink,
  devices: Record<string, DeviceState> | undefined,
  getDeviceHealth: (id: string) => string
) {
  const fromHealth = getDeviceHealth(link.from);
  const toHealth = getDeviceHealth(link.to);

  if (fromHealth === "broken" || toHealth === "broken") return "broken";
  if (fromHealth === "fixed" || toHealth === "fixed") return "fixed";

  const fromDevice = devices?.[link.from];
  const toDevice = devices?.[link.to];

  if (!fromDevice || !toDevice) return "normal";

  return "normal";
}

function getLinkLabel(link: TopologyLink) {
  const pair = `${link.from}-${link.to}`;

  const labels: Record<string, string> = {
    "pc1-sw1": "eth0 ⇄ f0/1",
    "pc2-sw1": "eth0 ⇄ f0/2",
    "sw1-r1": "f0/24 ⇄ g0/0",
    "pc1-r1": "eth0 ⇄ g0/0",
    "sw1-pc1": "f0/1 ⇄ eth0",
    "sw1-pc2": "f0/2 ⇄ eth0",
    "r1-sw1": "g0/0 ⇄ f0/24",
    "r1-pc1": "g0/0 ⇄ eth0",
  };

  return labels[pair] || "link";
}

export function TopologyPanel({
  deviceId,
  setDeviceId,
  devices,
  topology,
  getDeviceHealth,
}: Props) {
  const topologyDevices = getTopologyDevices(devices, topology);
  const topologyLinks = getTopologyLinks(devices, topology);
  const positionMap = scalePositions(topologyDevices);

  return (
    <section className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Network Topology</h2>
          <p className="text-xs text-slate-500 mt-1">
            Click a device to bind the terminal to that node.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.7)]" />
            Fault
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.7)]" />
            Fixed
          </span>
        </div>
      </div>

      <div className="relative min-h-[560px] rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,64,175,0.16),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[size:32px_32px]" />

        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="absolute inset-0 h-full w-full pointer-events-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter
              id="topologyGlow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {topologyLinks.map((link) => {
            const start = positionMap[link.from];
            const end = positionMap[link.to];

            if (!start || !end) return null;

            const health = getLinkHealth(link, devices, getDeviceHealth);
            const healthStyle = getHealthStyle(health);
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;

            return (
              <g key={link.id}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="rgb(2 6 23)"
                  strokeWidth="13"
                  strokeLinecap="round"
                />

                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={healthStyle.linkSoft}
                  strokeWidth="8"
                  strokeLinecap="round"
                  filter="url(#topologyGlow)"
                />

                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={healthStyle.link}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={health === "broken" ? "8 8" : "12 10"}
                  opacity={health === "normal" ? 0.75 : 1}
                />

                <circle cx={start.x} cy={start.y} r="5" fill={healthStyle.link} />
                <circle cx={end.x} cy={end.y} r="5" fill={healthStyle.link} />

                <g>
                  <rect
                    x={midX - 48}
                    y={midY - 12}
                    width="96"
                    height="24"
                    rx="10"
                    fill="rgba(15,23,42,0.92)"
                    stroke="rgba(100,116,139,0.45)"
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fill="rgb(203,213,225)"
                    style={{ fontFamily: "monospace" }}
                  >
                    {getLinkLabel(link)}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {topologyDevices.map((topologyDevice) => {
          const device = devices?.[topologyDevice.id];

          if (!device) return null;

          const health = getDeviceHealth(topologyDevice.id);
          const selected = deviceId === topologyDevice.id;
          const accent = getDeviceAccent(device.type);
          const healthStyle = getHealthStyle(health);
          const rawPosition = positionMap[topologyDevice.id];

          if (!rawPosition) return null;

          const position = normalizePosition(rawPosition);
          const label = topologyDevice.label || topologyDevice.id.toUpperCase();

          return (
            <button
              key={topologyDevice.id}
              type="button"
              onClick={() => setDeviceId(topologyDevice.id)}
              className={`absolute w-36 h-28 rounded-3xl border bg-gradient-to-br ${accent.bg} ${accent.border} ${accent.glow} ${healthStyle.ring} transition-all duration-200 flex flex-col items-center justify-center hover:-translate-y-1 hover:scale-[1.02]`}
              style={{
                left: position.left,
                top: position.top,
                transform: "translate(-50%, -50%)",
              }}
            >
              <span
                className={`pointer-events-none absolute inset-0 rounded-3xl border-2 ${
                  selected ? accent.activeBorder : "border-transparent"
                }`}
              />

              <div
                className={`absolute right-3 top-3 h-2.5 w-2.5 rounded-full ${healthStyle.dot}`}
              />

              <div className={accent.icon}>
                <DeviceGlyph type={device.type} />
              </div>

              <div className="mt-1 flex items-center gap-2">
                <span className={`text-sm font-black ${accent.label}`}>
                  {label}
                </span>
              </div>

              <div className={`text-[11px] mt-0.5 ${healthStyle.text}`}>
                {health === "normal" || health === "hidden"
                  ? device.type.toUpperCase()
                  : healthStyle.label}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
        <p>
          Active console:{" "}
          <span className="font-bold text-white">{deviceId.toUpperCase()}</span>
        </p>
        <p className="text-slate-500">
          Interface labels are rendered from topology links.
        </p>
      </div>
    </section>
  );
}

export default TopologyPanel;