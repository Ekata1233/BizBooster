"use client";
import ComponentCard from '@/components/common/ComponentCard'
import {
  GoogleMap,
  Polygon,
  DrawingManager,
  useJsApiLoader,
} from "@react-google-maps/api"
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import StatCard from '@/components/common/StatCard';
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label';
import BasicTableOne from '@/components/tables/BasicTableOne'
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { useZone } from '@/context/ZoneContext';
import { useModal } from '@/hooks/useModal';
import { ArrowUpIcon, PencilIcon, TrashBinIcon, UserIcon } from '@/icons';
import React, { useState, useCallback } from 'react'

export interface TableData {
  id: string;
  name: string;
  providerCount: number;
  categoryCount: number;
  status: string;
}

const containerStyle = {
  width: "100%",
  height: "300px",
}

const center = {
  lat: 18.525381182655536,
  lng: 73.87818078880382,
}

const libraries: ("drawing" | "geometry" | "places" | "visualization")[] = [
  "drawing",
  "places",
  "geometry",
];

const ZoneList = () => {
  const { zones, updateZone, deleteZone } = useZone();
  const { isOpen, openModal, closeModal } = useModal();

  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [zoneName, setZoneName] = useState<string>("");
  const [coords, setCoords] = useState<google.maps.LatLngLiteral[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // ✅ when polygon is drawn
  const handlePolygonComplete = useCallback((polygon: google.maps.Polygon) => {
    const path = polygon.getPath().getArray().map(latLng => ({
      lat: latLng.lat(),
      lng: latLng.lng(),
    }));
    setCoords(path);
    polygon.setMap(null); // remove temp overlay
  }, []);

  // ✅ when polygon is edited (drag/move)
  const handlePolygonEdit = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath().getArray().map(latLng => ({
      lat: latLng.lat(),
      lng: latLng.lng(),
    }));
    setCoords(path);
  };

  const handleEdit = (id: string) => {
    const zoneToEdit = zones.find((z) => z._id === id);
    if (zoneToEdit) {
      setEditingZoneId(id);
      setZoneName(zoneToEdit.name);
      setCoords(zoneToEdit.coordinates || []);
      openModal();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteZone(id); 
      alert("Zone deleted successfully.");
    } catch (error) {
      console.error("Error deleting zone:", error);
    }
  };

  const handleUpdateData = async () => {
    if (!editingZoneId || !zoneName.trim() || !coords.length) {
      alert("Please enter zone name and draw a polygon.");
      return;
    }

    try {
      await updateZone(editingZoneId, {
        name: zoneName.trim(),
        coordinates: coords,
      });
      alert("Zone updated successfully!");
      closeModal();
      setZoneName("");
      setEditingZoneId(null);
      setCoords([]);
    } catch (err) {
      console.error("Failed to update zone:", err);
    }
  };

  const columns = [
    { header: 'Zone Name', accessor: 'name' },
    { header: 'Providers', accessor: 'providerCount' },
    { header: 'Category', accessor: 'categoryCount' },
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
      render: (row: TableData) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row.id)}
            className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
          >
            <PencilIcon />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
          >
            <TrashBinIcon />
          </button>
        </div>
      ),
    },
  ];

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
      providerCount: 0,
      categoryCount: 0,
      status: zone.isDeleted ? 'Deleted' : 'Active',
    }));

  return (
    <div>
      <PageBreadcrumb pageTitle="Zone List" />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/4 my-5">
          <ComponentCard title="Zone List" >
            <div className='py-6'>
              <Input
                type="text"
                placeholder="Search by zone name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
            <li className={`cursor-pointer px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`} onClick={() => setActiveTab('all')}>All</li>
            <li className={`cursor-pointer px-4 py-2 ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`} onClick={() => setActiveTab('active')}>Active</li>
            <li className={`cursor-pointer px-4 py-2 ${activeTab === 'inactive' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`} onClick={() => setActiveTab('inactive')}>Inactive</li>
          </ul>
        </div>

        <div className="mt-5">
          <BasicTableOne columns={columns} data={filteredZones} />
        </div>
      </div>

      {/* ✅ Modal for editing zone */}
      <div>
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
          <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11 h-[70vh]">
            <h4 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Zone Setup
            </h4>
            <form className="flex flex-col">
              <div className="h-[280px] overflow-y-auto px-2 pb-3">
                <Label>Zone Name</Label>
                <Input
                  type="text"
                  value={zoneName}
                  placeholder="Enter Zone Name"
                  onChange={(e) => setZoneName(e.target.value)}
                />

                <div className="border border-gray-300 rounded shadow overflow-hidden mt-4">
                  {isLoaded && (
                    <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={coords[0] || center}
                      zoom={13}
                    >
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

                      {coords.length > 0 && (
                        <Polygon
                          paths={coords}
                          editable
                          draggable
                          onLoad={(polygon) => {
                            polygon.addListener("mouseup", () => handlePolygonEdit(polygon));
                            polygon.addListener("dragend", () => handlePolygonEdit(polygon));
                          }}
                        />
                      )}
                    </GoogleMap>
                  )}
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
