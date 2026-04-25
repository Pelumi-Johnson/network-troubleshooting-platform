type DeviceState = {
  type: "pc" | "switch" | "router";
  network?: {
    ip: string;
    mask: string;
    gateway: string;
  };
  interfaces?: Record<string, { ip: string; status: string }>;
};

type Props = {
  deviceId: string;
  setDeviceId: (id: string) => void;
  devices: Record<string, DeviceState> | undefined;
  getDeviceHealth: (id: string) => string;
};

export function TopologyPanel({
  deviceId,
  setDeviceId,
  devices,
  getDeviceHealth,
}: Props) {
  const hasSwitch = Boolean(devices?.sw1);
  const hasPc2 = Boolean(devices?.pc2);

  // 👉 SHIFTED TOWARD CENTER
  const devicePositions: Record<string, { left: string; top: string }> =
    hasSwitch
      ? {
          pc1: { left: "25%", top: "30%" },
          pc2: { left: "25%", top: "70%" },
          sw1: { left: "55%", top: "50%" },
          r1: { left: "80%", top: "50%" },
        }
      : {
          pc1: { left: "30%", top: "50%" },
          r1: { left: "70%", top: "50%" },
        };

  const deviceEntries = Object.entries(devices || {});

  return (
    <section className="bg-slate-900 rounded-xl p-5 border border-slate-800">
      <h2 className="text-xl font-bold mb-4">Topology</h2>

      <div className="relative h-80 border border-slate-700 rounded-lg bg-slate-950 overflow-hidden">
        {hasSwitch ? (
          <>
            <div className="absolute left-[33%] top-[30%] w-[22%] h-[2px] bg-slate-500" />
            {hasPc2 && (
              <div className="absolute left-[33%] top-[70%] w-[22%] h-[2px] bg-slate-500" />
            )}
            {hasPc2 && (
              <div className="absolute left-[55%] top-[30%] w-[2px] h-[40%] bg-slate-500" />
            )}
            <div className="absolute left-[55%] top-[50%] w-[25%] h-[2px] bg-slate-500" />
          </>
        ) : (
          <div className="absolute left-[30%] top-[50%] w-[40%] h-[2px] bg-slate-500" />
        )}

        {deviceEntries.map(([id, device]) => {
          const health = getDeviceHealth(id);
          const position = devicePositions[id] || { left: "50%", top: "50%" };

          const color =
            device.type === "pc"
              ? "bg-blue-700"
              : device.type === "switch"
              ? "bg-purple-700"
              : "bg-red-700";

          const ring =
            deviceId === id
              ? device.type === "pc"
                ? "ring-4 ring-blue-400"
                : device.type === "switch"
                ? "ring-4 ring-purple-400"
                : "ring-4 ring-red-400"
              : "";

          const glow =
            health === "fixed"
              ? "shadow-[0_0_20px_rgba(34,197,94,0.8)]"
              : health === "broken"
              ? "shadow-[0_0_20px_rgba(239,68,68,0.8)]"
              : "";

          const icon =
            device.type === "pc"
              ? "💻"
              : device.type === "switch"
              ? "🔀"
              : "📡";

          return (
            <button
              key={id}
              onClick={() => setDeviceId(id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-32 p-4 rounded-xl font-bold ${color} ${ring} ${glow}`}
              style={{
                left: position.left,
                top: position.top,
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