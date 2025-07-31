import { RequestQuote } from "@/models/request-quote";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import mongoose from "mongoose";
import { checkRole } from "@/lib/roles";
import verifyAuth from "@/lib/middlewares/verifyAuth";

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

    //Product details (conditional)
    productId: z.string().optional(),
    quantity: z.coerce.number().min(1).optional(),
    selectedColorId: z.string().optional(),
    quantityBySize: z.array(z.object({
        size: z.string(),
        quantity: z.number().min(0),
    })).optional(),

    //Design service fields
    needDesignService: z.boolean().default(false),
    designDescription: z.string().min(10, "Design description must be at least 10 characters").optional(),

    //Artwork and design dimensions
    artwork: z.string().url().optional(),
    desiredWidth: z.coerce.number().min(0.5, "Minimum width is 0.5 inches").max(50, "Maximum width is 50 inches").optional(),
    desiredHeight: z.coerce.number().min(0.5, "Minimum height is 0.5 inches").max(50, "Maximum height is 50 inches").optional(),

    //Delivery and additional information
    needDeliveryBy: z.string().optional(),
    extraInformation: z.string().optional(),
}).refine((data) => {
    if (data.needDesignService) {
        return data.designDescription && data.designDescription.trim().length >= 10;
    }
    return true;
}, {
    message: "Design description is required when requesting design service",
    path: ["designDescription"]
});

const updateRequestQuoteSchema = z.object({
    status: z.enum(["pending", "reviewing", "quoted", "approved", "rejected", "completed"]),
    quotedPrice: z.number().optional(),
    rejectionReason: z.string().optional(),
    adminNotes: z.string().optional(),
});

const adminResponseSchema = z.object({
    status: z.enum(["reviewing", "quoted", "rejected"]),
    quotedPrice: z.number().min(0).optional(),
    responseMessage: z.string().trim().optional(),
    rejectionReason: z.string().trim().optional(),

    // Price breakdown
    priceBreakdown: z.object({
        basePrice: z.number().min(0).optional(),
        setupFee: z.number().min(0).default(0),
        designFee: z.number().min(0).default(0),
        rushFee: z.number().min(0).default(0),
        shippingCost: z.number().min(0).default(0),
        tax: z.number().min(0).default(0),
        totalPrice: z.number().min(0),
    }).optional(),

    // Production details
    productionDetails: z.object({
        estimatedDays: z.number().min(1).optional(),
        printingMethod: z.enum(["DTG", "DTF", "Screen Print", "Vinyl", "Embroidery"]).optional(),
        materialSpecs: z.string().trim().optional(),
        colorLimitations: z.string().trim().optional(),
        sizeAvailability: z.array(z.object({
            size: z.string(),
            available: z.boolean(),
        })).optional(),
    }).optional(),

    validUntil: z.string().optional(),
});

const app = new Hono()
    .use(verifyAuth)
    //Get all request quotes
    .get(
        "/",
        zValidator(
            "query",
            z.object({
                page: z.coerce.number().optional().default(1),
                limit: z.coerce.number().optional().default(10),
                status: z.enum(["pending", "reviewing", "quote", "approved", "rejected", "completed"]).optional(),
                search: z.string().optional(),
                sortBy: z.enum(["createdAt", "updatedAt", "status"]).optional().default("createdAt"),
                sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
            })
        ),
        async (c) => {
            const user = c.get("user")!;
            const isAdmin = await checkRole("admin");

            try {
                const { page, limit, status, search, sortBy, sortOrder } = c.req.valid("query");

                const skip = (page - 1) * limit;

                const query: any = {};

                if (!isAdmin) {
                    query.userId = user.id;
                }

                if (status) {
                    query.status = status;
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
                    userId: quote.userId,
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
                    productDetails: quote.productDetails,
                    needDeliveryBy: quote.needDeliveryBy,
                    extraInformation: quote.extraInformation,
                    needDesignService: quote.needDesignService,
                    designDescription: quote.designDescription,
                    artwork: quote.artwork,
                    desiredWidth: quote.desiredWidth,
                    desiredHeight: quote.desiredHeight,
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
                const user = c.get("user")!;
                const data = c.req.valid("json");

                //Prepare request quote data
                const requestQuoteData: any = {
                    userId: user.id,
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
                    needDeliveryBy: data.needDeliveryBy ? new Date(data.needDeliveryBy) : undefined,
                    extraInformation: data.extraInformation,
                    status: "pending",
                    artwork: data.artwork,
                    desiredWidth: data.desiredWidth,
                    desiredHeight: data.desiredHeight,
                    needDesignService: data.needDesignService,
                    designDescription: data.designDescription,
                };

                //Add type-specific details
                requestQuoteData.productDetails = {
                    productId: new mongoose.Types.ObjectId(data.productId!),
                    quantity: data.quantity!,
                    selectedColorId: data.selectedColorId ? new mongoose.Types.ObjectId(data.selectedColorId) : undefined,
                    quantityBySize: data.quantityBySize,
                };


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
                            id: populateQuote?._id?.toString(),
                            status: populateQuote?.status,
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
                const user = c.get("user")!;
                const isAdmin = await checkRole("admin");
                const { id } = c.req.valid("param");

                const query: any = { _id: id };

                if (!isAdmin) {
                    query.userId = user.id;
                }

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
                        userId: requestQuote.userId,
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
                        productDetails: requestQuote.productDetails,
                        needDeliveryBy: requestQuote.needDeliveryBy,
                        extraInformation: requestQuote.extraInformation,
                        needDesignService: requestQuote.needDesignService,
                        designDescription: requestQuote.designDescription,
                        artwork: requestQuote.artwork,
                        desiredWidth: requestQuote.desiredWidth,
                        desiredHeight: requestQuote.desiredHeight,
                        status: requestQuote.status,
                        quotedPrice: requestQuote.quotedPrice,
                        quotedAt: requestQuote.quotedAt,
                        approvedAt: requestQuote.approvedAt,
                        rejectedAt: requestQuote.rejectedAt,
                        rejectionReason: requestQuote.rejectionReason,
                        adminNotes: requestQuote.adminNotes,
                        priceBreakdown: requestQuote.priceBreakdown,
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

    //Update status of request quote
    .patch(
        "/:id",
        zValidator("param", z.object({
            id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
                message: "Invalid request quote ID",
            }),
        })),
        zValidator("json", updateRequestQuoteSchema),
        async (c) => {
            try {
                const { id } = c.req.valid("param");
                const { status, quotedPrice, rejectionReason, adminNotes } = c.req.valid("json");

                const updateData: any = {
                    status,
                    updatedAt: new Date(),
                };

                switch (status) {
                    case "quoted":
                        if (quotedPrice !== undefined) {
                            updateData.quotedPrice = quotedPrice;
                            updateData.quotedAt = new Date();
                        }
                        break;
                    case "approved":
                        updateData.approvedAt = new Date();
                        break;
                    case "rejected":
                        updateData.rejectedAt = new Date();
                        if (rejectionReason !== undefined) {
                            updateData.rejectionReason = rejectionReason;
                        }
                        break;
                }

                if (adminNotes !== undefined) {
                    updateData.adminNotes = adminNotes;
                }

                const updatedQuote = await RequestQuote.findByIdAndUpdate(
                    id,
                    updateData,
                    { new: true }
                );

                if (!updatedQuote) {
                    throw new HTTPException(404, { message: "Request quote not found" });
                }

                return c.json({
                    success: true,
                    data: updatedQuote,
                    message: "Request quote updated successfully",
                });

            } catch (error) {
                console.error("Error updating request quote:", error);

                if (error instanceof HTTPException) {
                    throw error;
                }

                throw new HTTPException(500, { message: "Failed to update request quote" });
            }
        }
    )

    // Create admin response
    .post("/:id/respond", zValidator("json", adminResponseSchema), async (c) => {
        try {
            const user = c.get("user")!;
            const isAdmin = await checkRole("admin");

            if (!isAdmin) {
                throw new HTTPException(403, { message: "Admin access required" });
            }

            const { id } = c.req.param();
            const responseData = c.req.valid("json");

            // Validate totalPrice matches breakdown if provided
            if (responseData.priceBreakdown) {
                const breakdown = responseData.priceBreakdown;
                const calculatedTotal = (breakdown.basePrice || 0) +
                    (breakdown.setupFee || 0) +
                    (breakdown.designFee || 0) +
                    (breakdown.rushFee || 0) +
                    (breakdown.shippingCost || 0) +
                    (breakdown.tax || 0);

                if (Math.abs(calculatedTotal - breakdown.totalPrice) > 0.01) {
                    throw new HTTPException(400, {
                        message: "Total price doesn't match breakdown calculation"
                    });
                }
            }

            const updateData: any = {
                status: responseData.status,
                responseMessage: responseData.responseMessage,
                rejectionReason: responseData.rejectionReason,
                priceBreakdown: responseData.priceBreakdown,
                productionDetails: responseData.productionDetails,
                validUntil: responseData.validUntil ? new Date(responseData.validUntil) : undefined,
                updatedAt: new Date(),
            };

            // Set specific timestamps based on status
            switch (responseData.status) {
                case "quoted":
                    updateData.quotedPrice = responseData.priceBreakdown?.totalPrice || responseData.quotedPrice;
                    updateData.quotedAt = new Date();
                    break;
                case "rejected":
                    updateData.rejectedAt = new Date();
                    break;
            }

            const updatedQuote = await RequestQuote.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );

            if (!updatedQuote) {
                throw new HTTPException(404, { message: "Request quote not found" });
            }

            return c.json({
                success: true,
                data: updatedQuote,
                message: "Response submitted successfully"
            });

        } catch (error) {
            console.error("Error submitting admin response:", error);
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: "Failed to submit response" });
        }
    })

    // Approve/Reject quote (customer action)
    .post("/:id/approve", zValidator("json", z.object({
        action: z.enum(["approve", "reject"]),
        reason: z.string().optional(),
    })), async (c) => {
        try {
            const user = c.get("user")!;
            const { id } = c.req.param();
            const { action, reason } = c.req.valid("json");

            const quote = await RequestQuote.findOne({ _id: id, userId: user.id });
            if (!quote) {
                throw new HTTPException(404, { message: "Quote not found" });
            }

            if (quote.status !== "quoted") {
                throw new HTTPException(400, { message: "Quote is not in a state that can be approved/rejected" });
            }

            // Update quote status
            const updateData: any = {
                status: action === "approve" ? "approved" : "rejected",
                updatedAt: new Date(),
            };

            if (action === "approve") {
                updateData.approvedAt = new Date();
            } else {
                updateData.rejectedAt = new Date();
                updateData.rejectionReason = reason;
            }

            const updatedQuote = await RequestQuote.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );

            return c.json({
                success: true,
                data: updatedQuote,
                message: `Quote ${action}d successfully`
            });

        } catch (error) {
            console.error(`Error ${action}ing quote:`, error);
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: `Failed to ${action} quote` });
        }
    })


export default app;