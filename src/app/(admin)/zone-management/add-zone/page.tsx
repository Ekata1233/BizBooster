"use client";
import React, { useState, useCallback } from "react";
import {
    GoogleMap,
    Polygon,
    DrawingManager,
    useJsApiLoader,
} from "@react-google-maps/api";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useZone } from "@/context/ZoneContext";

type Zone = {
    id: number;
    name: string;
    coords: google.maps.LatLngLiteral[];
};

const containerStyle = {
    width: "100%",
    height: "300px",
};

const center = { lat: 18.525381182655536, lng: 73.87818078880382 };

// ✅ valid libraries
const libraries: (
    "drawing" | "geometry" | "places" | "visualization"
)[] = ["drawing", "places", "geometry"];

export default function ZoneMap() {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        libraries,
    });

    const { addZone } = useZone();
    const [zones, setZones] = useState<Zone[]>([]);
    const [activeZone, setActiveZone] = useState<Zone | null>(null);
    const [zoneName, setZoneName] = useState<string>("");

    // ✅ handle polygon created
    const handlePolygonComplete = useCallback(
        (polygon: google.maps.Polygon) => {
            const path = polygon
                .getPath()
                .getArray()
                .map((latLng) => ({
                    lat: latLng.lat(),
                    lng: latLng.lng(),
                }));

            const newZone: Zone = {
                id: Date.now(),
                name: `Zone ${zones.length + 1}`,
                coords: path,
            };

            setZones((prev) => [...prev, newZone]);
            setActiveZone(newZone);

            polygon.setMap(null); // remove temporary polygon
        },
        [zones]
    );

    // ✅ handle polygon edit
    const handlePolygonEdit = (polygon: google.maps.Polygon, zoneId: number) => {
        const path = polygon
            .getPath()
            .getArray()
            .map((latLng) => ({
                lat: latLng.lat(),
                lng: latLng.lng(),
            }));

        setZones((prev) =>
            prev.map((z) => (z.id === zoneId ? { ...z, coords: path } : z))
        );
    };

    const handleReset = () => {
        setZones([]);
        setActiveZone(null);
        setZoneName("");
    };

    const handleSubmit = async () => {
        if (!activeZone || !zoneName.trim()) {
            alert("Please draw a zone and enter a name.");
            return;
        }

        try {
            await addZone({ name: zoneName.trim(), coordinates: activeZone.coords });
            alert("Zone submitted successfully!");
            handleReset();
        } catch (error) {
            console.error("Failed to submit zone:", error);
            alert("Something went wrong while submitting.");
        }
    };

    if (!isLoaded) return <p>Loading map...</p>;

    return (
        <div className="p-4 space-y-4">
            <PageBreadcrumb pageTitle="Add New Zone" />
            <ComponentCard title="Zone Setup">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1 p-4">
                        <h2 className="text-lg font-semibold mb-4">Instructions</h2>
                        <p className="mb-4">
                            Create zone by clicking on the map and connect the dots together.
                        </p>

                        <div className="mb-4 flex items-center gap-2">
                            {/* <Image src="/drag-icon.png" alt="Drag map icon" width={40} height={40} /> */}
                            <span>Use Arrow icon to drag map to find proper area</span>
                        </div>

                        <div className="mb-4 flex items-start gap-2">
                            {/* <Image src="/pin-icon.png" alt="Pin icon" width={40} height={40} /> */}
                            <span>
                                Click Arrow icon to start pin points in the map and connect them to draw a zone.
                                <br />
                                Minimum 3 points required.
                            </span>
                        </div>
                    </div>


                    {/* Map + Form */}
                    <div className="sm:col-span-2 p-4">
                        <div className="mb-4">
                            <Label className="block mb-1 font-medium text-gray-700">
                                Enter Zone Name
                            </Label>
                            <Input
                                type="text"
                                placeholder="Enter Zone Name"
                                value={zoneName}
                                onChange={(e) => setZoneName(e.target.value)}
                            />
                        </div>

                        <div className="border border-gray-300 rounded shadow overflow-hidden">
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={activeZone ? activeZone.coords[0] : center}
                                zoom={13}
                            >
                                {/* Drawing Manager */}
                                <DrawingManager
                                    options={{
                                        drawingControl: true,
                                        drawingControlOptions: {
                                            position: google.maps.ControlPosition.TOP_CENTER,
                                            drawingModes: ["polygon"] as google.maps.drawing.OverlayType[],
                                        },
                                        polygonOptions: { editable: true, draggable: true },
                                    }}
                                    onPolygonComplete={handlePolygonComplete}
                                />

                                {/* Show saved polygons */}
                                {zones.map((zone) => (
                                    <Polygon
                                        key={zone.id}
                                        paths={zone.coords}
                                        editable={activeZone?.id === zone.id}
                                        draggable={activeZone?.id === zone.id}
                                        onLoad={(polygon) => {
                                            // store polygon instance inside zone object (optional)
                                            polygon.addListener("mouseup", () => handlePolygonEdit(polygon, zone.id));
                                            polygon.addListener("dragend", () => handlePolygonEdit(polygon, zone.id));
                                        }}
                                    />
                                ))}

                            </GoogleMap>
                        </div>

                        <div className="flex gap-4 my-4">
                            <button
                                onClick={handleReset}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                            >
                                Reset
                            </button>

                            <button
                                onClick={handleSubmit}
                                disabled={!activeZone}
                                className={`${!activeZone
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                    } text-white px-4 py-2 rounded transition`}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </ComponentCard>
        </div>
    );
}
