import React, { useContext, useEffect, useMemo, useState } from "react";
import { DataRow, OriginalData, User } from "../../types";
import { read, utils } from "xlsx";
// import { Socket, io } from "socket.io-client";
import { DataTable } from "../DataTable/DataTable";
import { toast } from "react-hot-toast";
import axios from "axios";
import * as Radio from "@radix-ui/react-radio-group";
import { useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import { DataContext } from "../DataContext/DataContext";
import { useStockSize } from "../../hooks/useStockSize";
import { getSearchParams } from "../../actions/getSearchParams";
import { transformOriginalDataToObject } from "../../actions/transformOriginalDataToObject";
import { transformDataRowToObject } from "../../actions/transformDataRowToObject";
import { CustomButton } from "../Button/CustomButton";
import saveAs from "file-saver";
import * as XLSX from "xlsx";

//? WeSocket || Pusher

export const AdminPage = () => {
  // State variables
  const [selectedFile, setSelectedFile] = useState<File | undefined>(); // Selected CSV file
  const [csvData, setCsvData] = useState<DataRow[]>([]); // CSV data
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search query for location
  const [selectAll, setSelectAll] = useState(false); // Select all checkbox state
  const [tickedItems, setTickedItems] = useState<Set<number>>(new Set()); // Set of ticked items
  // const [socket, setSocket] = useState<Socket | null>(null); // Socket for real-time updates
  const [importedCsv, setImportedCsv] = useState(0); // Counter for imported CSV
  const [headerKeys] = useState<string[]>([]); // Keys for table headers
  const [operators, setOperators] = useState<User[]>([]); // List of operators
  const [selectedOperator, setSelectedOperator] = useState<string>(""); // Selected operator name
  const [disabledItems, setDisabledItems] = useState<Set<number>>(new Set()); // Set of disabled items
  const [editing, setEditing] = useState(false); // Editing state
  const [refreshKey, setRefreshKey] = useState(0); // Refresh key for table
  const { stocks } = useContext(DataContext); // Data from DataContext
  const { sessionName } = getSearchParams(useLocation().search); // Session name from URL query string

  const setStockSize = useStockSize(sessionName || "")(
    (state) => state.setStockSize
  );
  const stockSize = useStockSize(sessionName || "")((state) => state.stockSize);

  // Use the useQuery hook to fetch and cache data
  const { refetch } = useQuery("stocks", () =>
    getImportedStocks(encodeURIComponent(sessionName || "") as string)
  );

  // Fetch data using a query
  const getImportedStocks = async (sessionName: string) => {
    try {
      if (!sessionName) {
        console.error("Invalid session name:", sessionName);
        return; // or throw an error, depending on your requirement
      }
      const response = await axios.get<OriginalData[]>(
        "http://localhost:8081/stocks/admin",
        {
          params: {
            sessionName,
          },
        }
      );

      // Transform the data to the required format
      const data = response.data.map(transformOriginalDataToObject);
      

      // Check if the fetched data is not null
      if (data && data.length > 0) {
        const modifiedJsonData = data.map((dataRow) => ({
          ...dataRow,
          Qty_Scanned: 0,
        }));
        modifiedJsonData.forEach((row, index) => {
          if (row.Operator) {
            setDisabledItems((prev) => new Set([...prev, index]));
          }
        });
        setCsvData(modifiedJsonData);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
      toast.error("Error getting stocks. Please refresh the page.", {
        duration: 800,
      });
    }
  };

  // Function to get operators by role
  const getOperators = async (role: string) => {
    try {
      const response = await axios.get("http://localhost:8081/users", {
        params: {
          role,
        },
      });
      setOperators(response.data);
    } catch (error) {
      console.error("Error fetching users by role:", error);
      toast.error("Error getting operators' names. Please refresh the page.", {
        duration: 800,
      });
    }
  };

  useEffect(() => {
    // Fetch operators && data on component mount
    getOperators("Operator");
    getImportedStocks(encodeURIComponent(sessionName || "") as string);
  }, [sessionName, stocks]);

  // Handler for file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0]);
  };

  // Handler for CSV import button click
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        if (e.target) {
          resolve(e.target.result as ArrayBuffer);
        } else {
          reject(new Error("FileReader failed to read the file."));
        }
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Handler for CSV import button click
  const handleImport = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file", {
        duration: 800,
      });
      return;
    }

    try {
      const buffer = new Uint8Array(await readFileAsArrayBuffer(selectedFile));
      const workbook = read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json(worksheet) as DataRow[];

      // Add Qty_Scanned column with a value of 0 to each row
      const modifiedJsonData = jsonData.map((dataRow) => ({
        ...dataRow,
        Qty_Scanned: 0,
      }));

      setCsvData(modifiedJsonData);
      console.log("CSV data:", modifiedJsonData);

      try {
        // Send the data to the server
        await axios.post("http://localhost:8081/stocks/add", modifiedJsonData, {
          params: {
            sessionName: encodeURIComponent(sessionName as string),
          },
        });
        setStockSize(modifiedJsonData.length);
        toast.success("Data sent successfully");
        refetch();
      } catch (error) {
        console.error("Error sending data:", error);
        toast.error(
          "Error sending data. Please refresh the page and try again.",
          {
            duration: 1000,
          }
        );
      }
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Error reading file. Please select a valid file.");
    }

    setImportedCsv(importedCsv + 1);
    setSelectedFile(undefined);
  };

  // Handler for CSV export button click
  const handleExport =
    (data: DataRow[], filename: string) =>
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const excelBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(excelBlob, `${filename}.xlsx`);
      toast.success("Exported successfully", {
        duration: 800,
      });
    };

  // Get unique locations from CSV data
  const uniqueLocations = useMemo(() => {
    const locationSet = new Set<string>();
    csvData.forEach((row) => {
      Object.values(row).forEach((value) => {
        if (value !== null) {
          const location = value.toString().match(/[A-Za-z]{1,4}/)?.[0];
          if (location) {
            locationSet.add(location);
          }
        }
      });
    });
    return Array.from(locationSet);
  }, [csvData]);

  // Handler for location button click
  const handleLocationButtonClick = (location: string) => {
    setSearchQuery(location);
  };

  // Handler for select all checkbox change
  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectAll(e.target.checked);

    if (e.target.checked) {
      const allItemIndices = new Set(filteredData.map((_, index) => index));
      setTickedItems(allItemIndices);
    } else {
      setTickedItems(new Set());
    }
  };

  // Handler for checkbox change
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newTickedItems = new Set(tickedItems);
    e.target.checked ? newTickedItems.add(index) : newTickedItems.delete(index);
    setTickedItems(newTickedItems);
  };

  // Handler for assign ticked items
  const handleAssign = async () => {
    if (tickedItems.size === 0) {
      toast.error("Please select at least one item");
      return;
    }
    const tickedItemsData = Array.from(tickedItems).map((idx) => csvData[idx]);
    
    const tickItems = tickedItemsData.map(transformDataRowToObject);
    
    
    const updatedCsvData = [...csvData];
    tickedItems.forEach((index) => {
      updatedCsvData[index] = {
        ...updatedCsvData[index],
        Operator: selectedOperator,
      };
    });
    setCsvData(updatedCsvData);

    try {
      await axios.post("http://localhost:8081/stocks/assign", tickItems, {
        params: {
          operatorName: selectedOperator,
          sessionName: encodeURIComponent(sessionName as string),
        },
      });
      toast.success("Data sent successfully", {
        duration: 800,
      });
      if (!editing) {
        // Disable assigned rows
        setDisabledItems((prevDisabledItems) => {
          const newDisabledItems = new Set(prevDisabledItems);
          tickedItems.forEach((item) => newDisabledItems.add(item));
          return newDisabledItems;
        });

        // Clear ticked items
        setTickedItems(new Set());
      }

      setRefreshKey((prevRefreshKey) => prevRefreshKey + 1);
    } catch (error) {
      console.error("Error sending data:", error);
      toast.error("Error sending data. Please click Assign button again.", {
        duration: 1000,
      });
    }
  };

  // Handler for edit button click
  const handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    setEditing(!editing);
    // Instead of setting disabledItems to an empty set, just clear the disabled items
    setDisabledItems(new Set());
  };

  // Render radio group for selecting a location
  const filteredData = useMemo(() => {
    return csvData.filter((row) => {
      const searchLocation = searchQuery.toLowerCase();
      const rowData = Object.values(row).join(",").toLowerCase();
      return rowData.includes(searchLocation);
    });
  }, [csvData, searchQuery]);

  // Render summary of selected items
  const renderSummary = () => {
    const totalItems = csvData.length;
    const assignedItems = tickedItems.size;

    return (
      <div className="mt-1 mb-1">
        <span className="mx-2 font-semibold">Total items: {totalItems}</span>
        <span className="mx-2 font-semibold">
          Checked Items: {assignedItems}
        </span>
        <span className="mx-2 font-semibold">
          Pending Items: {totalItems - assignedItems}
        </span>
      </div>
    );
  };

  // Render location buttons
  const renderLocationButtons = () => {
    return (
      <div className="flex flex-wrap justify-center mb-2">
        {uniqueLocations.map((location, index) => (
          <button
            key={index}
            className="bg-blue-400 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded mx-1 my-1"
            onClick={() => handleLocationButtonClick(location)}
          >
            {location}
          </button>
        ))}
      </div>
    );
  };

  // Render radio group for selecting an operator
  const renderOperatorRadioGroup = () => {
    return (
      <>
        <p className="font-semibold"> Assign Operator:</p>
        <Radio.RadioGroup
          value={selectedOperator}
          onValueChange={(value: string) => {
            setSelectedOperator(value);
            console.log(value);
          }}
          className="mb-2"
        >
          {operators.map((operator) => (
            <Radio.Item
              key={operator.id}
              value={operator.name}
              className="inline-flex items-center ml-4"
            >
              <Radio.Indicator className="w-3 h-3 border border-gray-800 bg-blue-500 rounded-full mr-1" />
              <span>{operator.name}</span>
            </Radio.Item>
          ))}
        </Radio.RadioGroup>
      </>
    );
  };

  return (
    <div
      className={"bg-blue-100 text-center h-screen overflow-y-scroll"}
      key={refreshKey}
    >
      <form>
        <input
          className="mb-2 rounded text-center mt-5 border border-gray-300 px-4 py-2 bg-white text-gray-700 focus:outline-none focus:border-blue-500"
          type="file"
          id="FileInput"
          accept=".csv, .xlsx"
          onChange={handleFileInputChange}
        />
        {stockSize === 0 ? (
          <CustomButton onClick={handleImport} buttonText="Import Data" />
        ) : (
          <>
            <CustomButton
              onClick={handleExport(filteredData, "Change-Here")}
              buttonText="Export Data"
            />
            <CustomButton onClick={handleEdit} buttonText="Edit Data" />
          </>
        )}
      </form>
      {renderSummary()}
      <div className="flex items-center justify-center space-x-4">
        <span className="font-semibold mb-1">Select All:</span>
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAllChange}
        />
      </div>
      {renderLocationButtons()}
      <input
        className="mb-2 rounded text-center p-2"
        type="text"
        value={searchQuery}
        placeholder="Search by location"
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {renderOperatorRadioGroup()}
      <CustomButton onClick={handleAssign} buttonText="Assign" />
      <DataTable
        // Passes the keys of the table header
        headerKeys={headerKeys}
        // Passes the filtered data to be displayed in the table
        filteredData={filteredData}
        // Passes the items that have been ticked (selected) in the table
        tickedItems={tickedItems}
        // Specifies the function to be called when a checkbox in the table is changed
        onCheckboxChange={handleCheckboxChange}
        // Passes disabled items
        disabledItems={disabledItems}
        // Passes the editing mode
        editMode={editing}
      />
    </div>
  );
};
