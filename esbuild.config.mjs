import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import { sassPlugin } from 'esbuild-sass-plugin';
import fs from "fs";

const banner =
`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = (process.argv[2] === "production");

// 确保输出目录存在
const outDir = "dist";
if (!fs.existsSync(outDir)){
    fs.mkdirSync(outDir);
}

// 读取资源文件
const renderJS = fs.readFileSync("src/resources/render.js", "utf8");
const renderCSS = fs.readFileSync("src/resources/render.css", "utf8");
const copyButtonJS = fs.readFileSync("src/resources/copy-button.js", "utf8");
const copyButtonCSS = fs.readFileSync("src/resources/copy-button.css", "utf8");

// 构建主文件
esbuild.build({
	banner: {
		js: banner,
	},
	entryPoints: ["src/main.ts"],
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/view",
		"@lezer/common",
		"@lezer/highlight",
		"@lezer/lr",
		...builtins],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	outdir: outDir,
	minify: prod,
	define: {
		'RENDER_JS': JSON.stringify(renderJS),
		'RENDER_CSS': JSON.stringify(renderCSS),
		'COPY_BUTTON_JS': JSON.stringify(copyButtonJS),
		'COPY_BUTTON_CSS': JSON.stringify(copyButtonCSS)
	},
	plugins: [
		sassPlugin()
	],
}).catch(() => process.exit(1));

// 构建样式文件
esbuild.build({
	banner: {
		css: banner,
	},
	entryPoints: ["src/styles.scss"],
	bundle: true,
	outfile: "dist/styles.css",
	plugins: [
		sassPlugin()
	],
}).catch(() => process.exit(1));
