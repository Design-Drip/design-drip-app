import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface SelectedProduct {
    _id: string;
    name?: string;
    description?: string;
    colors: any[];
    selectedColor?: any;
    category?: string;
    [key: string]: any;
}

interface SelectedProductState {
    selectedProduct: SelectedProduct | null;
    isProductSelected: boolean;

    //actions
    setSelectedProduct: (product: SelectedProduct) => void;
    clearSelectedProduct: () => void;
}

const initialState = {
    selectedProduct: null,
    isProductSelected: false,
}

export const useSelectedProductStore = create<SelectedProductState>()(
    devtools(
        persist(
            (set) => ({
                ...initialState,

                setSelectedProduct: (product: SelectedProduct) =>
                    set(
                        {
                            selectedProduct: product,
                            isProductSelected: true,
                        },
                    ),


                clearSelectedProduct: () => {
                    set(
                        {
                            selectedProduct: null,
                            isProductSelected: false,
                        },
                    )
                },
            }),
            {
                name: 'selected-product-store',
            }
        ),
    )
);
