import React, { useState } from 'react'
import FileInput from '@/components/form/input/FileInput'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import Button from '@/components/ui/button/Button'
import ComponentCard from '../common/ComponentCard'
import { useModule } from '@/context/ModuleContext'

const AddModule = () => {
    const { addModule } = useModule(); // Access the context
    const [moduleName, setModuleName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            console.log('Selected file:', file.name);
        }
    };

    const handleSubmit = async () => {
        if (!moduleName || !selectedFile) {
            alert('Please enter module name and select a file.');
            return;
        }

        const formData = new FormData();

        console.log("module : ", module)
        formData.append('name', moduleName);
        formData.append('image', selectedFile);

        try {
            await addModule(formData);
            alert('Module added successfully!');
            setModuleName('');
            setSelectedFile(null);
            console.log("page reset")
        } catch (error) {
            alert('Error adding module.');
            console.error(error);
        }
    };
    return (
        <div>
            <ComponentCard title="Add New Module">
                <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-6">
                    <div>
                        <Label>Module Name</Label>
                        <Input
                            type="text"
                            placeholder="Enter Module"
                            value={moduleName}
                            onChange={(e) => setModuleName(e.target.value)}
                        />

                    </div>
                    <div>
                        <Label>Select Image</Label>
                        <FileInput onChange={handleFileChange} className="custom-class" />

                    </div>
                    <div className='mt-6 '>
                        <Button size="sm" variant="primary" onClick={handleSubmit}>
                            Add Module
                        </Button>
                    </div>
                </div>
            </ComponentCard>
        </div>
    )
}

export default AddModule