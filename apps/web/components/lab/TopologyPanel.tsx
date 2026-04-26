type DeviceState = {
  type: "pc" | "switch" | "router";
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
};

type Props = {
  deviceId: string;
  setDeviceId: (id: string) => void;
  devices: Record<string, DeviceState> | undefined;
  getDeviceHealth: (id: string) => string;
};

const twoPcPositions: Record<string, { x: number; y: number }> = {
  pc1: { x: 150, y: 95 },
  pc2: { x: 150, y: 225 },
  sw1: { x: 360, y: 160 },
  r1: { x: 560, y: 160 },
};

const onePcPositions: Record<string, { x: number; y: number }> = {
  pc1: { x: 170, y: 160 },
  sw1: { x: 360, y: 160 },
  r1: { x: 550, y: 160 },
};

function getPositions(devices: Record<string, DeviceState> | undefined) {
  const hasPc1 = Boolean(devices?.pc1);
  const hasPc2 = Boolean(devices?.pc2);
  const hasSw1 = Boolean(devices?.sw1);
  const hasR1 = Boolean(devices?.r1);

  if (hasPc1 && !hasPc2 && hasSw1 && hasR1) {
    return onePcPositions;
  }

  return twoPcPositions;
}

function getDeviceColor(type: DeviceState["type"]) {
  if (type === "pc") return "bg-blue-700";
  if (type === "switch") return "bg-purple-700";
  return "bg-red-700";
}

function getDeviceRing(type: DeviceState["type"]) {
  if (type === "pc") return "ring-4 ring-blue-400";
  if (type === "switch") return "ring-4 ring-purple-400";
  return "ring-4 ring-red-400";
}

function getDeviceIcon(type: DeviceState["type"]) {
  if (type === "pc") return "💻";
  if (type === "switch") return "🔀";
  return "📡";
}

function getDeviceGlow(health: string) {
  if (health === "fixed") {
    return "shadow-[0_0_24px_rgba(34,197,94,0.85)]";
  }

  if (health === "broken") {
    return "shadow-[0_0_24px_rgba(239,68,68,0.85)]";
  }

  return "";
}

function buildLinks(devices: Record<string, DeviceState> | undefined) {
  const hasPc1 = Boolean(devices?.pc1);
  const hasPc2 = Boolean(devices?.pc2);
  const hasSw1 = Boolean(devices?.sw1);
  const hasR1 = Boolean(devices?.r1);

  const links: Array<[string, string]> = [];

  if (hasPc1 && hasSw1) links.push(["pc1", "sw1"]);
  if (hasPc2 && hasSw1) links.push(["pc2", "sw1"]);
  if (hasSw1 && hasR1) links.push(["sw1", "r1"]);
  if (hasPc1 && hasR1 && !hasSw1) links.push(["pc1", "r1"]);

  return links;
}

export function TopologyPanel({
  deviceId,
  setDeviceId,
  devices,
  getDeviceHealth,
}: Props) {
  const deviceEntries = Object.entries(devices || {});
  const positions = getPositions(devices);
  const links = buildLinks(devices);

  return (
    <section className="bg-slate-900 rounded-xl p-5 border border-slate-800">
      <h2 className="text-xl font-bold mb-4">Topology</h2>

      <div className="relative h-80 border border-slate-700 rounded-lg bg-slate-950 overflow-hidden">
        <svg
          viewBox="0 0 700 320"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {links.map(([from, to]) => {
            const start = positions[from];
            const end = positions[to];

            if (!start || !end) return null;

            return (
              <line
                key={`${from}-${to}`}
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

        {deviceEntries.map(([id, device]) => {
          const health = getDeviceHealth(id);
          const position = positions[id] || { x: 350, y: 160 };

          const color = getDeviceColor(device.type);
          const ring = deviceId === id ? getDeviceRing(device.type) : "";
          const glow = getDeviceGlow(health);
          const icon = getDeviceIcon(device.type);

          return (
            <button
              key={id}
              type="button"
              onClick={() => setDeviceId(id)}
              className={`absolute w-32 p-4 rounded-xl font-bold transition ${color} ${ring} ${glow}`}
              style={{
                left: `${(position.x / 700) * 100}%`,
                top: `${(position.y / 320) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div>
                {icon} {id.toUpperCase()}
              </div>

              {health !== "normal" && health !== "hidden" && (
                <div className="text-xs mt-1">
                  {health === "fixed" ? "Fixed" : "Broken"}
                </div>
              )}
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