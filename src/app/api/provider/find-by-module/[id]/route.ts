import Service from '@/models/Service';
import Provider from '@/models/Provider';

export async function getProvidersByServiceModule(serviceId: string) {
  // Step 1: Fetch the service, populate subcategory → category → module
  const service = await Service.findById(serviceId)
    .populate({
      path: 'subcategory',
      populate: {
        path: 'category',
        select: 'module', // we only need the module
      },
    });

  if (
    !service ||
    !service.subcategory ||
    !service.subcategory.category ||
    !service.subcategory.category.module
  ) {
    throw new Error('Module not found from service');
  }

  const moduleId = service.subcategory.category.module;

  // Step 2: Find providers with that module
  const providers = await Provider.find({ module: moduleId });

  return providers;
}
