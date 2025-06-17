import { getProductColors } from "@/app/admin/products/images/_actions";
import { Editor } from "@/components/editor/Editor";
import { products } from "@/lib/data/products";

async function EditDesignPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const data = products.find((product) => product.id === id);
  const product = await getProductColors("684322b1e6c9364d7ef35335");
  const productWhite = product.find((item) => item.name === "White");

  if (!data) return;
  // Fetch the project data using the id from the URL
  // const { data, isLoading, isError } = useProject(id);
  // if (isLoading || !data) {
  //   return (
  //     <div className="h-full flex flex-col items-center justify-center">
  //       <Loader className="size-6 animate-spin text-muted-foreground" />
  //     </div>
  //   );
  // }

  // if (isError) {
  //   return (
  //     <div className="h-full flex flex-col gap-y-5 items-center justify-center">
  //       <TriangleAlert className="size-6 text-muted-foreground" />
  //       <p className="text-muted-foreground text-sm">
  //         Failed to fetch project
  //       </p>
  //       <Button asChild variant="secondary">
  //         <Link href="/">
  //           Back to Home
  //         </Link>
  //       </Button>
  //     </div>
  //   );
  // }
  return <Editor initialData={data} productWhite={productWhite} />;
}

export default EditDesignPage;
