import { Editor } from "@/components/editor/editor";
import { products } from "@/lib/data/products";

function EditDesignPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const data = products.find((product) => product.id === id);
  if (!data) return
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
  return (
    <Editor initialData={data} />
  )
}

export default EditDesignPage