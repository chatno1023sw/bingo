declare module "react-custom-roulette" {
	import type { ComponentType } from "react";

	export type WheelDataItem = {
		option: string;
		style?: {
			backgroundColor?: string;
			textColor?: string;
		};
	};

	export type WheelProps = {
		mustStartSpinning: boolean;
		prizeNumber: number;
		data: WheelDataItem[];
		spinDuration?: number;
		outerBorderColor?: string;
		outerBorderWidth?: number;
		radiusLineColor?: string;
		textDistance?: number;
		onStopSpinning?: () => void;
	};

	export const Wheel: ComponentType<WheelProps>;
}
