import open from "open";
import {apiClient} from "./apiClient";
import { getErrorMessage } from "./httpErrors";

export const openUpgradeCheckout = async()=>{
    const response = await apiClient.billing.checkout.$post();
    if (response.ok) {
        const data = await response.json();
        await open(data.url);
        return;
    }
    throw new Error(await getErrorMessage(response));
}

export const openBillingPortal = async()=>{
    const response = await apiClient.billing.portal.$post();
    if (response.ok) {
        const data = await response.json();
        await open(data.url);
        return;
    }
    throw new Error(await getErrorMessage(response));
}
