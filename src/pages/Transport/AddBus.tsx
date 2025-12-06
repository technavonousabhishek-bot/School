import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "https://school-bos-backend.onrender.comschoolApp/";

type Stop = {
  id: string;
  name: string;
  arrivalTime: string;
  departureTime: string;
};
 

// 24-hour time regex HH:MM
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export default function AddBus() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("id");

  // we will use backend APIs for create/update/list; no localStorage list here

  const [busNumber, setBusNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [status, setStatus] = useState<"active" | "maintenance">("active");
  const [start, setStart] = useState("");
  const [startDeparture, setStartDeparture] = useState("");
  const [end, setEnd] = useState("");
  const [endArrival, setEndArrival] = useState("");
  const [stops, setStops] = useState<Stop[]>([]);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [aadhaarNameState, setAadhaarNameState] = useState<string | undefined>(undefined);
  const [aadhaarDataState, setAadhaarDataState] = useState<string | undefined>(undefined);
  const [licenseNameState, setLicenseNameState] = useState<string | undefined>(undefined);
  const [licenseDataState, setLicenseDataState] = useState<string | undefined>(undefined);

  // file refs
  const aadhaarInputRef = useRef<HTMLInputElement | null>(null);
  const licenseInputRef = useRef<HTMLInputElement | null>(null);

  // time refs (DOM fallback & focus)
  const startDepRef = useRef<HTMLInputElement | null>(null);
  const endArrRef = useRef<HTMLInputElement | null>(null);

  // other refs for auto-focusing fields (all allow null)
  const busNumberRef = useRef<HTMLInputElement | null>(null);
  const driverRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const capacityRef = useRef<HTMLInputElement | null>(null);
  const startRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editId) {
      // fetch existing bus from backend
      axios
        .get(`${API_BASE}buses/${editId}/`)
        .then((res) => {
          const b = res.data;
          setBusNumber(b.busNumber ?? "");
          setDriverName(b.driverName ?? "");
          setDriverPhone(b.driverPhone ?? "");
          setCapacity(typeof b.capacity === "number" ? b.capacity : "");
          setStatus(b.status ?? "active");
          setStart(b.start ?? "");
          setStartDeparture(b.startDeparture ?? "");
          setEnd(b.end ?? "");
          setEndArrival(b.endArrival ?? "");
          setStops(b.stops ?? []);
          // files (if backend returns URLs)
          if (b.aadhaarFile) {
            setAadhaarNameState(String(b.aadhaarFile).split("/").pop());
            setAadhaarDataState(b.aadhaarFile);
          } else {
            setAadhaarNameState(b.aadhaarName ?? undefined);
            setAadhaarDataState(b.aadhaarData ?? undefined);
          }
          if (b.licenseFile) {
            setLicenseNameState(String(b.licenseFile).split("/").pop());
            setLicenseDataState(b.licenseFile);
          } else {
            setLicenseNameState(b.licenseName ?? undefined);
            setLicenseDataState(b.licenseData ?? undefined);
          }
        })
        .catch((err) => {
          // ignore and leave form blank
          // eslint-disable-next-line no-console
          console.error("Failed loading bus for edit:", err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const handleAddStop = () => {
    setStops((prev) => [
      ...prev,
      { id: String(Date.now()), name: "", arrivalTime: "", departureTime: "" },
    ]);
  };

  const handleStopChange = (id: string, field: keyof Stop, value: string) => {
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleRemoveStop = (id: string) => {
    setStops((prev) => prev.filter((s) => s.id !== id));
  };

  const resetForm = () => {
    setBusNumber("");
    setDriverName("");
    setDriverPhone("");
    setCapacity("");
    setStatus("active");
    setStart("");
    setStartDeparture("");
    setEnd("");
    setEndArrival("");
    setStops([]);
    setAadhaarFile(null);
    setLicenseFile(null);
    setAadhaarNameState(undefined);
    setAadhaarDataState(undefined);
    setLicenseNameState(undefined);
    setLicenseDataState(undefined);
  };

  

  // accept refs that may be null (matches useRef<HTMLInputElement | null>(null))
  const focusFirst = (refs: Array<React.RefObject<HTMLInputElement | null> | null>) => {
    for (const r of refs) {
      if (r?.current) {
        try {
          r.current.focus();
        } catch {
          /* ignore focus errors */
        }
        break;
      }
    }
  };

  const handleSave = async () => {
    // prefer DOM values if React state missed them (fallback)
    const domStartDep = startDepRef.current?.value ?? "";
    const domEndArr = endArrRef.current?.value ?? "";
    const effectiveStartDeparture = (startDeparture?.trim() || domStartDep?.trim()).trim();
    const effectiveEndArrival = (endArrival?.trim() || domEndArr?.trim()).trim();

    // normalize and validate
    const busNumberTrim = busNumber?.trim() ?? "";
    const driverNameTrim = driverName?.trim() ?? "";
    const driverPhoneTrim = driverPhone?.trim() ?? "";
    const startTrim = start?.trim() ?? "";
    const endTrim = end?.trim() ?? "";
    const capacityNum = capacity === "" ? NaN : typeof capacity === "number" ? capacity : Number(capacity);

    const missingFields: string[] = [];
    if (!busNumberTrim) missingFields.push("Bus number");
    if (!driverNameTrim) missingFields.push("Driver name");
    if (!driverPhoneTrim) missingFields.push("Driver phone");
    if (Number.isNaN(capacityNum) || capacityNum <= 0) missingFields.push("Capacity (must be > 0)");
    if (!startTrim) missingFields.push("Start location");
    if (!effectiveStartDeparture) missingFields.push("Start departure time");
    if (!endTrim) missingFields.push("End location");
    if (!effectiveEndArrival) missingFields.push("End arrival time");

    if (missingFields.length > 0) {
      alert(
        "Please fill or correct the following fields:\n\n" +
          missingFields.map((f, i) => `${i + 1}. ${f}`).join("\n")
      );

      // autofocus first missing field (best-effort order)
      if (!busNumberTrim) {
        focusFirst([busNumberRef]);
      } else if (!driverNameTrim) {
        focusFirst([driverRef]);
      } else if (!driverPhoneTrim) {
        focusFirst([phoneRef]);
      } else if (Number.isNaN(capacityNum) || capacityNum <= 0) {
        focusFirst([capacityRef]);
      } else if (!startTrim) {
        focusFirst([startRef]);
      } else if (!effectiveStartDeparture) {
        focusFirst([startDepRef]);
      } else if (!endTrim) {
        focusFirst([endRef]);
      } else if (!effectiveEndArrival) {
        focusFirst([endArrRef]);
      }

      return;
    }

    // validate time format HH:MM (24-hour)
    if (!TIME_RE.test(effectiveStartDeparture) || !TIME_RE.test(effectiveEndArrival)) {
      const invalid: string[] = [];
      if (!TIME_RE.test(effectiveStartDeparture)) invalid.push("Start departure time (use HH:MM, 24-hour)");
      if (!TIME_RE.test(effectiveEndArrival)) invalid.push("End arrival time (use HH:MM, 24-hour)");
      alert("Please correct the time format:\n\n" + invalid.map((v, i) => `${i + 1}. ${v}`).join("\n"));

      // focus first invalid time input
      if (!TIME_RE.test(effectiveStartDeparture)) {
        focusFirst([startDepRef]);
      } else {
        focusFirst([endArrRef]);
      }
      return;
    }

    // prepare document data (read files if provided)

    // file objects will be uploaded directly via FormData below (no dataURL conversion needed)

    // Build FormData to send to backend (supports files)
    const formData = new FormData();
    formData.append("busNumber", busNumberTrim);
    formData.append("driverName", driverNameTrim);
    formData.append("driverPhone", driverPhoneTrim);
    formData.append("capacity", String(Number(capacityNum)));
    formData.append("status", status);
    formData.append("start", startTrim);
    formData.append("startDeparture", effectiveStartDeparture);
    formData.append("end", endTrim);
    formData.append("endArrival", effectiveEndArrival);

    // append stops as a single JSON string for easier backend parsing
    // Backend can parse JSON from request.data['stops'] and load into a list
    formData.append(
      "stops",
      JSON.stringify(
        stops.map((s) => ({
          name: s.name,
          arrivalTime: s.arrivalTime,
          departureTime: s.departureTime,
        }))
      )
    );

    if (aadhaarFile) formData.append("aadhaarFile", aadhaarFile);
    if (licenseFile) formData.append("licenseFile", licenseFile);

    try {
      if (editId) {
        await axios.put(`${API_BASE}buses/${editId}/update/`, formData);
        alert("Bus updated successfully!");
      } else {
        await axios.post(`${API_BASE}buses/create/`, formData);
        alert("Bus added successfully!");
      }
      navigate("/transport");
    } catch (err: any) {
      // show server validation errors when available
      // eslint-disable-next-line no-console
      console.error("Save error:", err?.response?.data ?? err?.message ?? err);
      if (err?.response?.data) {
        alert("Save failed: " + JSON.stringify(err.response.data));
      } else {
        alert("Save failed. See console for details.");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{editId ? "✏️ Edit Bus" : "🚌 Add New Bus"}</h2>
        <button onClick={() => navigate("/transport")} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700">
          ← Back
        </button>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        {/* Bus Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            ref={busNumberRef}
            value={busNumber}
            onChange={(e) => setBusNumber(e.target.value)}
            placeholder="Bus Number"
            className="border p-3 rounded-lg outline-none"
          />
          <input
            ref={driverRef}
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="Driver Name"
            className="border p-3 rounded-lg outline-none"
          />
          <input
            ref={phoneRef}
            value={driverPhone}
            onChange={(e) => setDriverPhone(e.target.value)}
            placeholder="Driver Phone"
            className="border p-3 rounded-lg outline-none"
          />
          <input
            ref={capacityRef}
            value={capacity === "" ? "" : String(capacity)}
            onChange={(e) => setCapacity(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Capacity"
            type="number"
            className="border p-3 rounded-lg outline-none"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="border p-3 rounded-lg">
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Documents: Aadhaar & License */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Aadhaar */}
          <div>
            <div className="flex items-stretch">
              <input readOnly value={aadhaarFile?.name ?? aadhaarNameState ?? ""} placeholder="Aadhaar document" className="border-l border-t border-b p-3 rounded-l-lg outline-none w-full" />
              <button type="button" onClick={() => aadhaarInputRef.current?.click()} className="px-3 py-2 text-blue-600 underline bg-transparent rounded-r-lg">
                Choose file
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2">
              {aadhaarNameState && !aadhaarFile && (
                <a href={aadhaarDataState} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">
                  {aadhaarNameState}
                </a>
              )}
              {(aadhaarFile || aadhaarNameState) && (
                <button
                  onClick={() => {
                    setAadhaarNameState(undefined);
                    setAadhaarDataState(undefined);
                    setAadhaarFile(null);
                  }}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <input ref={aadhaarInputRef} type="file" accept="image/*,application/pdf" onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)} className="hidden" />
          </div>

          {/* License */}
          <div>
            <div className="flex items-stretch">
              <input readOnly value={licenseFile?.name ?? licenseNameState ?? ""} placeholder="License document" className="border-l border-t border-b p-3 rounded-l-lg outline-none w-full" />
              <button type="button" onClick={() => licenseInputRef.current?.click()} className="px-3 py-2 text-blue-600 underline bg-transparent rounded-r-lg">
                Choose file
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2">
              {licenseNameState && !licenseFile && (
                <a href={licenseDataState} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">
                  {licenseNameState}
                </a>
              )}
              {(licenseFile || licenseNameState) && (
                <button
                  onClick={() => {
                    setLicenseNameState(undefined);
                    setLicenseDataState(undefined);
                    setLicenseFile(null);
                  }}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <input ref={licenseInputRef} type="file" accept="image/*,application/pdf" onChange={(e) => setLicenseFile(e.target.files?.[0] || null)} className="hidden" />
          </div>
        </div>

        {/* Route Info */}
        <h3 className="text-md font-medium mb-2">🗺 Route Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <input ref={startRef} value={start} onChange={(e) => setStart(e.target.value)} placeholder="Start Location" className="border p-3 rounded-lg outline-none mb-2" />
            {/* switched to text input HH:MM to avoid browser 12:00 quirk */}
            <input
              ref={startDepRef}
              type="text"
              inputMode="numeric"
              placeholder="HH:MM (24-hour)"
              value={startDeparture}
              onChange={(e) => setStartDeparture(e.target.value)}
              className="border p-3 rounded-lg outline-none w-full"
            />
          </div>
          <div className="flex flex-col">
            <input ref={endRef} value={end} onChange={(e) => setEnd(e.target.value)} placeholder="End Location" className="border p-3 rounded-lg outline-none mb-2" />
            <input
              ref={endArrRef}
              type="text"
              inputMode="numeric"
              placeholder="HH:MM (24-hour)"
              value={endArrival}
              onChange={(e) => setEndArrival(e.target.value)}
              className="border p-3 rounded-lg outline-none w-full"
            />
          </div>
        </div>

        {/* Stops */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Stops Between</h4>
            <button onClick={handleAddStop} className="px-3 py-1 bg-blue-600 text-white rounded-lg">
              + Add Stop
            </button>
          </div>

          {stops.map((s) => (
            <div key={s.id} className="flex flex-col md:flex-row gap-2 border p-3 rounded-lg mb-2">
              <input value={s.name} onChange={(e) => handleStopChange(s.id, "name", e.target.value)} placeholder="Stop Name" className="border p-2 rounded-lg flex-1" />
              <input type="time" value={s.arrivalTime} onChange={(e) => handleStopChange(s.id, "arrivalTime", e.target.value)} className="border p-2 rounded-lg" />
              <input type="time" value={s.departureTime} onChange={(e) => handleStopChange(s.id, "departureTime", e.target.value)} className="border p-2 rounded-lg" />
              <button onClick={() => handleRemoveStop(s.id)} className="px-3 py-2 bg-red-500 text-white rounded-lg">
                ✖
              </button>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="mt-4 flex items-center gap-3">
          <button onClick={handleSave} className={`px-5 py-2 rounded-lg text-white ${editId ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}>
            {editId ? "Update Bus" : "Add Bus"}
          </button>
          <button onClick={resetForm} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
