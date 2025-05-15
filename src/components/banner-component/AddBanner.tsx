import React, { useState } from 'react'
import FileInput from '@/components/form/input/FileInput'
import Label from '@/components/form/Label'
import Button from '@/components/ui/button/Button'
import ComponentCard from '../common/ComponentCard'
import Select from '../form/Select'
import { ChevronDownIcon } from '@/icons'
import { useModule } from '@/context/ModuleContext'
import { useCategory } from '@/context/CategoryContext'
import { useBannerContext } from '@/context/BannerContext'

interface ModuleType {
  _id: string
  name: string
}

interface CategoryType {
  _id?: string
  name: string
  module?: {
    _id: string
  }
}

const AddBanner = () => {
  const { modules } = useModule()
  const { categories } = useCategory()
  const { addBanner } = useBannerContext()
  const [page, setPage] = useState('')
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([
    { module: '', category: '', files: [] },
  ])

  const pageOptions = [
    { value: 'homepage', label: 'Homepage' },
    { value: 'categorypage', label: 'Category Page' },
  ]

  const moduleOptions = modules.map((mod) => ({
    value: mod._id,
    label: mod.name,
  }))

    const getCategoryOptions = (moduleId: string) => {
    if (!moduleId) return []
    return categories
      .filter((cat) => cat.module?._id === moduleId)
      .map((cat) => ({ value: cat._id ?? '', label: cat.name }))
  }

  // Update specific image entry's module
  const handleModuleChange = (index: number, moduleId: string) => {
    const updatedEntries = [...imageEntries]
    updatedEntries[index].module = moduleId
    updatedEntries[index].category = '' // reset category when module changes
    updatedEntries[index].files = [] // reset files when module changes (optional)
    setImageEntries(updatedEntries)
  }

  // Update specific image entry's category
  const handleCategoryChange = (index: number, categoryId: string) => {
    const updatedEntries = [...imageEntries]
    updatedEntries[index].category = categoryId
    setImageEntries(updatedEntries)
  }

  // Update specific image entry's files
  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    const updatedEntries = [...imageEntries]
    updatedEntries[index].files = Array.from(files)
    setImageEntries(updatedEntries)
  }

  // Add new empty image entry
  const addImageEntry = () => {
    setImageEntries([...imageEntries, { module: '', category: '', files: [] }])
  }

  // Remove image entry at index (optional)
  const removeImageEntry = (index: number) => {
    setImageEntries(imageEntries.filter((_, i) => i !== index))
  }

  // Filter categories by module for a given entry


  const handleSubmit = async () => {
    if (!page) {
      alert('Please select a page.')
      return
    }

    // Validate all image entries filled properly
    for (const [idx, entry] of imageEntries.entries()) {
      if (!entry.module || !entry.category || entry.files.length === 0) {
        alert(`Please fill all fields for image entry #${idx + 1}.`)
        return
      }
    }

    try {
      const formData = new FormData()
      formData.append('page', page)

      // Append all images with their module/category info as separate fields
      imageEntries.forEach(({ module, category, files }, entryIndex) => {
        files.forEach((file, fileIndex) => {
          formData.append('newImages', file)
        })
      })

      const categoryArr: string[] = []
      const moduleArr: string[] = []
      imageEntries.forEach(({ module, category, files }) => {
        files.forEach(() => {
          categoryArr.push(category)
          moduleArr.push(module)
        })
      })

      formData.append('category', JSON.stringify(categoryArr))
      formData.append('module', JSON.stringify(moduleArr))

      await addBanner(formData)
      alert('Banner added successfully!')
      setPage('')
      setImageEntries([{ module: '', category: '', files: [] }])
    } catch (error) {
      alert('Error adding banner.')
      console.error(error)
    }
  }

  return (
    <div>
      <ComponentCard title="Add New Banner">
        <div className="space-y-6">
          <div>
            <Label>Select Page</Label>
            <div className="relative max-w-xs">
              <Select
                options={pageOptions}
                placeholder="Select a page"
                onChange={(val: string) => setPage(val)}
                value={page}
                className="dark:bg-dark-900"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>

          {imageEntries.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-end max-w-4xl gap-x-6 flex-wrap"
            >
              <div className="flex-1 min-w-[180px]">
                <Label>Select Module</Label>
                <div className="relative">
                  <Select
                    options={moduleOptions}
                    placeholder="Select a module"
                    onChange={(val: string) => handleModuleChange(idx, val)}
                    value={entry.module}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-[180px]">
                <Label>Select Category</Label>
                <div className="relative">
                  <Select
                    options={getCategoryOptions(entry.module)}
                    placeholder="Select a category"
                    onChange={(val: string) => handleCategoryChange(idx, val)}
                    value={entry.category}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-[180px]">
                <Label>Select Images</Label>
                <FileInput
                  onChange={(e) => handleFileChange(idx, e)}
                  className="custom-class"
                />
              </div>

              {imageEntries.length > 1 && (
                <Button
                  size="sm"
                  onClick={() => removeImageEntry(idx)}
                  className="!text-red-500 !border !border-red-600 !bg-white"
                >
                  Remove
                </Button>
              )}


              {idx === imageEntries.length - 1 && (
                <div className="mt-4">
                  <Button size="sm" variant="outline" className='!text-green-500 !border !border-green-600 !bg-white' onClick={addImageEntry}>
                    +
                  </Button>
                </div>
              )}

            </div>

          ))}


          <div className="mt-6">
            <Button size="sm" variant="primary" onClick={handleSubmit}>
              Add Banner
            </Button>
          </div>
        </div>
      </ComponentCard>
    </div>
  )
}

export default AddBanner
