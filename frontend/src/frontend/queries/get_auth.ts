import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { setIsAuthorized, setUser, useAppDispatch } from "../store";
import { AzureClaims } from "../types";

export const useAuth = () => {
    // use redux to set isAuthenticated to true or false
    const dispatch = useAppDispatch();

    return useQuery({
        queryKey: ["auth"],
        queryFn: async () => {
            try {
                const response = await axios.get<AzureClaims>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`, {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const azureClaimKeys: (keyof AzureClaims)[] = ['exp', 'iat', 'nbf', 'sub', 'given_name', 'unique_name', 'oid'];
                const user = Object.fromEntries(
                    Object.entries(response.data).filter(([key]) => 
                        azureClaimKeys.includes(key as keyof AzureClaims)
                    )
                ) as AzureClaims;
                dispatch(setUser(user));
                dispatch(setIsAuthorized(true));
                return response.data;
            } catch (error) {
                dispatch(setIsAuthorized(false))
                throw new Error("Unauthorized");
            }
        },
    });
};

