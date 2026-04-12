import { Router } from "express";
import { db, systemSettingsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

const router = Router();

const DEFAULT_SETTINGS: Record<string, string> = {
  campName: "DuneX Alpha Camp",
  campLocation: "Sahara Desert, Algeria",
  campCapacity: "20",
  campCoordinates: "28.9784° N, 3.7242° E",
  campWebsite: "https://dunex.sa",
  contactEmail: "ops@dunex.sa",
  contactPhone: "+213 555 000 100",
  contactAddress: "BP 01, Timimoun, Algeria",
  checkinTime: "14:00",
  checkoutTime: "11:00",
  currency: "USD",
  taxRate: "10",
  priceRoyalDome: "500",
  priceFamilySuite: "350",
  priceStandardPod: "150",
  cancellationPolicy: "48",
  timezone: "Africa/Algiers",
  dateFormat: "YYYY-MM-DD",
  defaultLanguage: "en",
  notifyEmail: "true",
  notifySMS: "false",
  notifyCriticalOnly: "false",
  notifyDailyReport: "true",
  notifyGuestCheckin: "true",
  notifyEnergyAlert: "false",
  minBattery: "20",
  minSolarKW: "15",
  peakLoadKW: "85",
  exportThresholdKWh: "100",
  minTempC: "18",
  maxTempC: "32",
  alertTempC: "35",
  criticalTempC: "38",
  waterDailyLimitL: "5000",
  waterAlertL: "1000",
  adminPinEnabled: "false",
  guestAppAccess: "true",
  cameraRetentionDays: "7",
  maintenanceWindowStart: "02:00",
  maintenanceWindowEnd: "04:00",
};

router.get("/settings", async (_req, res) => {
  try {
    const rows = await db.select().from(systemSettingsTable);
    const stored: Record<string, string> = {};
    for (const row of rows) {
      stored[row.key] = row.value;
    }
    const merged = { ...DEFAULT_SETTINGS, ...stored };
    res.json(merged);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.put("/settings", async (req, res) => {
  try {
    const updates: Record<string, string> = req.body;
    if (!updates || typeof updates !== "object") {
      res.status(400).json({ error: "Invalid body" });
      return;
    }
    const entries = Object.entries(updates).map(([key, value]) => ({
      key,
      value: String(value),
      updatedAt: new Date(),
    }));
    for (const entry of entries) {
      await db
        .insert(systemSettingsTable)
        .values(entry)
        .onConflictDoUpdate({
          target: systemSettingsTable.key,
          set: { value: entry.value, updatedAt: entry.updatedAt },
        });
    }
    const rows = await db.select().from(systemSettingsTable);
    const stored: Record<string, string> = {};
    for (const row of rows) stored[row.key] = row.value;
    res.json({ ...DEFAULT_SETTINGS, ...stored });
  } catch (e) {
    res.status(500).json({ error: "Failed to save settings" });
  }
});

export default router;
