import { DataTableProps } from "../../types";

export const DataTable = ({
  headerKeys,
  filteredData,
  tickedItems,
  onCheckboxChange,
  disabledItems,
  editMode,
}: DataTableProps) => {
  return (
    <table className="table-auto mx-auto border-collapse">
      <thead>
        <tr>
          {headerKeys.map((key, index) => (
            <th key={index} className="border-4 border-black p-2 px-4 py-2">
              {key}
            </th>
          ))}
          <th className="border-4 border-black p-5 bg-slate-500">Name</th>
          <th className="border-4 border-black p-5 bg-slate-500">Location</th>
          <th className="border-4 border-black p-5 bg-slate-500">Lot</th>
          <th className="border-4 border-black p-5 bg-slate-500">Quantity</th>
          <th className="border-4 border-black p-5 bg-slate-500">
            Scanning Quantity
          </th>
          <th className="border-4 border-black p-5 bg-slate-500">Operator</th>
          <th className="border-4 border-black p-5 bg-slate-500">Assign</th>
          <th className="border-4 border-black p-5 bg-slate-500">Status</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((row, index) => (
          <tr key={index} className="border-4 border-black">
            {Object.values(row).map((value, rowIndex) => (
              <td
                key={rowIndex}
                className="border-4 border-black text-center p-5"
              >
                {typeof value === "object" && value !== null
                  ? `${value.id} - ${value.name} - ${value.createdAt}`
                  : value}
              </td>
            ))}
            <td className="border-4 border-black border-blacktext-center p-5">
              <input
                type="checkbox"
                checked={
                  tickedItems.has(index) || (!!row.Operator && !editMode)
                }
                onChange={(e) => onCheckboxChange(e, index)}
                disabled={
                  !!((disabledItems.has(index) || row.Operator) && !editMode)
                }
              />
            </td>
            <td className="border-4 border-black border-blacktext-center p-5">
              {row.Qty_System === row.Qty_Scanned ? "✅" : "⛔"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
