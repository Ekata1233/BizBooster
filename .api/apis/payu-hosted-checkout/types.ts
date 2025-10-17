import type { FromSchema } from 'json-schema-to-ts';
import * as schemas from './schemas';

export type PayUHostedCheckoutFormDataParam = FromSchema<typeof schemas.PayUHostedCheckout.formData>;
export type PayUHostedCheckoutMetadataParam = FromSchema<typeof schemas.PayUHostedCheckout.metadata>;
export type PayUHostedCheckoutResponse200 = FromSchema<typeof schemas.PayUHostedCheckout.response['200']>;
