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

// ✅ Add this missing type to fix the error
type ImageEntry = {
  module: string;
  category: string;
  files: File[];
};

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

  const handleModuleChange = (index: number, moduleId: string) => {
    const updatedEntries = [...imageEntries]
    updatedEntries[index].module = moduleId
    updatedEntries[index].category = ''
    updatedEntries[index].files = []
    setImageEntries(updatedEntries)
  }

  const handleCategoryChange = (index: number, categoryId: string) => {
    const updatedEntries = [...imageEntries]
    updatedEntries[index].category = categoryId
    setImageEntries(updatedEntries)
  }

  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    const updatedEntries = [...imageEntries]
    updatedEntries[index].files = Array.from(files)
    setImageEntries(updatedEntries)
  }

  const addImageEntry = () => {
    setImageEntries([...imageEntries, { module: '', category: '', files: [] }])
  }

  const removeImageEntry = (index: number) => {
    setImageEntries(imageEntries.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!page) {
      alert('Please select a page.')
      return
    }

    for (const [idx, entry] of imageEntries.entries()) {
      if (!entry.module || !entry.category || entry.files.length === 0) {
        alert(`Please fill all fields for image entry #${idx + 1}.`)
        return
      }
    }

    try {
      const formData = new FormData()
      formData.append('page', page)

      imageEntries.forEach(({ files }) => {
        files.forEach((file) => {
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
