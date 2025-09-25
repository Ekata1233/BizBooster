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
interface Trending {
  serviceId: string
  moduleId: string
  isTrending: boolean
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

    const filteredSub: SubCategory[] = subcategories
      .filter(sc => {
        const cat = sc.category as string | { _id: string }
        if (typeof cat === "string") return cat === selectedCategory
        if (cat && typeof cat === "object") return cat._id === selectedCategory
        return false
      })
      .map(sc => ({
        _id: sc._id,
        name: sc.name,
        categoryId: typeof sc.category === "string" ? sc.category : sc.category?._id || ""
      }))

    setSubCategories(filteredSub)

    const fetchTrending = async () => {
      try {
        const trendingRes = await axios.get('/api/trending-modules')
        const trendingData: Trending[] = trendingRes.data as Trending[]

        let filteredServices: Service[] = []

        if (filteredSub.length === 0) {
          filteredServices = allServices
            .filter(s => {
              if (!s.category) return false
              if (typeof s.category === 'string') return s.category === selectedCategory
              if (typeof s.category === 'object') return s.category._id === selectedCategory
              return false
            })
            .map(s => ({
              ...s,
              status: trendingData.some(t => t.serviceId === s._id && t.isTrending),
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
        const trendingData: Trending[] = trendingRes.data as Trending[]

        const filteredServices = allServices
          .filter(s => {
            if (!s.subcategory) return false

            if (typeof s.subcategory === "string") return s.subcategory === selectedSubCategory
            if (typeof s.subcategory === "object") return s.subcategory._id === selectedSubCategory

            return false
          })
          .map(s => ({
            ...s,
            status: trendingData.some(t => t.serviceId === s._id && t.isTrending),
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
      await axios.patch('http://localhost:3000/api/trending-modules', {
        moduleId: selectedModule,
        serviceId: service._id,
        isTrending: newStatus,
      })

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
        <div className="flex flex-col items-end gap-1">
          {/* <label className="text-sm font-semibold text-blue-600 dark:text-blue-600 tracking-wide uppercase">
            Trending
          </label> */}
          <button
            onClick={() => toggleServiceStatus(row)}
            className={`relative w-16 h-8 rounded-full p-1 transition-colors duration-300 border-2 ${
              row.status
                ? "bg-gradient-to-r from-green-400 to-green-600 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                : "bg-gray-300 border-gray-400"
            }`}
          >
            <span
              className={`absolute left-0 top-0 w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                row.status ? "translate-x-8" : ""
              }`}
            ></span>
          </button>
        </div>
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