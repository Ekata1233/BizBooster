import { Suspense } from 'react';// We will create this component next
import LiveWebinarPage from './AddWebinarForm';
// A simple loading UI to show while the form is loading
const Loading = () => (
  <div className="container mx-auto px-4 py-8 text-center">
    <h1 className="text-3xl font-bold mb-6">Loading Form...</h1>
  </div>
);

export default function AddOfferPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LiveWebinarPage />
    </Suspense>
  );
}


