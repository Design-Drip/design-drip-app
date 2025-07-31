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
                type: z.enum(["product", "custom"]).optional(),
                search: z.string().optional(),
                sortBy: z.enum(["createdAt", "updatedAt", "status"]).optional().default("createdAt"),
                sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
            })
        ),
        async (c) => {
            const user = c.get("user")!;
            const isAdmin = await checkRole("admin");

            try {
                const { page, limit, status, type, search, sortBy, sortOrder } = c.req.valid("query");

                const skip = (page - 1) * limit;

                const query: any = {};

                if (!isAdmin) {
                    // Nếu không phải admin, chỉ xem được:
                    // 1. Quote do mình tạo (userId = user.id)
                    // 2. Quote được assign cho mình (designerId = user.id)
                    query.$or = [
                        { userId: user.id },
                        { designerId: user.id }
                    ];
                }

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
                    designerId: quote.designerId,
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
                        adminResponses: requestQuote.adminResponses,
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
                const user = c.get("user")!;
                const isAdmin = await checkRole("admin");

                if (!isAdmin) {
                    throw new HTTPException(403, { message: "Admin access required" });
                }

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

                responseData.quotedPrice = breakdown.totalPrice;
            }

            const preparedData = {
                ...responseData,
                validUntil: responseData.validUntil ? new Date(responseData.validUntil) : undefined,
            };

            const updatedQuote = await RequestQuote.addAdminResponse(
                id,
                preparedData,
                user.id,
                false
            );

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

    // Create revision
    .post("/:id/revise", zValidator("json", revisionSchema), async (c) => {
        try {
            const user = c.get("user")!;
            const isAdmin = await checkRole("admin");

            if (!isAdmin) {
                throw new HTTPException(403, { message: "Admin access required" });
            }

            const { id } = c.req.param();
            const responseData = c.req.valid("json");

            const preparedData = {
                ...responseData,
                validUntil: responseData.validUntil ? new Date(responseData.validUntil) : undefined,
                status: "revised", // Force status to revised for revisions
            };

            const updatedQuote = await RequestQuote.addAdminResponse(
                id,
                preparedData,
                user.id,
                true
            );

            return c.json({
                success: true,
                data: updatedQuote,
                message: "Revision submitted successfully"
            });

        } catch (error) {
            console.error("Error submitting revision:", error);
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: "Failed to submit revision" });
        }
    })

    .post("/:id/request-changes", zValidator("json", customerFeedbackSchema), async (c) => {
        try {
            const user = c.get("user")!;
            const { id } = c.req.param();
            const feedbackData = c.req.valid("json");

            const quote = await RequestQuote.findOne({ _id: id, userId: user.id });
            if (!quote) {
                throw new HTTPException(404, { message: "Quote not found" });
            }

            const currentResponse = quote.adminResponses.find(r => r.isCurrentVersion);
            if (!currentResponse) {
                throw new HTTPException(400, { message: "No active response to request changes on" });
            }

            if (currentResponse.status !== "quoted" && currentResponse.status !== "revised") {
                throw new HTTPException(400, { message: "Changes can only be requested on quoted responses" });
            }

            // Update customer feedback with requested changes
            if (!currentResponse.customerFeedback) {
                currentResponse.customerFeedback = {};
            }

            currentResponse.customerFeedback.requestedChanges = feedbackData.requestedChanges;

            // Mark as viewed if not already
            if (!currentResponse.customerViewed) {
                currentResponse.customerViewed = true;
                currentResponse.customerViewedAt = new Date();
            }

            await quote.save();

            return c.json({
                success: true,
                message: "Change requests submitted successfully"
            });

        } catch (error) {
            console.error("Error submitting change requests:", error);
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: "Failed to submit change requests" });
        }
    })

    // Mark quote response as viewed
    .patch("/:id/mark-viewed", async (c) => {
        try {
            const user = c.get("user")!;
            const { id } = c.req.param();

            const result = await RequestQuote.findOneAndUpdate(
                {
                    _id: id,
                    userId: user.id,
                    "adminResponses.isCurrentVersion": true,
                    "adminResponses.customerViewed": { $ne: true }
                },
                {
                    "adminResponses.$[elem].customerViewed": true,
                    "adminResponses.$[elem].customerViewedAt": new Date(),
                },
                {
                    arrayFilters: [{ "elem.isCurrentVersion": true }],
                    new: true,
                }
            );

            return c.json({
                success: true,
                message: "Quote marked as viewed"
            });

        } catch (error) {
            console.error("Error marking quote as viewed:", error);
            throw new HTTPException(500, { message: "Failed to mark as viewed" });
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

            const currentResponse = quote.adminResponses.find(r => r.isCurrentVersion);
            if (!currentResponse) {
                throw new HTTPException(400, { message: "No active response found" });
            }

            if (currentResponse.status !== "quoted" && currentResponse.status !== "revised") {
                throw new HTTPException(400, { message: "Quote is not in a state that can be approved/rejected" });
            }

            // Update quote status
            quote.status = action === "approve" ? "approved" : "rejected";

            if (action === "approve") {
                quote.approvedAt = new Date();
                currentResponse.status = "approved";
            } else {
                quote.rejectedAt = new Date();
                quote.rejectionReason = reason;
                currentResponse.status = "rejected";
                currentResponse.rejectionReason = reason;
            }

            await quote.save();

            return c.json({
                success: true,
                message: `Quote ${action}d successfully`
            });

        } catch (error) {
            console.error("Error processing quote action:", error);
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: "Failed to process quote action" });
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
                    type: quote.type,
                    productDetails: quote.productDetails,
                    customRequest: quote.customRequest,
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
                quote.status = "pending"; // hoặc trạng thái bạn muốn khi assign
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
                    type: quote.type,
                    productDetails: quote.productDetails,
                    customRequest: quote.customRequest,
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