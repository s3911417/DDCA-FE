import { useLocation } from "react-router-dom";
import LoadingPage from "../LoadingPage/LoadingPage";
import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";
import { useUserStore } from "../../hooks/useUserStore";
import { getSearchParams } from "../../actions/getSearchParams";
import { useStocks } from "../../hooks/useStocks";
import { CustomButton } from "../Button/CustomButton";
import { transformOriginalDataToObject } from "../../actions/transformOriginalDataToObject";
import { DataRow } from "../../types";

export const OperatorPage = () => {
  const operatorName = useUserStore((state) => state.username);
  const { sessionName } = getSearchParams(useLocation().search);

  const {
    data: stocks,
    isLoading,
    error,
  } = useStocks(sessionName || "", operatorName);
  const data: DataRow[] = stocks? stocks.map(transformOriginalDataToObject): [];

  if (isLoading) return <LoadingPage />;
  if (error) return <div>Error: {error.message}</div>;

  const updateData = async () => {
    try {
      await axios.post("http://localhost:8081/assign", stocks, {
        params: {
          operatorName: operatorName,
          sessionName: encodeURIComponent(sessionName as string),
        },
      });
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };


  return (
    <div className="container mx-auto p-4">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-200 p-2 text-xs md:text-xl lg:text-2xl text-center">Stock Location</th>
            <th className="border border-gray-200 p-2 text-xs md:text-xl lg:text-2xl text-center">ItemId</th>
            <th className="border border-gray-200 p-2 text-xs md:text-xl lg:text-2xl text-center">Intel Lot</th>
          </tr>
        </thead>
        <tbody>
          
          {data.map((stock) => (
            <tr key={stock.ItemID}>
              <td className="border border-gray-200 p-2 flex justify-center">
                <Dialog.Root>
                  <Dialog.Trigger asChild>
                    <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow text-xs md:text-xl lg:text-2xl">
                      {stock.Location}
                    </button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0" />
                    <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                      <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
                        Stock Profile
                      </Dialog.Title>
                      <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
                        Scan and import stock information here. Click save when
                        you're done.
                      </Dialog.Description>
                      <fieldset className="mb-[15px] flex items-center gap-5">
                        <label
                          className="text-violet11 w-[90px] text-right text-[15px]"
                          htmlFor="name"
                        >
                          Location
                        </label>
                        <input
                          className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
                          id="name"
                          placeholder="Location"
                        />
                      </fieldset>
                      <fieldset className="mb-[15px] flex items-center gap-5">
                        <label
                          className="text-violet11 w-[90px] text-right text-[15px]"
                          htmlFor="name"
                        >
                          Item ID
                        </label>
                        <input
                          className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
                          id="itemID"
                          placeholder="Item ID"
                        />
                      </fieldset>
                      <fieldset className="mb-[15px] flex items-center gap-5">
                        <label
                          className="text-violet11 w-[90px] text-right text-[15px]"
                          htmlFor="name"
                        >
                          Lot
                        </label>
                        <input
                          className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
                          id="lot"
                          placeholder="Lot"
                        />
                      </fieldset>
                      <fieldset className="mb-[15px] flex items-center gap-5">
                        <label
                          className="text-violet11 w-[90px] text-right text-[15px]"
                          htmlFor="name"
                        >
                          Quantity
                        </label>
                        <input
                          className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
                          id="quantity"
                          placeholder="0"
                        />
                      </fieldset>
                      <div className="mt-[25px] flex justify-end">
                        <Dialog.Close asChild>
                          <button className="bg-green4 text-green11 hover:bg-green5 focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none">
                            Save changes
                          </button>
                        </Dialog.Close>
                      </div>
                      <Dialog.Close asChild>
                        <button
                          className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                          aria-label="Close"
                        >
                          ❌
                        </button>
                      </Dialog.Close>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </td>
              <td className="text-xs md:text-xl lg:text-2xl">{stock.ItemID}</td>
              <td className="text-xs md:text-xl lg:text-2xl">{stock.IntelLot}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <CustomButton onClick={updateData} buttonText="Confirm" />
    </div>
  );
};
