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

// --- Zod schemas ---
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
// Sửa merge -> and
const fullSchema = customerSchema
    .and(typeSchema)
    .and(deliverySchema);

type FormData = z.infer<typeof fullSchema>;

// --- Main component ---
export default function RequestQuotePage() {
    const [step, setStep] = React.useState(1);
    const [type, setType] = React.useState<'product' | 'custom'>('product');
    const form = useForm<FormData>({
        resolver: zodResolver(fullSchema),
        defaultValues: {
            type: 'product',
            agreeTerms: false,
        } as any,
        mode: 'onTouched',
    });

    const onSubmit = (data: FormData) => {
        alert(JSON.stringify(data, null, 2));
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
                autoComplete="off"
            >
                {step === 1 && (
                    <div>
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
                        <div className="flex justify-end mt-6">
                            <Button type="button" onClick={() => setStep(2)}>
                                Next
                            </Button>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div>
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
                                            <FormLabel>Product</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter product ID or name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="product.quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                        <div className="flex justify-between mt-6">
                            <Button type="button" variant="outline" onClick={() => setStep(1)}>
                                Back
                            </Button>
                            <Button type="button" onClick={() => setStep(3)}>
                                Next
                            </Button>
                        </div>
                    </div>
                )}
                {step === 3 && (
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
                                                initialFocus
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
                        <div className="flex justify-between mt-6">
                            <Button type="button" variant="outline" onClick={() => setStep(2)}>
                                Back
                            </Button>
                            <Button type="submit">Submit Request</Button>
                        </div>
                    </div>
                )}
            </form>
        </Form>
    );
}