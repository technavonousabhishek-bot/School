import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://school-bos-backend.onrender.comschoolApp/";

type Stop = {
  id: string;
  name: string;
  arrivalTime: string;
  departureTime: string;
};

type Bus = {
  id: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  status: "active" | "maintenance";
  route: {
    start: string;
    startDeparture: string;
    stops: Stop[];
    end: string;
    endArrival: string;
  };
  addedDate: string;
};

const LS_KEY = "transport_buses_v5";

export default function BusRouteDetails() {
  const params = useParams();
  // accept either `busId` or `id` depending on route setup
  const busId = (params as any).busId ?? (params as any).id;
  const navigate = useNavigate();
  const [bus, setBus] = useState<Bus | null>(null);

  useEffect(() => {
    if (!busId) return;

    const url = `${API_BASE}buses/${busId}/`;
    // debug: log param and URL so we can confirm a request will be made
    // eslint-disable-next-line no-console
    console.debug("BusRouteDetail: fetching", { busId, url });

    (async () => {
      try {
        const res = await axios.get(url);
        const b = res.data;
        const mapped: Bus = {
          id: String(b.id),
          busNumber: b.busNumber ?? "",
          driverName: b.driverName ?? "",
          driverPhone: b.driverPhone ?? "",
          capacity: typeof b.capacity === "number" ? b.capacity : Number(b.capacity) || 0,
          status: b.status ?? "active",
          route: {
            start: b.start ?? (b.route?.start ?? ""),
            startDeparture: b.startDeparture ?? (b.route?.startDeparture ?? ""),
            stops: b.stops ?? (b.route?.stops ?? []),
            end: b.end ?? (b.route?.end ?? ""),
            endArrival: b.endArrival ?? (b.route?.endArrival ?? ""),
          },
          addedDate: b.addedDate ?? b.added_date ?? "",
        };
        setBus(mapped);
      } catch (err: any) {
        // network or CORS error will be visible in browser console; log details
        // eslint-disable-next-line no-console
        console.error("BusRouteDetail: failed to fetch", { url, error: err?.message ?? err, response: err?.response });

        // fallback to localStorage for offline/debugging
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          try {
            const all: Bus[] = JSON.parse(raw);
            const found = all.find((b) => b.id === busId );
            setBus(found ?? null);
          } catch (e) {
            setBus(null);
          }
        } else {
          setBus(null);
        }
      }
    })();
  }, [busId]);

  if (!bus) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-medium mb-2">Bus Not Found</h2>
        <button
          onClick={() => navigate("/transport")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          ← Back to Transport
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">🚌 {bus.busNumber} — Route Details</h1>
        <button
          onClick={() => navigate("/transport")}
          className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-5 00"
        >
          ✖ Close
        </button>
      </div>

      {/* Bus Info */}
      <div className="bg-white shadow-md rounded-xl p-5 mb-6">
        <p><strong>Driver:</strong> {bus.driverName}</p>
        <p><strong>Phone:</strong> {bus.driverPhone}</p>
        <p><strong>Capacity:</strong> {bus.capacity}</p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={`px-2 py-1 rounded ${
              bus.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {bus.status}
          </span>
        </p>
      </div>

      {/* Route Info */}
      <div className="bg-white shadow-md rounded-xl p-5">
        <h2 className="text-lg font-medium mb-3">🗺 Route Timeline</h2>
        <div className="border-l-4 border-blue-600 pl-4">
          {/* Start */}
          <div className="mb-4">
            <h3 className="font-semibold">{bus.route.start}</h3>
            <p className="text-sm text-gray-600">
              Departure: {bus.route.startDeparture || "--:--"}
            </p>
          </div>

          {/* Stops */}
          {bus.route.stops.length > 0 ? (
            bus.route.stops.map((s, i) => (
              <div key={s.id} className="mb-4 pl-3 border-l border-gray-300">
                <h4 className="font-medium">
                  🏁 Stop {i + 1}: {s.name || "Unnamed Stop"}
                </h4>
                <p className="text-sm text-gray-600">
                  Arrival: {s.arrivalTime || "--:--"} | Departure:{" "}
                  {s.departureTime || "--:--"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No stops added.</p>
          )}

          {/* End */}
          <div className="mt-4">
            <h3 className="font-semibold">{bus.route.end}</h3>
            <p className="text-sm text-gray-600">
              Arrival: {bus.route.endArrival || "--:--"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
