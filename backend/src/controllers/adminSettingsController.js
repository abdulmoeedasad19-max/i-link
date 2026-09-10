const { z } = require("zod");
const db = require("../config/db");

const STORE_SETTINGS_ID = "STORE_SETTINGS_ID"; // Mock or retrieve from consts

const settingsSchema = z.object({
  storeName: z.string().trim().min(1, "Store name is required.").max(200, "Store name is too long."),
  phone: z.string().trim().min(1, "Phone is required.").max(50, "Phone is too long."),
  email: z.email("Please enter a valid email address.").max(200, "Email is too long."),
  hours: z.string().trim().min(1, "Business hours are required.").max(200, "Business hours text is too long."),
  shippingCost: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? NaN : v),
    z.coerce
      .number()
      .finite("Shipping cost must be a valid number.")
      .min(0, "Shipping cost must be zero or greater.")
      .max(999999.99, "Shipping cost is too large.")
  ),
  easypaisaAccountName: z.string().trim().max(200, "Account name is too long.").optional(),
  easypaisaNumber: z.string().trim().max(50, "Number is too long.").optional(),
  easypaisaQrCode: z.string().trim().max(500, "QR code path is too long.").optional(),
  easypaisaInstructions: z.string().trim().max(1000, "Instructions are too long.").optional(),
});

function collectZodErrors(error) {
  const errors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in errors)) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

exports.updateStoreSettings = async (req, res) => {
  try {
    const adminId = req.user ? req.user.id : "admin";
    
    // Instead of FormData, we expect standard JSON payload in Express
    const parsed = settingsSchema.safeParse({
      storeName: req.body.storeName,
      phone: req.body.phone,
      email: req.body.email,
      hours: req.body.hours,
      shippingCost: req.body.shippingCost,
      easypaisaAccountName: req.body.easypaisaAccountName || undefined,
      easypaisaNumber: req.body.easypaisaNumber || undefined,
      easypaisaQrCode: req.body.easypaisaQrCode || undefined,
      easypaisaInstructions: req.body.easypaisaInstructions || undefined,
    });

    if (!parsed.success) {
      return res.status(400).json({ errors: collectZodErrors(parsed.error) });
    }

    const data = parsed.data;
    const shippingCostFixed = data.shippingCost.toFixed(2);
    const easypaisaAccountName = data.easypaisaAccountName ?? null;
    const easypaisaNumber = data.easypaisaNumber ?? null;
    const easypaisaQrCode = data.easypaisaQrCode ?? null;
    const easypaisaInstructions = data.easypaisaInstructions ?? null;

    // Retrieve existing store settings
    let existing = await db.storeSettings.findUnique({ where: { id: STORE_SETTINGS_ID } });
    if (!existing) {
      existing = {
        storeName: "", phone: "", email: "", hours: "", shippingCost: 0,
        easypaisaAccountName: null, easypaisaNumber: null, easypaisaQrCode: null, easypaisaInstructions: null
      };
    }

    const changedFields = [];
    if (existing.storeName !== data.storeName) changedFields.push("storeName");
    if (existing.phone !== data.phone) changedFields.push("phone");
    if (existing.email !== data.email) changedFields.push("email");
    if (existing.hours !== data.hours) changedFields.push("hours");
    if (parseFloat(existing.shippingCost || 0).toFixed(2) !== shippingCostFixed) changedFields.push("shippingCost");
    if ((existing.easypaisaAccountName ?? null) !== easypaisaAccountName) changedFields.push("easypaisaAccountName");
    if ((existing.easypaisaNumber ?? null) !== easypaisaNumber) changedFields.push("easypaisaNumber");
    if ((existing.easypaisaQrCode ?? null) !== easypaisaQrCode) changedFields.push("easypaisaQrCode");
    if ((existing.easypaisaInstructions ?? null) !== easypaisaInstructions) changedFields.push("easypaisaInstructions");

    if (changedFields.length === 0) {
      return res.json({ success: true });
    }

    try {
      await db.$transaction(async (tx) => {
        await tx.storeSettings.upsert({
          where: { id: STORE_SETTINGS_ID },
          update: {
            storeName: data.storeName,
            phone: data.phone,
            email: data.email,
            hours: data.hours,
            shippingCost: shippingCostFixed, // assuming decimal string in db
            easypaisaAccountName,
            easypaisaNumber,
            easypaisaQrCode,
            easypaisaInstructions,
          },
          create: {
            id: STORE_SETTINGS_ID,
            storeName: data.storeName,
            phone: data.phone,
            email: data.email,
            hours: data.hours,
            shippingCost: shippingCostFixed,
            easypaisaAccountName,
            easypaisaNumber,
            easypaisaQrCode,
            easypaisaInstructions,
          },
        });
        
        await tx.activityLog.create({
          data: {
            adminId,
            action: "UPDATE",
            entityType: "STORE_SETTINGS",
            entityId: STORE_SETTINGS_ID,
            description: "Updated store settings",
            metadata: { changedFields },
          }
        });
      });
    } catch (err) {
      console.error("[admin/settings] updateStoreSettings transaction failed:", err);
      return res.status(500).json({ errors: { form: "Unable to save settings. Please try again." } });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("[admin/settings] updateStoreSettings failed:", err);
    return res.status(500).json({ errors: { form: "An unexpected error occurred." } });
  }
};
