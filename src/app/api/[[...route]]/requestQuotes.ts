import { RequestQuote } from "@/models/request-quote";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import mongoose from "mongoose";
import { checkRole } from "@/lib/roles";
import verifyAuth from "@/lib/middlewares/verifyAuth";
import { clerkClient } from "@clerk/nextjs/server";
import { ShirtSizeVariant } from "@/models/product";

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

    designDescription: z.string().min(10, "Design description must be at least 10 characters").optional(),

    //Artwork and design dimensions
    artwork: z.string().url().optional(),
    desiredWidth: z.coerce.number().min(0.5, "Minimum width is 0.5 inches").max(50, "Maximum width is 50 inches").optional(),
    desiredHeight: z.coerce.number().min(0.5, "Minimum height is 0.5 inches").max(50, "Maximum height is 50 inches").optional(),

    //Delivery and additional information
    needDeliveryBy: z.string().optional(),
    extraInformation: z.string().optional(),
});

const updateRequestQuoteSchema = z.object({
    status: z.enum(["pending", "reviewing", "quoted", "approved", "rejected", "completed"]),
    quotedPrice: z.number().optional(),
    rejectionReason: z.string().optional(),
    adminNotes: z.string().optional(),
});

const adminResponseSchema = z.object({
    status: z.enum(["reviewing", "quoted", "revised", "rejected"]),
    quotedPrice: z.number().min(0).optional(),
    responseMessage: z.string().trim().optional(),
    rejectionReason: z.string().trim().optional(),
    adminNotes: z.string().trim().optional(),

    // Price breakdown
    priceBreakdown: z.object({
        basePrice: z.number().min(0).optional(),
        setupFee: z.number().min(0).default(0),
        designFee: z.number().min(0).default(0),
        rushFee: z.number().min(0).default(0),
        shippingCost: z.number().min(0).default(0),
        tax: z.number().min(0).default(0),
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

    validUntil: z.string().optional(), // ISO date string
});

const revisionSchema = adminResponseSchema.extend({
    revisionReason: z.enum(["customer_request", "admin_improvement", "cost_change", "timeline_change", "material_change"]),
});

const customerFeedbackSchema = z.object({
    requestedChanges: z.array(z.object({
        aspect: z.enum(["price", "timeline", "materials", "design", "other"]),
        description: z.string().trim().min(1, "Description is required"),
    })).min(1, "At least one change must be requested"),
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
                    // If not admin, can only view:
                    // 1. Quotes created by themselves (userId = user.id)
                    // 2. Quotes assigned to themselves (designerId = user.id)
                    query.$or = [
                        { userId: user.id },
                        { designerId: user.id }
                    ];
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
                        select: "color color_value",
                    })
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean()

                if (!requestQuotes) {
                    throw new HTTPException(404, { message: "Request quote not found" });
                }

                const totalQuotes = await RequestQuote.countDocuments(query);
                const totalPages = Math.ceil(totalQuotes / limit);

                // Get unique designer IDs
                const designerIds = [...new Set(requestQuotes
                    .map(quote => quote.designerId)
                    .filter((id): id is string => id !== undefined && id !== null))];

                // Fetch designer info from Clerk
                let designerInfoMap: Record<string, any> = {};
                if (designerIds.length > 0) {
                    try {
                        const client = await clerkClient();
                        const designerUsers = await Promise.all(
                            designerIds.map(async (id) => {
                                try {
                                    const user = await client.users.getUser(id);
                                    return {
                                        id: user.id,
                                        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses?.[0]?.emailAddress || user.id,
                                        email: user.emailAddresses?.[0]?.emailAddress || '',
                                    };
                                } catch (error) {
                                    console.error(`Error fetching designer ${id}:`, error);
                                    return null;
                                }
                            })
                        );
                        
                        designerInfoMap = designerUsers
                            .filter(user => user !== null)
                            .reduce((acc, user) => {
                                if (user) acc[user.id] = user;
                                return acc;
                            }, {} as Record<string, any>);
                    } catch (error) {
                        console.error("Error fetching designer info:", error);
                    }
                }

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
                    designerId: quote.designerId,
                    design_id: quote.design_id,
                    designerInfo: quote.designerId ? designerInfoMap[quote.designerId] : undefined,
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
                        select: "name base_price",
                    })
                    .populate({
                        path: "productDetails.selectedColorId",
                        model: "ShirtColor",
                        select: "color color_value",
                    })
                    .lean();

                if (!requestQuote) {
                    throw new HTTPException(404, { message: "Request quote not found" });
                }
                //Enhance quantityBySize with additional_price
                let enhancedProductDetails = requestQuote.productDetails;

                if (requestQuote.productDetails?.selectedColorId && requestQuote.productDetails?.quantityBySize) {
                    const colorId = typeof requestQuote.productDetails.selectedColorId === 'string'
                        ? requestQuote.productDetails.selectedColorId
                        : requestQuote.productDetails.selectedColorId._id;

                    try {
                        // Get size variants for this color
                        const sizeVariants = await ShirtSizeVariant.find({
                            shirtColor: colorId
                        }).lean();

                        //Enhance each size in quantityBySize with additional_price
                        const enhancedQuantityBySize = requestQuote.productDetails.quantityBySize.map(sizeItem => {
                            const sizeVariant = sizeVariants.find(sv => sv.size === sizeItem.size);
                            return {
                                size: sizeItem.size,
                                quantity: sizeItem.quantity,
                                additional_price: sizeVariant?.additional_price || 0, //Add additional_price
                            };
                        });

                        enhancedProductDetails = {
                            ...requestQuote.productDetails,
                            quantityBySize: enhancedQuantityBySize
                        };
                    } catch (error) {
                        console.error("Error fetching size pricing for quote:", requestQuote._id, error);
                        // Keep original productDetails if error occurs
                        enhancedProductDetails = requestQuote.productDetails;
                    }
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
                        productDetails: {
                            productId: requestQuote.productDetails?.productId?._id?.toString() || requestQuote.productDetails?.productId?.toString(),
                            quantity: requestQuote.productDetails?.quantity,
                            selectedColorId: requestQuote.productDetails?.selectedColorId?._id?.toString() || requestQuote.productDetails?.selectedColorId?.toString(),
                            quantityBySize: requestQuote.productDetails?.quantityBySize,
                        },
                        productDetails: enhancedProductDetails,
                        needDeliveryBy: requestQuote.needDeliveryBy,
                        extraInformation: requestQuote.extraInformation,
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
                        productionDetails: requestQuote.productionDetails,
                        createdAt: requestQuote.createdAt,
                        updatedAt: requestQuote.updatedAt,
                        design_id: requestQuote.design_id,
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



    

    

    

    // Get assigned quotes for designer
    .get("/my-assigned",
        zValidator("query", z.object({
            designerId: z.string().min(1, "Designer ID is required"),
        })),
        async (c) => {
            console.log("=== ENTERING /my-assigned endpoint ===");
            
            try {
                console.log("=== Inside try block ===");
                
                const { designerId } = c.req.valid("query");
                
                console.log("Debug - designerId from query:", designerId);
                
                // Designer chỉ xem được quote được assign cho mình
                const query = { designerId };
                
                console.log("Debug - query:", query);

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
                    .sort({ createdAt: -1 })
                    .lean();

                console.log("Debug - found quotes:", requestQuotes.length);

                const transformQuotes = requestQuotes.map((quote) => ({
                    id: quote._id?.toString(),
                    userId: quote.userId,
                    firstName: quote.firstName,
                    lastName: quote.lastName,
                    emailAddress: quote.emailAddress,
                    phone: quote.phone,
                    company: quote.company,
                    productDetails: quote.productDetails,
                    needDeliveryBy: quote.needDeliveryBy,
                    extraInformation: quote.extraInformation,
                    status: quote.status,
                    quotedPrice: quote.quotedPrice,
                    designerId: quote.designerId,
                    createdAt: quote.createdAt,
                    updatedAt: quote.updatedAt,
                }));

                console.log("=== About to return response ===");

                return c.json({
                    success: true,
                    data: transformQuotes,
                });

            } catch (error) {
                console.error("=== ERROR in /my-assigned ===", error);
                if (error instanceof HTTPException) throw error;
                throw new HTTPException(500, { message: "Failed to fetch assigned quotes" });
            }
        }
    )

    // Assign designer to request quote
    .post("/:id/assign-designer", 
        zValidator("param", z.object({
            id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
                message: "Invalid request quote ID",
            }),
        })),
        zValidator("json", z.object({
            designerId: z.string().min(1, "Designer ID is required"),
        })),
        async (c) => {
            try {
                const user = c.get("user")!;
                const isAdmin = await checkRole("admin");

                if (!isAdmin) {
                    throw new HTTPException(403, { message: "Admin access required" });
                }

                const { id } = c.req.valid("param");
                const { designerId } = c.req.valid("json");

                const quote = await RequestQuote.findById(id);
                if (!quote) {
                    throw new HTTPException(404, { message: "Request quote not found" });
                }

                if (quote.designerId) {
                    throw new HTTPException(400, { message: "Request quote is already assigned to a designer. Unassign first." });
                }

                quote.designerId = designerId;
                quote.status = "pending"; // or status you want when assigning
                await quote.save();

                return c.json({
                    success: true,
                    data: quote,
                    message: "Designer assigned successfully"
                });

            } catch (error) {
                console.error("Error assigning designer:", error);
                if (error instanceof HTTPException) throw error;
                throw new HTTPException(500, { message: "Failed to assign designer" });
            }
        }
    )

    // Unassign designer from request quote
    .post("/:id/unassign-designer",
        zValidator("param", z.object({
            id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
                message: "Invalid request quote ID",
            }),
        })),
        async (c) => {
            try {
                const user = c.get("user")!;
                const isAdmin = await checkRole("admin");

                if (!isAdmin) {
                    throw new HTTPException(403, { message: "Admin access required" });
                }

                const { id } = c.req.valid("param");

                const quote = await RequestQuote.findById(id);
                if (!quote) {
                    throw new HTTPException(404, { message: "Request quote not found" });
                }

                if (!quote.designerId) {
                    throw new HTTPException(400, { message: "Request quote is not assigned to any designer." });
                }

                quote.designerId = undefined;
                await quote.save();

                return c.json({
                    success: true,
                    data: quote,
                    message: "Designer unassigned successfully"
                });

            } catch (error) {
                console.error("Error unassigning designer:", error);
                if (error instanceof HTTPException) throw error;
                throw new HTTPException(500, { message: "Failed to unassign designer" });
            }
        }
    )

    // Get assigned quotes for designer
    .get("/my-assigned",
        async (c) => {
            try {
                const user = c.get("user")!;
                const isDesigner = await checkRole("designer");

                if (!isDesigner) {
                    throw new HTTPException(403, { message: "Designer access required" });
                }

                const query = { designerId: user.id };

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
                    .populate({
                        path: "design_id",
                        model: "Design",
                        select: "id name design_images",
                    })
                    .sort({ createdAt: -1 })
                    .lean();

                const transformQuotes = requestQuotes.map((quote) => ({
                    id: quote._id?.toString(),
                    userId: quote.userId,
                    firstName: quote.firstName,
                    lastName: quote.lastName,
                    emailAddress: quote.emailAddress,
                    phone: quote.phone,
                    company: quote.company,
                    productDetails: quote.productDetails,
                    needDeliveryBy: quote.needDeliveryBy,
                    extraInformation: quote.extraInformation,
                    status: quote.status,
                    quotedPrice: quote.quotedPrice,
                    designerId: quote.designerId,
                    design_id: quote.design_id,
                    createdAt: quote.createdAt,
                    updatedAt: quote.updatedAt,
                }));

                return c.json({
                    success: true,
                    data: transformQuotes,
                });

            } catch (error) {
                console.error("Error fetching assigned quotes:", error);
                if (error instanceof HTTPException) throw error;
                throw new HTTPException(500, { message: "Failed to fetch assigned quotes" });
            }
        }
    )

    .patch(
        "/:id/set-primary-design",
        zValidator(
            "param",
            z.object({
                id: z.string().trim(),
            })
        ),
        zValidator("json", z.object({
            design_id: z.string().refine((val) => {
                console.log("[API PATCH set-primary-design] JSON validation - design_id:", val);
                return true;
            }),
        })),
        async (c) => {
            try {
                // Log raw request body first
                const rawBody = await c.req.json();
                console.log("[API PATCH set-primary-design] Raw request body:", rawBody);
                
                const { id } = c.req.valid("param");
                const { design_id } = c.req.valid("json");
                const user = c.get("user");

                console.log("[API PATCH set-primary-design] Request:", { id, design_id, userId: user?.id });
                console.log("[API PATCH set-primary-design] Design ID type:", typeof design_id);
                console.log("[API PATCH set-primary-design] Design ID value:", design_id);

                if (!user) {
                    throw new HTTPException(401, { message: "Unauthorized" });
                }

                // Check if quote exists
                const quote = await RequestQuote.findById(id);
                if (!quote) {
                    throw new HTTPException(404, { message: "Quote not found" });
                }

                // Handle case where quote doesn't have designerId (old quotes)
                if (!quote.designerId) {
                    quote.designerId = user.id;
                    await quote.save();
                } else if (quote.designerId !== user.id) {
                    throw new HTTPException(403, { message: "You can only set primary design for your assigned quotes" });
                }

                // Check if design exists and belongs to the user
                const { Design } = await import("@/models/design");
                const design = await Design.findById(design_id);
                if (!design) {
                    throw new HTTPException(404, { message: "Design not found" });
                }

                if (design.user_id !== user.id) {
                    throw new HTTPException(403, { message: "You can only set your own designs as primary" });
                }

                // Update quote with primary design
                console.log("[API PATCH set-primary-design] Before update - quote.design_id:", quote.design_id);
                quote.design_id = new mongoose.Types.ObjectId(design_id);
                await quote.save();
                console.log("[API PATCH set-primary-design] After update - quote.design_id:", quote.design_id);

                return c.json({
                    success: true,
                    message: "Primary design set successfully",
                    data: {
                        quote_id: id,
                        design_id: design_id,
                    },
                });
            } catch (error) {
                console.error("Error setting primary design:", error);
                if (error instanceof HTTPException) {
                    throw error;
                }
                throw new HTTPException(500, {
                    message: "Failed to set primary design",
                });
            }
        }
    )


export default app;