import { RequestQuote } from "@/models/request-quote";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import mongoose from "mongoose";

const createRequestQuoteSchema = z.object({
    //Customer information
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name required"),
    emailAddress: z.string().email(),
    phone: z.string().min(1, "Phone number is required"),
    company: z.string().optional(),
    streetAddress: z.string().min(1, "Street address is required"),
    suburbCity: z.string().min(1, "Suburb city is required"),
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    postcode: z.string().min(1, "Postcode is required"),
    agreeTerms: z.boolean().refine(v => v, { message: "You must agree to terms" }),

    //Request type and details
    type: z.enum(["product", "custom"]),

    //Product details (conditional)
    productId: z.string().optional(),
    quantity: z.coerce.number().min(1).optional(),
    selectedColorId: z.string().optional(),
    quantityBySize: z.array(z.object({
        size: z.string(),
        quantity: z.number().min(0),
    })).optional(),

    //Custom request details (conditional)
    customNeed: z.string().min(5, "Describe what you need").optional(),

    //Delivery and additional information
    needDeliveryBy: z.string().optional(),
    extraInformation: z.string().optional(),
}).refine((data) => {
    if (data.type === "product") {
        return data.productId && data.quantity;
    }
    //Validate custom type requirements
    if (data.type === "custom") {
        return data.customNeed;
    }
    return false;
}, {
    message: "Invalid request data based on type",
});

const app = new Hono()
    //Get all request quotes
    .get(
        "/",
        zValidator(
            "query",
            z.object({
                page: z.coerce.number().optional().default(1),
                limit: z.coerce.number().optional().default(10),
                status: z.enum(["pending", "reviewing", "quote", "approved", "rejected", "completed"]).optional(),
                type: z.enum(["product", "custom"]).optional(),
                search: z.string().optional(),
                sortBy: z.enum(["createdAt", "updatedAt", "status"]).optional().default("createdAt"),
                sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
            })
        ),
        async (c) => {
            try {
                const { page, limit, status, type, search, sortBy, sortOrder } = c.req.valid("query");

                const skip = (page - 1) * limit;

                const query: any = {};

                if (status) {
                    query.status = status;
                }

                if (type) {
                    query.type = type;
                }

                if (search) {
                    query.$or = [
                        { firstName: { $regex: search, $option: "i" } },
                        { lastName: { $regex: search, $option: "i" } },
                        { emailAddress: { $regex: search, $option: "i" } },
                        { company: { $regex: search, $option: "i" } },
                    ];
                }

                //build sort object
                const sort: any = {};
                sort[sortBy] = sortOrder === "asc" ? 1 : -1;

                const requestQuotes = await RequestQuote.find(query)
                    .populate({
                        path: "productDetails.productId",
                        model: "Shirt",
                        select: "name default_price",
                    })
                    .populate({
                        path: "productDetails.selectedColorId",
                        model: "ShirtColor",
                        select: "color hex_code",
                    })
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean()

                const totalQuotes = await RequestQuote.countDocuments(query);
                const totalPages = Math.ceil(totalQuotes / limit);

                //Transform data for response
                const transformQuotes = requestQuotes.map((quote) => ({
                    id: quote._id?.toString(),
                    firstName: quote.firstName,
                    lastName: quote.lastName,
                    emailAddress: quote.emailAddress,
                    phone: quote.phone,
                    company: quote.company,
                    streetAddress: quote.streetAddress,
                    suburbCity: quote.suburbCity,
                    country: quote.country,
                    state: quote.state,
                    postcode: quote.postcode,
                    type: quote.type,
                    productDetails: quote.productDetails,
                    customRequest: quote.customRequest,
                    needDeliveryBy: quote.needDeliveryBy,
                    extraInformation: quote.extraInformation,
                    status: quote.status,
                    quotedPrice: quote.quotedPrice,
                    quotedAt: quote.quotedAt,
                    approvedAt: quote.approvedAt,
                    rejectedAt: quote.rejectedAt,
                    rejectionReason: quote.rejectionReason,
                    adminNotes: quote.adminNotes,
                    createdAt: quote.createdAt,
                    updatedAt: quote.updatedAt,
                }));

                return c.json({
                    items: transformQuotes,
                    totalItems: totalQuotes,
                    page,
                    pageSize: limit,
                })
            } catch (error) {
                console.error("Error fetching request quotes:", error);
                throw new HTTPException(500, { message: "Failed to fetch request quotes" });
            }
        }
    )

    //Create new request quote
    .post(
        "/",
        zValidator("json", createRequestQuoteSchema),
        async (c) => {
            try {
                const data = c.req.valid("json");

                //Prepare request quote data
                const requestQuoteData: any = {
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
                    needDeliveryBy: data.needDeliveryBy ? new Date(data.needDeliveryBy) : undefined,
                    extraInformation: data.extraInformation,
                    status: "pending",
                };

                //Add type-specific details
                if (data.type === "product") {
                    requestQuoteData.productDetails = {
                        productId: new mongoose.Types.ObjectId(data.productId!),
                        quantity: data.quantity!,
                        selectedColorId: new mongoose.Types.ObjectId(data.selectedColorId),
                        quantityBySize: data.quantityBySize,
                    };
                } else if (data.type === "custom") {
                    requestQuoteData.customRequest = {
                        customNeed: data.customNeed!,
                    };
                }

                const requestQuote = new RequestQuote(requestQuoteData);
                await requestQuote.save();

                const populateQuote = await RequestQuote.findById(requestQuote._id)
                    .populate({
                        path: "productDetails.productId",
                        model: "Shirt",
                        select: "name default_price",
                    })
                    .populate({
                        path: "productDetails.selectedColorId",
                        model: "ShirtColor",
                        select: "color hex_code",
                    });

                return c.json(
                    {
                        success: true,
                        message: "Request quote created successfully",
                        data: {
                            status: populateQuote?.status,
                            type: populateQuote?.type,
                            createdAt: populateQuote?.createdAt,
                        }
                    },
                    201
                );
            } catch (error) {
                console.error("Error creating request quote:", error);

                if (error instanceof mongoose.Error.ValidationError) {
                    const errors = Object.values(error.errors).map(err => err.message);
                    throw new HTTPException(400, { message: `Validation error: ${errors.join(", ")}` });
                }

                if (error instanceof HTTPException) {
                    throw error;
                }

                throw new HTTPException(500, { message: "Failed to create request quote" });
            }
        }
    )

    //Get single request quote by ID
    .get(
        "/:id",
        zValidator(
            "param",
            z.object({
                id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
                    message: "Invalid request quote ID",
                }),
            })
        ),
        async (c) => {
            try {
                const { id } = c.req.valid("param");

                const requestQuote = await RequestQuote.findById(id)
                    .populate({
                        path: "productDetails.productId",
                        model: "Shirt",
                        select: "name default_price",
                    })
                    .populate({
                        path: "productDetails.selectedColorId",
                        model: "ShirtColor",
                        select: "color hex_code",
                    })
                    .lean();

                if (!requestQuote) {
                    throw new HTTPException(404, { message: "Request quote not found" });
                }

                return c.json({
                    success: true,
                    data: {
                        id: requestQuote._id?.toString(),
                        firstName: requestQuote.firstName,
                        lastName: requestQuote.lastName,
                        emailAddress: requestQuote.emailAddress,
                        phone: requestQuote.phone,
                        company: requestQuote.company,
                        streetAddress: requestQuote.streetAddress,
                        suburbCity: requestQuote.suburbCity,
                        country: requestQuote.country,
                        state: requestQuote.state,
                        postcode: requestQuote.postcode,
                        agreeTerms: requestQuote.agreeTerms,
                        type: requestQuote.type,
                        productDetails: requestQuote.productDetails,
                        customRequest: requestQuote.customRequest,
                        needDeliveryBy: requestQuote.needDeliveryBy,
                        extraInformation: requestQuote.extraInformation,
                        status: requestQuote.status,
                        quotedPrice: requestQuote.quotedPrice,
                        quotedAt: requestQuote.quotedAt,
                        approvedAt: requestQuote.approvedAt,
                        rejectedAt: requestQuote.rejectedAt,
                        rejectionReason: requestQuote.rejectionReason,
                        adminNotes: requestQuote.adminNotes,
                        createdAt: requestQuote.createdAt,
                        updatedAt: requestQuote.updatedAt,
                    },
                });
            } catch (error) {
                console.error("Error fetching request quote:", error);

                if (error instanceof HTTPException) {
                    throw error;
                }

                throw new HTTPException(500, { message: "Failed to fetch request quote" });
            }
        }
    )

export default app;