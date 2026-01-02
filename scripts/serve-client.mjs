import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import { extname, join, resolve } from "node:path";

const ROOT = resolve(process.cwd(), "build", "client");
const PORT = Number(process.env.PORT ?? 4173);

const CONTENT_TYPES = {
	".css": "text/css; charset=utf-8",
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".png": "image/png",
	".svg": "image/svg+xml; charset=utf-8",
	".webp": "image/webp",
	".woff": "font/woff",
	".woff2": "font/woff2",
};

const pickContentType = (path) => {
	const ext = extname(path);
	return CONTENT_TYPES[ext] ?? "application/octet-stream";
};

const safeJoin = (root, requestPath) => {
	const cleaned = requestPath.split("?")[0]?.split("#")[0] ?? "/";
	const sanitized = cleaned.startsWith("/") ? cleaned.slice(1) : cleaned;
	return join(root, sanitized);
};

const readFileOrNull = async (path) => {
	try {
		return await fs.readFile(path);
	} catch {
		return null;
	}
};

const serveFallback = async (res) => {
	const spaFallback = await readFileOrNull(join(ROOT, "__spa-fallback.html"));
	if (spaFallback) {
		res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
		res.end(spaFallback);
		return;
	}
	const indexHtml = await readFileOrNull(join(ROOT, "index.html"));
	if (indexHtml) {
		res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
		res.end(indexHtml);
		return;
	}
	res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
	res.end("ファイルが見つかりませんでした。");
};

const server = createServer(async (req, res) => {
	if (!req.url) {
		res.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
		res.end("不正なリクエストです。");
		return;
	}

	const filePath = safeJoin(ROOT, req.url);
	const file = await readFileOrNull(filePath);
	if (file) {
		res.writeHead(200, { "content-type": pickContentType(filePath) });
		res.end(file);
		return;
	}

	await serveFallback(res);
});

server.listen(PORT, () => {
	console.log(`SPA 配信サーバーを起動しました: http://localhost:${PORT}`);
});
