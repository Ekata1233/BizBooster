'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter,  } from 'next/navigation';


import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import FileInput from '@/components/form/input/FileInput';
import Button from '@/components/ui/button/Button';
import { useModule } from '@/context/ModuleContext';

const EditModulePage = () => {
  const router = useRouter();
  const { id } = useParams();

  const { modules, updateModule } = useModule();

  const [editId, setEditId] = useState<string | null>(null);
  const [moduleName, setModuleName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    
    if (id && modules.length > 0) {
      const mod = modules.find((m) => m._id === id);
      if (!mod) return;
      setEditId(mod._id);
      setModuleName(mod.name);
      setExistingImageUrl(mod.image || null);
    }
  }, [id, modules]);

 

  const handleUpdate = async () => {
    if (!editId) return;

    const fd = new FormData();
    fd.append('name', moduleName);
    if (selectedFile) {
      fd.append('image', selectedFile);
    }

    try {
      await updateModule(editId, fd);
      alert('Module updated successfully');
      router.push('/module-management/module');
    } catch (err) {
      console.error('Error updating module:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  return (
    <div className="w-full mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow">
      <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-10">
        Edit Module Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Module Name</Label>
          <Input value={moduleName} onChange={(e) => setModuleName(e.target.value)} />
        </div>

        <div>
          <Label>Thumbnail Image</Label>
          <FileInput onChange={handleFileChange} className="custom-class" />
          {selectedFile ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Thumbnail Preview"
              className="mt-2 w-20 h-20 object-cover rounded border"
            />
          ) : existingImageUrl ? (
            <img
              src={existingImageUrl}
              alt="Thumbnail Preview"
              className="mt-2 w-20 h-20 object-cover rounded border"
            />
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-10">
        <Button variant="outline" onClick={() => router.push('/module-management/module')}>
          Cancel
        </Button>
        <Button onClick={handleUpdate}>Save Changes</Button>
      </div>
    </div>
  );
};

export default EditModulePage;
