import type { Prize, PrizeList } from "~/common/types";

export type CsvParseResult = {
	prizes: PrizeList;
	skipped: Array<{ id: string; reason: string }>;
};

export const PRIZE_CSV_HEADER = [
	"id",
	"order",
	"prizeName",
	"itemName",
	"imagePath",
	"selected",
	"memo",
] as const;

const parseCsvLine = (line: string): string[] => {
	const result: string[] = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i += 1) {
		const char = line[i];
		if (char === '"') {
			if (inQuotes && line[i + 1] === '"') {
				current += '"';
				i += 1;
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === "," && !inQuotes) {
			result.push(current);
			current = "";
		} else {
			current += char;
		}
	}
	result.push(current);
	return result;
};

const normalizeHeader = (line: string): string[] => parseCsvLine(line).map((value) => value.trim());

const parseBoolean = (value: string): boolean => {
	const normalized = value.trim().toLowerCase();
	return normalized === "true" || normalized === "1" || normalized === "yes";
};

const toNullable = (value: string): string | null => {
	const trimmed = value.trim();
	return trimmed.length === 0 ? null : trimmed;
};

const validateHeader = (values: string[]): boolean => {
	if (values.length !== PRIZE_CSV_HEADER.length) {
		return false;
	}
	return values.every((value, index) => value === PRIZE_CSV_HEADER[index]);
};

export const parsePrizesCsv = (input: string): CsvParseResult => {
	const lines = input
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

	if (lines.length === 0) {
		return { prizes: [], skipped: [] };
	}

	const header = normalizeHeader(lines[0]);
	if (!validateHeader(header)) {
		throw new Error("invalid-csv-header");
	}

	const prizes: PrizeList = [];
	const skipped: Array<{ id: string; reason: string }> = [];
	const seenIds = new Set<string>();

	for (const line of lines.slice(1)) {
		const values = parseCsvLine(line).map((value) => value.trim());
		if (values.length !== header.length) {
			skipped.push({ id: values[0] ?? "", reason: "column-mismatch" });
			continue;
		}

		const [id, orderValue, prizeName, itemName, imagePath, selectedValue, memo] = values;
		if (!id || !prizeName || !itemName) {
			skipped.push({ id: id ?? "", reason: "missing-required" });
			continue;
		}

		if (seenIds.has(id)) {
			skipped.push({ id, reason: "duplicate-id" });
			continue;
		}

		const order = Number.parseInt(orderValue, 10);
		if (Number.isNaN(order)) {
			skipped.push({ id, reason: "invalid-order" });
			continue;
		}

		const prize: Prize = {
			id,
			order,
			prizeName,
			itemName,
			imagePath: toNullable(imagePath),
			selected: parseBoolean(selectedValue),
			memo: toNullable(memo),
		};
		prizes.push(prize);
		seenIds.add(id);
	}

	const normalized = prizes
		.sort((a, b) => a.order - b.order)
		.map<Prize>((prize, index) => ({
			...prize,
			order: index,
		}));

	return { prizes: normalized, skipped };
};

const escapeCsvField = (value: string | null | undefined): string => {
	if (value == null) {
		return "";
	}
	const needsQuote = /[",\n]/.test(value);
	const normalized = value.replace(/"/g, '""');
	return needsQuote ? `"${normalized}"` : normalized;
};

export const generatePrizesCsv = (prizes: PrizeList): string => {
	const header = PRIZE_CSV_HEADER.join(",");
	const rows = prizes
		.sort((a, b) => a.order - b.order)
		.map((prize) =>
			[
				prize.id,
				prize.order.toString(),
				prize.prizeName,
				prize.itemName,
				prize.imagePath ?? "",
				prize.selected ? "true" : "false",
				prize.memo ?? "",
			]
				.map((value) => escapeCsvField(value))
				.join(","),
		);

	return [header, ...rows].join("\n");
};
