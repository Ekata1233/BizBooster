// 'use client';

// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Modal } from '@/components/ui/modal';
// import Input from '@/components/form/input/InputField';
// import FileInput from '@/components/form/input/FileInput';
// import Label from '@/components/form/Label';
// import Button from '@/components/ui/button/Button';
// import { PencilIcon} from 'lucide-react';
// import { TrashBinIcon } from '@/icons';
// import { useRouter } from 'next/navigation';
// interface PartnerReview {
//     _id: string;
//     title: string;
//     imageUrl: string;
//     videoUrl: string;
// }

// const PartnerReviewPage = () => {
//     const [title, setTitle] = useState('');
//     const [imageFile, setImageFile] = useState<File | null>(null);
//     const [videoUrl, setVideoUrl] = useState('');
//     const [reviews, setReviews] = useState<PartnerReview[]>([]);

//     const [isOpen, setIsOpen] = useState(false);
//     const [editId, setEditId] = useState<string | null>(null);
//     const [editTitle, setEditTitle] = useState('');
//     const [editImageFile, setEditImageFile] = useState<File | null>(null);
//     const [editVideoUrl, setEditVideoUrl] = useState('');
//     const router = useRouter();
//     const fetchReviews = async () => {
//         try {
//             const res = await axios.get('/api/partnerreview');
//             setReviews(res.data.data || []);
//         } catch (error) {
//             console.error('Error fetching reviews:', error);
//         }
//     };

//     useEffect(() => {
//         fetchReviews();
//     }, []);

//     /** ✅ Add New Review */
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!title || !imageFile || !videoUrl) {
//             alert('Title, image, and video URL are required.');
//             return;
//         }

//         const formData = new FormData();
//         formData.append('title', title);
//         formData.append('imageUrl', imageFile); // File for image
//         formData.append('videoUrl', videoUrl);

//         try {
//             await axios.post('/api/partnerreview', formData, {
//                 headers: { 'Content-Type': 'multipart/form-data' },
//             });
//             setTitle('');
//             setImageFile(null);
//             setVideoUrl('');
//             fetchReviews();
//             alert('Review added successfully!');
//         } catch (error) {
//             console.error('Error adding review:', error);
//             alert('Failed to add review.');
//         }
//     };

//     /** ✅ Delete Review */
//     const deleteReview = async (id: string) => {
//         if (!window.confirm('Are you sure you want to delete this review?')) return;
//         try {
//             await axios.delete(`/api/partnerreview/${id}`);
//             fetchReviews();
//             alert('Deleted successfully!');
//         } catch (error) {
//             console.error('Error deleting review:', error);
//             alert('Failed to delete review.');
//         }
//     };

//     const handleEdit = (id: string) => {
//     // Navigate to edit page (modal route)
//     router.push(`/preferences/partner-review/modals/${id}`);
//   };
   

//     const closeModal = () => {
//         setIsOpen(false);
//         setEditId(null);
//         setEditTitle('');
//         setEditImageFile(null);
//         setEditVideoUrl('');
//     };


//     const saveEdit = async () => {
//         if (!editId) return;

//         const fd = new FormData();
//         fd.append("title", editTitle);
//         fd.append("videoUrl", editVideoUrl);
//         if (editImageFile) {
//             fd.append("imageUrl", editImageFile); // File object
//         }
//         try {
//             await axios.put(`/api/partnerreview/${editId}`, fd, {
//                 headers: { "Content-Type": "multipart/form-data" },
//             });
//             closeModal();
//             fetchReviews();
//             alert("Updated successfully!");
//         } catch (error) {
//             console.error("Error updating review:", error);
//             alert("Failed to update review.");
//         }
//     };

//     return (
//         <div className="p-6 max-w-5xl mx-auto font-sans">
//             <h1 className="text-3xl font-bold mb-6 text-gray-800">Partner Reviews</h1>

//             {/* ✅ Add Form */}
//             <form
//                 onSubmit={handleSubmit}
//                 className="mb-10 p-6 bg-white rounded-lg shadow-md space-y-5"
//             >
//                 <div>
//                     <Label htmlFor="title">Title</Label>
//                     <Input
//                         id="title"
//                         type="text"
//                         value={title}
//                         onChange={(e) => setTitle(e.target.value)}
//                         placeholder="Enter title"
//                     />
//                 </div>
//                 <div>
//                     <Label htmlFor="imageUpload">Upload Image</Label>
//                     <FileInput
//                         id="imageUpload"
//                         accept="image/*"
//                         onChange={(e) => setImageFile(e.target.files?.[0] || null)}
//                     />
//                     {imageFile && <p className="text-sm text-gray-500 mt-1">Selected: {imageFile.name}</p>}
//                 </div>
//                 <div>
//                     <Label htmlFor="videoUrl">YouTube Video URL</Label>
//                     <Input
//                         id="videoUrl"
//                         type="text"
//                         value={videoUrl}
//                         onChange={(e) => setVideoUrl(e.target.value)}
//                         placeholder="https://youtube.com/..."
//                     />
//                 </div>
//                 <Button type="submit" className="w-full bg-blue-600 text-white">
//                     Add Review
//                 </Button>
//             </form>

//             {/* ✅ Reviews Grid */}
//             <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
//                 {reviews.map((review) => (
//                     <div key={review._id} className="border rounded-md p-3 flex flex-col gap-2">
//                         <h3 className="font-semibold">{review.title}</h3>
//                         <a href={review.videoUrl} target="_blank" rel="noopener noreferrer">
//                             <img
//                                 src={review.imageUrl}
//                                 alt={review.title}
//                                 className="w-full h-40 object-fit rounded hover:opacity-90 cursor-pointer"
//                             />
//                         </a>
//                         <div className="flex gap-2 mt-3">
//                             <button
//                                 // onClick={() => openEditModal(review)}
//                                 onClick={() => handleEdit(review._id)}
//                                 className="text-yellow-500 border border-yellow-500 rounded-md p-2 hover:bg-yellow-500 hover:text-white"
//                             >
//                                 {/* <PlusCircle size={16} /> */}
//                                 <PencilIcon size={16} />
//                             </button>
//                             <button
//                                 onClick={() => deleteReview(review._id)}
//                                 className="text-red-500 border border-red-500 rounded-md p-2 hover:bg-red-500 hover:text-white"
//                             >
//                                 <TrashBinIcon />
//                             </button>
//                         </div>
//                     </div>
//                 ))}
//             </div>

           



//             <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
//                 <div className="no-scrollbar w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
//                     <h4 className="mb-5 text-2xl font-semibold">Edit Partner Review</h4>
//                     <form className="flex flex-col">
//                         {/* Scrollable Content */}
//                         <div className="custom-scrollbar h-[400px] overflow-y-auto px-2 pb-3 grid gap-5">
//                             {/* Title */}
//                             <div>
//                                 <Label>Title</Label>
//                                 <Input
//                                     value={editTitle}
//                                     onChange={(e) => setEditTitle(e.target.value)}
//                                     placeholder="Enter title"
//                                 />
//                             </div>

//                             {/* Replace Image */}
//                             <div>
//                                 <Label>Replace Image (optional)</Label>
//                                 <FileInput
//                                     accept="image/*"
//                                     onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
//                                 />
//                                 {editImageFile && (
//                                     <p className="text-sm text-gray-500 mt-1">Selected: {editImageFile.name}</p>
//                                 )}
//                             </div>

//                             {/* YouTube URL */}
//                             <div>
//                                 <Label>YouTube Video URL</Label>
//                                 <Input
//                                     value={editVideoUrl}
//                                     onChange={(e) => setEditVideoUrl(e.target.value)}
//                                     placeholder="Enter YouTube link"
//                                 />
//                             </div>
//                         </div>

//                         {/* Buttons */}
//                         <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
//                             <Button size="sm" variant="outline" onClick={closeModal} type="button">
//                                 Cancel
//                             </Button>
//                             <Button size="sm" onClick={saveEdit} type="button">
//                                 Save Changes
//                             </Button>
//                         </div>
//                     </form>
//                 </div>
//             </Modal>

//         </div>
//     );
// };

// export default PartnerReviewPage;




