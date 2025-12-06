import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "https://school-bos-backend.onrender.com/schoolApp/";

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

export default function TransportMain() {
  const [buses, setBuses] = useState<Bus[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as Bus[]) : [];
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(buses));
  }, [buses]);

  // Fetch buses from backend (refactored so it can be called on demand)
  useEffect(() => {
    let mounted = true;

    const fetchBuses = async () => {
      try {
        const res = await axios.get(`${API_BASE}buses/`);
        const data = res.data;
        if (!mounted) return;

        const mapped: Bus[] = (Array.isArray(data) ? data : []).map((b: any) => ({
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
        }));

        setBuses(mapped);
        localStorage.setItem(LS_KEY, JSON.stringify(mapped));
      } catch (err: any) {
        // If network error or server unreachable, keep using localStorage fallback
        // eslint-disable-next-line no-console
        console.error("TransportMain: failed to fetch buses", err?.message ?? err, err?.response?.data ?? err?.response);
      }
    };

    // initial load
    fetchBuses();

    // add a window-level listener so other pages/components can trigger a refresh
    const onBusesUpdated = () => {
      // eslint-disable-next-line no-console
      console.debug("TransportMain: transport-buses-updated event received — refreshing list");
      fetchBuses();
    };

    window.addEventListener("transport-buses-updated", onBusesUpdated as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener("transport-buses-updated", onBusesUpdated as EventListener);
    };
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this bus?")) return;

    (async () => {
      try {
        await axios.delete(`${API_BASE}buses/${id}/delete/`);
        setBuses((prev) => prev.filter((b) => b.id !== id));
        // update local cache
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          try {
            const arr: Bus[] = JSON.parse(raw);
            const updated = arr.filter((x) => x.id !== id);
            localStorage.setItem(LS_KEY, JSON.stringify(updated));
          } catch {}
        }
      } catch (err: any) {
        // If delete API fails, fall back to local removal but log the error
        // eslint-disable-next-line no-console
        console.error("TransportMain: failed to delete bus via API", err?.message ?? err, err?.response?.data ?? err?.response);
        // fallback
        setBuses((prev) => prev.filter((b) => b.id !== id));
      }
    })();
  };

  // ✅ Role based logic
  const userRole = localStorage.getItem("userRole") || "teacher"; // teacher/admin

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">🚌 Transport — Bus Management</h1>

        {/* Only admin can see Add button */}
        {userRole === "admin" && (
          <button
            onClick={() => navigate("/transport/add-bus")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Bus
          </button>
        )}
      </div>

      {/* Bus Cards */}
      {buses.length === 0 ? (
        <div className="text-gray-500">No buses added yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buses.map((b) => (
            <div key={b.id} className="bg-white shadow rounded-xl p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{b.busNumber}</h3>
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    b.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {b.status}
                </span>
              </div>

              <p className="text-sm mt-2">
                <strong>Driver:</strong> {b.driverName}
              </p>
              <p className="text-sm">
                <strong>Contact No:</strong> {b.driverPhone}
              </p>
              <p className="text-sm">
                <strong>Capacity:</strong> {b.capacity}
              </p>

              {/* Route Button - everyone can view */}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => navigate(`/transport/route/${b.id}`)}
                  className="px-2 py-2 rounded-md text-blue-700 border hover:bg-blue-50"
                >
                  👀 View Routes
                </button>
              </div>

              {/* Actions - only admin */}
              {userRole === "admin" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => navigate(`/transport/add-bus?id=${b.id}`)}
                    className="px-3 py-1 rounded-md text-yellow-700 border hover:bg-yellow-50"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="px-3 py-1 rounded-md text-red-700 border hover:bg-red-50"
                  >
                    🗑 Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}