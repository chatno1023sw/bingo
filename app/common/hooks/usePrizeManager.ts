import { useContext } from "react";
import { PrizeContext, type PrizeContextValue } from "~/common/contexts/PrizeContext";

export const usePrizeManager = (): PrizeContextValue => {
	const context = useContext(PrizeContext);
	if (!context) {
		throw new Error("usePrizeManager must be used within PrizeProvider");
	}
	return context;
};
