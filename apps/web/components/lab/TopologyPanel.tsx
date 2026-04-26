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
  pc1: { x: 150, y: 95 },
  pc2: { x: 150, y: 225 },
  sw1: { x: 360, y: 160 },
  r1: { x: 560, y: 160 },
};

const VIEWBOX_WIDTH = 700;
const VIEWBOX_HEIGHT = 400;

const SAFE_LEFT = 150;
const SAFE_RIGHT = 550;
const SAFE_TOP = 110;
const SAFE_BOTTOM = 290;

function getDeviceColor(type: DeviceType) {
  if (type === "pc") return "bg-blue-700";
  if (type === "switch") return "bg-purple-700";
  return "bg-red-700";
}

function getSelectedBorder(type: DeviceType) {
  if (type === "pc") return "border-blue-300";
  if (type === "switch") return "border-purple-300";
  return "border-red-300";
}

function getDeviceIcon(type: DeviceType) {
  if (type === "pc") return "💻";
  if (type === "switch") return "🔀";
  return "📡";
}

function getDeviceGlow(health: string) {
  if (health === "fixed") {
    return "shadow-[0_0_22px_rgba(34,197,94,0.75)]";
  }

  if (health === "broken") {
    return "shadow-[0_0_22px_rgba(239,68,68,0.75)]";
  }

  return "";
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
    position: fallbackPositions[id] || { x: 350, y: 200 },
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
  if (topologyDevices.length === 0) {
    return {};
  }

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
        : SAFE_LEFT +
          ((topologyDevice.position.x - minX) / xRange) * safeWidth;

    const scaledY =
      yRange === 0
        ? VIEWBOX_HEIGHT / 2
        : SAFE_TOP +
          ((topologyDevice.position.y - minY) / yRange) * safeHeight;

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
    <section className="bg-slate-900 rounded-xl p-5 border border-slate-800">
      <h2 className="text-xl font-bold mb-4">Topology</h2>

      <div className="relative h-80 border border-slate-700 rounded-lg bg-slate-950 overflow-hidden">
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="absolute inset-0 h-full w-full pointer-events-none"
          preserveAspectRatio="xMidYMid meet"
        >
          {topologyLinks.map((link) => {
            const start = positionMap[link.from];
            const end = positionMap[link.to];

            if (!start || !end) return null;

            return (
              <line
                key={link.id}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="rgb(100 116 139)"
                strokeWidth="3"
              />
            );
          })}
        </svg>

        {topologyDevices.map((topologyDevice) => {
          const device = devices?.[topologyDevice.id];

          if (!device) return null;

          const health = getDeviceHealth(topologyDevice.id);
          const selected = deviceId === topologyDevice.id;
          const color = getDeviceColor(device.type);
          const selectedBorder = getSelectedBorder(device.type);
          const glow = getDeviceGlow(health);
          const icon = getDeviceIcon(device.type);
          const rawPosition = positionMap[topologyDevice.id];

          if (!rawPosition) return null;

          const position = normalizePosition(rawPosition);

          return (
            <button
              key={topologyDevice.id}
              type="button"
              onClick={() => setDeviceId(topologyDevice.id)}
              className={`absolute w-32 h-20 px-3 rounded-xl font-bold transition-colors flex flex-col items-center justify-center ${color} ${glow}`}
              style={{
                left: position.left,
                top: position.top,
                transform: "translate(-50%, -50%)",
              }}
            >
              {selected && (
                <span
                  className={`pointer-events-none absolute inset-0 rounded-xl border-4 ${selectedBorder}`}
                />
              )}

              <div className="leading-tight">
                {icon} {topologyDevice.label || topologyDevice.id.toUpperCase()}
              </div>

              <div className="text-xs mt-1 h-4">
                {health !== "normal" && health !== "hidden"
                  ? health === "fixed"
                    ? "Fixed"
                    : "Broken"
                  : ""}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
        <p>
          Selected:{" "}
          <span className="font-bold text-white">{deviceId.toUpperCase()}</span>
        </p>
        <p className="text-slate-500">Click a device to open its CLI</p>
      </div>
    </section>
  );
}

export default TopologyPanel;