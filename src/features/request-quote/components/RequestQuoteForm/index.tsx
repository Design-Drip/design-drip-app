'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import SelectShirtDialog from '../SelectShirtDialog';
import SelectedProductInfo from '../SelectedProductInfo';
import { useSelectedProductStore } from '../../store/useSelectedProductStore';
import { useCreateRequestQuoteMutation } from '../../services/mutations';
import { toast } from 'sonner';

// --- Zod schemas ---
const productSchema = z.object({
    productId: z.string().min(1, 'Choose a product'),
    quantity: z.coerce.number().min(1, 'At least 1'),
    productsQuantities: z.record(z.record(z.number().min(0))).optional(),
    quantityBySize: z.record(z.record(z.number().min(0))).optional()
});

const customSchema = z.object({
    customNeed: z.string().min(5, 'Describe what you need'),
});

const fullSchema = z.object({
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
    type: z.enum(['product', 'custom']),
    product: productSchema.optional(),
    custom: customSchema.optional(),
    needDeliveryBy: z.string().optional(),
    extraInformation: z.string().optional(),
});

type FormData = z.infer<typeof fullSchema>;

// --- Main component ---
export default function RequestQuotePage() {
    const [type, setType] = React.useState<'product' | 'custom'>('product');

    const { selectedProduct, clearSelectedProduct } = useSelectedProductStore();
    const createRequestQuoteMutation = useCreateRequestQuoteMutation();

    const form = useForm<FormData>({
        // resolver: zodResolver(fullSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            emailAddress: '',
            phone: '',
            company: '',
            streetAddress: '',
            suburbCity: '',
            country: '',
            state: '',
            postcode: '',
            agreeTerms: false,
            type: 'product',
            product: {
                productId: '',
                quantity: 0,
                productsQuantities: {},
                quantityBySize: {},
            },
            custom: {
                customNeed: '',
            },
            needDeliveryBy: '',
            extraInformation: '',
        },
        mode: 'onTouched',
    });

    React.useEffect(() => {
        if (selectedProduct?._id) {
            form.setValue('product.productId', selectedProduct._id)
            form.trigger('product.productId')
        }
    }, [selectedProduct, form]);

    const onSubmit = async (data: FormData) => {
        try {
            const requestData: any = {
                firstName: data.firstName,
                lastName: data.lastName,
                emailAddress: data.emailAddress,
                phone: data.phone,
                company: data.company,
                streetAddress: data.streetAddress,
                suburbCity: data.suburbCity,
                country: data.country,
                state: data.state,
                postcode: data.postcode,
                agreeTerms: data.agreeTerms,
                type: data.type,
                needDeliveryBy: data.needDeliveryBy,
                extraInformation: data.extraInformation,
            };

            if (data.type === 'product' && data.product) {
                requestData.productId = data.product.productId;
                requestData.quantity = data.product.quantity;
                if (data.product.quantityBySize) {
                    const colorIds = Object.keys(data.product.quantityBySize);
                    const sizeObj = data.product.quantityBySize[colorIds[0]] || {};
                    requestData.quantityBySize = Object.entries(sizeObj).map(([size, quantity]) => ({
                        size,
                        quantity: Number(quantity),
                    }));
                }
            }

            if (data.type === 'custom' && data.custom) {
                requestData.customNeed = data.custom.customNeed;
            }

            await createRequestQuoteMutation.mutateAsync(requestData);

            toast.success("Request quote submitted successfully!");

            // Reset form
            form.reset();
            setType('product');
            clearSelectedProduct()
        } catch (error) {
            console.error("Error submitting request:", error);
            toast.error(error instanceof Error ? error.message : "Failed to submit request");
        }
    };

    const handleProductSelect = (product: any) => {
        form.setValue('product.productId', product._id);
        form.trigger('product.productId')
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
                autoComplete="off"
            >
                <div className='mb-8'>
                    <h2 className="text-lg font-semibold mb-4">1. Your Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="First Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Last Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="emailAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Phone" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Company (optional)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="streetAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Street Address <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Street Address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="suburbCity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Suburb/City <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Suburb/City" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Country" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>State <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="State" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="postcode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Postcode <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Postcode" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="agreeTerms"
                        render={({ field }) => (
                            <FormItem className="mt-4 flex items-center gap-2">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        id="agreeTerms"
                                        className='mt-2'
                                    />
                                </FormControl>
                                <FormLabel htmlFor="agreeTerms">I agree to the terms and conditions</FormLabel>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className='mb-8'>
                    <h2 className="text-lg font-semibold mb-4">2. What do you need?</h2>
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Choose an option</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        className="flex space-x-4 mb-4"
                                        value={type}
                                        onValueChange={val => {
                                            setType(val as 'product' | 'custom');
                                            field.onChange(val);
                                        }}
                                    >
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <RadioGroupItem value="product" id="type-product" className='mt-2 mr-2' />
                                            </FormControl>
                                            <FormLabel htmlFor="type-product" className="cursor-pointer">
                                                Choose one of our products
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <RadioGroupItem value="custom" id="type-custom" className='mt-2 mr-2' />
                                            </FormControl>
                                            <FormLabel htmlFor="type-custom" className="cursor-pointer">
                                                Tell us what you need
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {type === 'product' ? (
                        <div className='mt-4'>
                            <FormField
                                control={form.control}
                                name="product.productId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='mr-2'>Select Product</FormLabel>
                                        <FormControl>
                                            <SelectShirtDialog
                                                onProductSelect={handleProductSelect}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {selectedProduct && <SelectedProductInfo product={selectedProduct} className='mt-4' />}
                        </div>
                    ) : (
                        <div className='mt-4'>
                            <FormField
                                control={form.control}
                                name="custom.customNeed"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Describe what you need</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Tell us in detail..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-4">3. Delivery & Extra Information</h2>
                    <FormField
                        control={form.control}
                        name="needDeliveryBy"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Need delivery by</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[240px] pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={date => {
                                                field.onChange(date ? date.toISOString().slice(0, 10) : "");
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>Optional - let us know if you have a delivery deadline.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="extraInformation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Extra information</FormLabel>
                                <FormControl>
                                    <Textarea className="resize-none" placeholder="Any other details or requirements?" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end mt-6">
                        <Button type="submit">Submit Request</Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}