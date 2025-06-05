"use client"
import React, { useCallback, useState } from "react"
import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    Polyline,
    Polygon,
} from "@react-google-maps/api"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import ComponentCard from "@/components/common/ComponentCard"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import { useZone } from "@/context/ZoneContext"

const containerStyle = {
    width: "100%",
    height: "300px",
}

const center = {
    lat: 18.525381182655536,
    lng: 73.87818078880382,
}

type LatLng = {
    lat: number
    lng: number
}

const Page: React.FC = () => {
    const [points, setPoints] = useState<LatLng[]>([])
    const [polygonComplete, setPolygonComplete] = useState<boolean>(false)
    const [hoverPoint, setHoverPoint] = useState<LatLng | null>(null)
    const [zoneName, setZoneName] = useState<string>("")
    const { addZone } = useZone();
    

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: ["places"],
    })

    const handleMapClick = useCallback(
        (event: google.maps.MapMouseEvent) => {
            if (polygonComplete || !event.latLng) return
            

            const lat = event.latLng.lat()
            const lng = event.latLng.lng()

            if (points.length >= 3) {
                const firstPoint = points[0]
                const distance = Math.sqrt(
                    (firstPoint.lat - lat) ** 2 + (firstPoint.lng - lng) ** 2
                )

                // Allow closure if clicked near the starting point (approx ~100m)
                if (distance < 0.01) {
                    setPolygonComplete(true)
                    console.log("Zone created:", points)
                    return
                }
            }

            setPoints((prev) => [...prev, { lat, lng }])
        },
        [points, polygonComplete]
    )

    const handleMouseMove = useCallback(
        (e: google.maps.MapMouseEvent) => {
            if (polygonComplete || !e.latLng) return
            const lat = e.latLng.lat()
            const lng = e.latLng.lng()
            setHoverPoint({ lat, lng })
        },
        [polygonComplete]
    )

    const handleReset = () => {
        setPoints([])
        setPolygonComplete(false)
        setHoverPoint(null)
    }

    const handleSubmit = async () => {
        if (!polygonComplete || !zoneName.trim()) {
            alert("Please complete the zone and enter a name.")
            return
        }

        try {
            await addZone({ name: zoneName.trim(), coordinates: points })
            alert("Zone submitted successfully!")
            handleReset();
            setZoneName("");
        } catch (error) {
            console.error("Failed to submit zone:", error)
            alert("Something went wrong while submitting.")
        }
    }

    const previewPath = hoverPoint ? [...points, hoverPoint] : [...points]

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
                            <span>Use this to drag map to find proper area</span>
                        </div>

                        <div className="mb-4 flex items-start gap-2">
                            {/* <Image src="/pin-icon.png" alt="Pin icon" width={40} height={40} /> */}
                            <span>
                                Click this icon to start pin points in the map and connect them to draw a zone.
                                <br />
                                Minimum 3 points required.
                            </span>
                        </div>
                    </div>

                    <div className="sm:col-span-2 p-4">
                        <div className="mb-4">
                            <Label className="block mb-1 font-medium text-gray-700">Enter Zone Name</Label>
                            <Input
                                type="text"
                                placeholder="Enter Zone Name"
                                value={zoneName}
                                onChange={(e) => setZoneName(e.target.value)}
                            />

                        </div>

                        <div className="border border-gray-300 rounded shadow overflow-hidden">
                            {isLoaded && (
                                <GoogleMap
                                    mapContainerStyle={containerStyle}
                                    center={center}
                                    zoom={13}
                                    onClick={handleMapClick}
                                    onMouseMove={handleMouseMove}
                                >
                                    {points.map((point, idx) => (
                                        <Marker key={idx} position={point} />
                                    ))}

                                    {!polygonComplete && points.length >= 1 && (
                                        <Polyline
                                            path={previewPath}
                                            options={{
                                                strokeColor: "#2563eb",
                                                strokeOpacity: 1.0,
                                                strokeWeight: 2,
                                            }}
                                        />
                                    )}

                                    {polygonComplete && (
                                        <Polygon
                                            path={[...points, points[0]]}
                                            options={{
                                                fillColor: "gray",
                                                fillOpacity: 0.4,
                                                strokeColor: "#2563eb",
                                                strokeOpacity: 0.8,
                                                strokeWeight: 2,
                                            }}
                                        />
                                    )}
                                </GoogleMap>
                            )}
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
                                disabled={!polygonComplete}
                                className={`${!polygonComplete
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                    } text-white px-4 py-2 rounded transition`}
                            >
                                Submit
                            </button>
                        </div>

                        {/* {polygonComplete && (
                            <div className="mt-4 bg-gray-100 p-4 rounded">
                                <h3 className="text-lg font-medium mb-2">Zone Coordinates:</h3>
                                <pre className="text-sm text-gray-700 overflow-auto">
                                    {JSON.stringify(points, null, 2)}
                                </pre>
                            </div>
                        )} */}
                    </div>
                </div>
            </ComponentCard>
        </div>
    )
}

export default Page
