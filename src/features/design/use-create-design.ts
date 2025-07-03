import { client } from "@/lib/hono";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<(typeof client.api.design)["$post"]>;
type RequestType = InferRequestType<
  (typeof client.api.design)["$post"]
>["json"];

export const useCreateDesign = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log("CREATE DESIGN REQUEST:", JSON.stringify(json, null, 2));
      const response = await client.api.design.$post({ json });
      const data = await response.json();
      console.log("CREATE DESIGN RESPONSE:", data);
      return data;
    },
  });

  return mutation;
};
