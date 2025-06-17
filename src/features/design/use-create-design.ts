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
      const response = await client.api.design.$post({ json });
      return await response.json();
    },
  });

  return mutation;
};
