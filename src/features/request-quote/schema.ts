import { z } from "zod";

const customerSchema = z.object({
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
    emailAddress: z.string().email(),
    streetAddress: z.string().min(1, 'Required'),
    suburbCity: z.string().min(1, 'Required'),
    country: z.string().min(1, 'Required'),
    state: z.string().min(1, 'Required'),
    postcode: z.string().min(1, 'Required'),
    phone: z.string().min(1, 'Required'),
    company: z.string().optional(),
    agreeTerms: z.boolean().refine(v => v, { message: 'You must agree to terms' }),
});
const productSchema = z.object({
    productId: z.string().min(1, 'Choose a product'),
    quantity: z.coerce.number().min(1, 'At least 1'),
});
const customSchema = z.object({
    customNeed: z.string().min(5, 'Describe what you need'),
});
const typeSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('product'), product: productSchema }),
    z.object({ type: z.literal('custom'), custom: customSchema }),
]);
const deliverySchema = z.object({
    needDeliveryBy: z.string().optional(),
    extraInformation: z.string().optional(),
});