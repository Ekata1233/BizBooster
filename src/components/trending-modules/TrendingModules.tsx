'use client'

import React, { useEffect, useState } from 'react'
import Select from '@/components/form/Select'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import BasicTableOne from '@/components/tables/BasicTableOne'
import { useModule } from '@/context/ModuleContext'
import { useCategory } from '@/context/CategoryContext'
import { useSubcategory } from '@/context/SubcategoryContext'
import { useService } from '@/context/ServiceContext'
import axios from 'axios'

interface Module {
  _id: string
  name: string
}

interface Category {
  _id: string
  name: string
  module: Module | null
}

interface SubCategory {
  _id: string
  name: string
  categoryId: string
}

interface Service {
  _id: string
  serviceName: string
  status: boolean // represents isTrending
  categoryId?: string
  subcategoryId?: string
}

const TrendingModules = () => {
  const { modules } = useModule()
  const { categories } = useCategory()
  const { subcategories } = useSubcategory()
  const { services: allServices } = useService()

  const [selectedModule, setSelectedModule] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [services, setServices] = useState<Service[]>([])

  const moduleOptions = modules.map(m => ({ value: m._id, label: m.name }))

  const categoryOptions = categories
    .filter(c => !selectedModule || c.module?._id === selectedModule)
    .map(c => ({ value: c._id, label: c.name }))

  const subCategoryOptions = subCategories.map(sc => ({ value: sc._id, label: sc.name }))

  // Load services with trending info
  useEffect(() => {
    if (!selectedCategory) {
      setSubCategories([])
      setServices([])
      setSelectedSubCategory('')
      return
    }

    const filteredSub = subcategories.filter(
      sc => sc.category === selectedCategory || (sc.category as any)?._id === selectedCategory
    )
    setSubCategories(filteredSub)

    const fetchTrending = async () => {
      try {
        const trendingRes = await axios.get('/api/trending-modules')
        const trendingData = trendingRes.data // array of { serviceId, moduleId, isTrending }

        let filteredServices: Service[] = []

        if (filteredSub.length === 0) {
          filteredServices = allServices
            .filter(s => s.category?._id === selectedCategory || s.category === selectedCategory)
            .map(s => ({
              ...s,
              status: trendingData.some((t: any) => t.serviceId === s._id && t.isTrending),
            }))
        }

        setServices(filteredServices)
      } catch (err) {
        console.error('Error fetching trending data:', err)
      }
    }

    fetchTrending()
  }, [selectedCategory, subcategories, allServices])

  // Update services when selectedSubCategory changes
  useEffect(() => {
    if (!selectedSubCategory) return

    const fetchTrending = async () => {
      try {
        const trendingRes = await axios.get('/api/trending-modules')
        const trendingData = trendingRes.data

        const filteredServices = allServices
          .filter(
            s =>
              s.subcategory?._id === selectedSubCategory ||
              s.subcategory === selectedSubCategory
          )
          .map(s => ({
            ...s,
            status: trendingData.some((t: any) => t.serviceId === s._id && t.isTrending),
          }))

        setServices(filteredServices)
      } catch (err) {
        console.error('Error fetching trending data:', err)
      }
    }

    fetchTrending()
  }, [selectedSubCategory, allServices])

  const toggleServiceStatus = async (service: Service) => {
    if (!selectedModule) {
      alert('Please select a module first.')
      return
    }

    const newStatus = !service.status
    const action = newStatus ? 'add as trending' : 'remove from trending'
    const confirmMsg = `Are you sure you want to ${action} this service?`

    if (!confirm(confirmMsg)) return

    try {
      // Save trending status in database
      await axios.post('/api/trending-modules', {
        moduleId: selectedModule,
        serviceId: service._id,
        isTrending: newStatus,
      })

      // Update local state
      setServices(prev =>
        prev.map(s => (s._id === service._id ? { ...s, status: newStatus } : s))
      )

      alert(`Service has been ${newStatus ? 'added to' : 'removed from'} trending.`)
    } catch (err: any) {
      console.error('Error updating trending service:', err)
      alert('Something went wrong. Please try again.')
    }
  }

  const columns = [
    { header: 'Service Name', accessor: 'serviceName' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: Service) => (
        <label className="inline-flex relative items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={row.status}
            onChange={() => toggleServiceStatus(row)}
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
          <span className="ml-3 text-sm font-medium">{row.status ? 'On' : 'Off'}</span>
        </label>
      ),
    },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle="Trending Modules" />

      <div className="my-5">
        <ComponentCard title="Filter Services">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1">Select Module</label>
              <Select
                options={moduleOptions}
                placeholder="Module"
                onChange={(val: string) => {
                  setSelectedModule(val)
                  setSelectedCategory('')
                  setSelectedSubCategory('')
                  setServices([])
                }}
              />
            </div>

            <div>
              <label className="block mb-1">Select Category</label>
              <Select
                options={categoryOptions}
                placeholder="Category"
                onChange={(val: string) => setSelectedCategory(val)}
              />
            </div>

            <div>
              <label className="block mb-1">Select SubCategory</label>
              <Select
                options={subCategoryOptions}
                placeholder="SubCategory"
                onChange={val => setSelectedSubCategory(val)}
              />
            </div>
          </div>
        </ComponentCard>
      </div>

      <div className="my-5">
        <ComponentCard title="Services List">
          <BasicTableOne columns={columns} data={services} />
        </ComponentCard>
      </div>
    </div>
  )
}

export default TrendingModules
