'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/form/input/InputField';
import FileInput from '@/components/form/input/FileInput';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';

interface VideoItem {
  fileName: string;
  filePath: string;
}
interface Entry {
  _id: string;
  fullName: string;
  videos: VideoItem[];
}

const UnderstandingPage = () => {
  const [fullName, setFullName] = useState('');
  const [videos, setVideos] = useState<File[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [editEntryId, setEditEntryId] = useState<string | null>(null);
  const [editVideoIdx, setEditVideoIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);

  const openModal = (id: string, idx: number) => {
    const entry = entries.find((e) => e._id === id);
    if (!entry) return;
    setEditEntryId(id);
    setEditVideoIdx(idx);
    setEditName(entry.fullName);
    setEditFile(null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditEntryId(null);
    setEditVideoIdx(null);
    setEditFile(null);
  };

  const fetchEntries = async () => {
    const res = await axios.get('/api/academy/understandingfetchtrue');
    setEntries(res.data.data);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || videos.length === 0) return alert('Name + video required');
    const fd = new FormData();
    fd.append('fullName', fullName);
    videos.forEach((v) => fd.append('videoUrl', v));
    await axios.post('/api/academy/understandingfetchtrue', fd);
    setFullName('');
    setVideos([]);
    fetchEntries();
  };

  const deleteVideo = async (entryId: string, idx: number) => {
    await axios.delete(`/api/academy/understandingfetchtrue/${entryId}?videoIndex=${idx}`);
    fetchEntries();
  };

  const saveEdit = async () => {
    if (!editEntryId || editVideoIdx === null) return;
    const fd = new FormData();
    fd.append('fullName', editName);
    fd.append('videoIndex', String(editVideoIdx));
    if (editFile) fd.append('videoUrl', editFile);
    await axios.put(`/api/academy/understandingfetchtrue/${editEntryId}?videoIndex=${editVideoIdx}`, fd);
    closeModal();
    fetchEntries();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Understanding FetchTrue</h1>

      <form onSubmit={handleSubmit} className="mb-10 space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <Label>Upload Videos</Label>
          <FileInput accept="video/*" multiple onChange={(e) => e.target.files && setVideos(Array.from(e.target.files))} />
        </div>
        <Button>Submit</Button>
      </form>

      <h2 className="text-2xl font-semibold mb-4">Uploaded Entries</h2>

      {entries.map((entry) => (
        <div key={entry._id} className="mb-10 border-b pb-6">
          <p className="font-medium mb-4">Full Name: {entry.fullName}</p>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {entry.videos.map((vid, idx) => (
              <div key={idx} className="border rounded-md p-3 flex flex-col gap-2">
                <video controls className="w-full h-56 object-cover rounded">
                  <source src={vid.filePath} />
                </video>
                <Button size="sm" onClick={() => openModal(entry._id, idx)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteVideo(entry._id, idx)}>
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="bg-white p-6 rounded-lg dark:bg-gray-900">
          <h3 className="text-xl font-semibold mb-4">Update Entry</h3>
          <div className="space-y-4">
            <Label>Full Name</Label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Label>Replace Video (optional)</Label>
            <FileInput accept="video/*" multiple onChange={(e) => setEditFile(e.target.files?.[0] || null)} />
         
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UnderstandingPage;
