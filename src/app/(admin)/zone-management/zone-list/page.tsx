"use client";
import ComponentCard from '@/components/common/ComponentCard'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  Polygon,
} from "@react-google-maps/api"
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import StatCard from '@/components/common/StatCard';
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label';
import BasicTableOne from '@/components/tables/BasicTableOne'
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { ICoordinate, useZone } from '@/context/ZoneContext';
import { useModal } from '@/hooks/useModal';
import { ArrowUpIcon, PencilIcon, TrashBinIcon, UserIcon } from '@/icons';
import React, { useCallback, useState } from 'react'

export interface TableData {
  id: string;
  name: string;
  providerCount: number;
  categoryCount: number;
  status: string;
}

const containerStyle = {
  width: "100%",
  height: "180px",
}

const center = {
  lat: 18.525381182655536,
  lng: 73.87818078880382,
}

type LatLng = {
  lat: number
  lng: number
}

const ZoneList = () => {
  const { zones, updateZone, deleteZone } = useZone();
  const [zoneName, setZoneName] = useState<string>("")
  const [coordinates, setCoordinates] = useState<ICoordinate[]>([]);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');
  const [points, setPoints] = useState<LatLng[]>([])
  const [polygonComplete, setPolygonComplete] = useState<boolean>(false)
  const [hoverPoint, setHoverPoint] = useState<LatLng | null>(null)
  const { isOpen, openModal, closeModal } = useModal();

  console.log("zones data : ", zones);

  const columns = [
    {
      header: 'Zone Name',
      accessor: 'name',
    },
    {
      header: 'Providers',
      accessor: 'providerCount',
    },
    {
      header: 'Category',
      accessor: 'categoryCount',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: TableData) => {
        const status = row.status;
        let colorClass = '';

        switch (status) {
          case 'Deleted':
            colorClass = 'text-red-500 bg-red-100 border border-red-300';
            break;
          case 'Active':
            colorClass = 'text-green-600 bg-green-100 border border-green-300';
            break;
          default:
            colorClass = 'text-gray-600 bg-gray-100 border border-gray-300';
        }

        return (
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
            {status}
          </span>
        );
      },
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row: TableData) => {
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(row.id)}
              className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500">
              <PencilIcon />
            </button>
            <button onClick={() => handleDelete(row.id)} className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white hover:border-red-500">
              <TrashBinIcon />
            </button>
          </div>
        )
      },
    },
  ];

  const handleEdit = (id: string) => {
    const zoneToEdit = zones.find((z) => z._id === id);
    if (zoneToEdit) {
      setEditingZoneId(id);
      setZoneName(zoneToEdit.name);
      openModal();
    }
  };


  const handleDelete = async (id: string) => {
    try {
      console.log("delete", id);
      await deleteZone(id); // call the context function to delete the zone
      alert("Zone deleted successfully.");
    } catch (error) {
      console.error("Error deleting zone:", error);
    }
  };


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
        if (distance < 0.005) {
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

  const previewPath = hoverPoint ? [...points, hoverPoint] : [...points]

  const handleUpdateData = async () => {
    if (!editingZoneId) return;

    try {
      await updateZone(editingZoneId, {
        name: zoneName,
        coordinates: points, // from your state
      });
      alert("Zone updated successfully!");
      closeModal();
      setZoneName("");
      setEditingZoneId(null);
    } catch (err) {
      console.error("Failed to update zone:", err);
    }
  };




  // 🌟 Filter and map zones to match the table format
  const filteredZones = zones
    .filter((zone) => {
      const matchQuery = zone.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeTab === 'all') return matchQuery;
      if (activeTab === 'active') return matchQuery && !zone.isDeleted;
      if (activeTab === 'inactive') return matchQuery && zone.isDeleted;
    })
    .map((zone) => ({
      id: zone._id,
      name: zone.name,
      providerCount: 0 || 0,
      categoryCount: 0, // Placeholder: Replace with actual count if available
      status: zone.isDeleted ? 'Deleted' : 'Active',
    }));

  if (!zones || !Array.isArray(zones)) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Zone List" />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/4 my-5">
          <ComponentCard title="Zone List" >

            <div className='py-6'>
              <div>
                <Input
                  type="text"
                  placeholder="Search by zone name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </ComponentCard>
        </div>
        <div className="w-full lg:w-1/4 my-5">
          <StatCard
            title="Total Zones"
            value={zones.length}
            icon={UserIcon}
            badgeColor="success"
            badgeValue="0.00%"
            badgeIcon={ArrowUpIcon}
          />
        </div>
      </div>

      <div>
        <div className="border-b border-gray-200">
          <ul className="flex space-x-6 text-sm font-medium text-center text-gray-500">
            <li
              className={`cursor-pointer px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </li>
            <li
              className={`cursor-pointer px-4 py-2 ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active
            </li>
            <li
              className={`cursor-pointer px-4 py-2 ${activeTab === 'inactive' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
              onClick={() => setActiveTab('inactive')}
            >
              Inactive
            </li>
          </ul>
        </div>

        <div className="mt-5">
          <BasicTableOne columns={columns} data={filteredZones} />
        </div>
      </div>

      <div>
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4 ">
          <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11 h-[60vh] sm:h-[70vh] md:h-[75vh] lg:h-[70vh] xl:h-[85vh] 2xl:h-[50vh]">
            <div className="px-2 pr-14">
              <h4 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Edit Zone Setup
              </h4>

            </div>

            <form className="flex flex-col">
              <div className="custom-scrollbar h-[350px] overflow-y-auto px-2 pb-3">
                <div className="">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 ">
                    <div>
                      <Label>Zone Name</Label>
                      <Input
                        type="text"
                        value={zoneName}
                        placeholder="Enter Module"
                        onChange={(e) => setZoneName(e.target.value)}
                      />
                    </div>

                    <div>
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

                      <button
                        onClick={handleReset}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition my-3"
                      >
                        Reset
                      </button>
                    </div>

                  </div>
                </div>

              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Close
                </Button>
                <Button size="sm" onClick={handleUpdateData}>
                  Update Changes
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>

    </div>
  )
}

export default ZoneList;
