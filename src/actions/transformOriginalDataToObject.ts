import { DataRow, OriginalData } from "../types";

export function transformOriginalDataToObject(
  originalData: OriginalData
): DataRow {
  return {
    ItemID: originalData["Item ID"],
    Location: originalData.Location,
    IntelLot: originalData["Intel Lot"],
    Qty_System: originalData["Qty System"],
    Qty_Scanned: 0, // Assume an initial value for Qty_Scanned if it's not provided in the original data
    Operator: originalData.user ? originalData.user.username : "",
  };
}
