/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from "vitest";
import { TRANSLATIONS } from "../translations";

describe("Translation System Integrity Tests", () => {
  it("should have both 'en' and 'ar' language keys defined", () => {
    expect(TRANSLATIONS).toHaveProperty("en");
    expect(TRANSLATIONS).toHaveProperty("ar");
  });

  it("should contain exactly the same keys for 'en' and 'ar' catalogs", () => {
    const enKeys = Object.keys(TRANSLATIONS.en).sort();
    const arKeys = Object.keys(TRANSLATIONS.ar).sort();

    // Verify lengths match
    expect(enKeys.length).toBe(arKeys.length);
    
    // Verify each individual key match
    expect(enKeys).toEqual(arKeys);
  });

  it("should ensure all translation values are non-empty strings", () => {
    // English Checks
    Object.entries(TRANSLATIONS.en).forEach(([key, value]) => {
      expect(typeof value).toBe("string");
      expect(value.trim().length).toBeGreaterThan(0);
    });

    // Arabic Checks
    Object.entries(TRANSLATIONS.ar).forEach(([key, value]) => {
      expect(typeof value).toBe("string");
      expect(value.trim().length).toBeGreaterThan(0);
    });
  });

  it("should have correct translation signatures for critical medical launchers", () => {
    expect(TRANSLATIONS.en.pharmacyLauncher).toBe("Pharmacy");
    expect(TRANSLATIONS.ar.pharmacyLauncher).toBe("الصيدلية");

    expect(TRANSLATIONS.en.accountingLauncher).toBe("Accounting");
    expect(TRANSLATIONS.ar.accountingLauncher).toBe("المحاسبة والمالية");
  });
});
